const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { all, get, initDb, productFromRow, run } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  const testHash = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), testHash);
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

async function getUserFromRequest(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  return get("SELECT id, name, email FROM users WHERE token = ?", [token]);
}

async function requireUser(req, res, next) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  req.user = user;
  next();
}

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: "Name, email, and a 6+ character password are required." });
  }

  const token = crypto.randomBytes(32).toString("hex");

  try {
    const result = await run(
      "INSERT INTO users (name, email, passwordHash, token, createdAt) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), createPasswordHash(password), token, new Date().toISOString()]
    );
    const user = await get("SELECT id, name, email FROM users WHERE id = ?", [result.lastID]);
    res.status(201).json({ token, user });
  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }
    res.status(500).json({ message: "Unable to create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await get("SELECT * FROM users WHERE email = ?", [(email || "").trim().toLowerCase()]);

  if (!user || !password || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  await run("UPDATE users SET token = ? WHERE id = ?", [token, user.id]);
  res.json({ token, user: publicUser(user) });
});

app.post("/api/auth/logout", requireUser, async (req, res) => {
  await run("UPDATE users SET token = NULL WHERE id = ?", [req.user.id]);
  res.json({ message: "Logged out." });
});

app.get("/api/auth/me", requireUser, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/products", async (req, res) => {
  const category = req.query.category;
  const query = `%${(req.query.q || "").toLowerCase()}%`;
  const params = [];
  const clauses = [];

  if (category && category !== "All") {
    clauses.push("category = ?");
    params.push(category);
  }

  if (req.query.q) {
    clauses.push("(LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(shortDescription) LIKE ?)");
    params.push(query, query, query);
  }

  const rows = await all(`SELECT * FROM products ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}`, params);
  res.json(rows.map(productFromRow));
});

app.get("/api/products/:id", async (req, res) => {
  const product = productFromRow(await get("SELECT * FROM products WHERE id = ?", [Number(req.params.id)]));

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

app.post("/api/orders", requireUser, async (req, res) => {
  const { customer, items } = req.body;

  if (!customer || !customer.name || !customer.email || !customer.address) {
    return res.status(400).json({ message: "Customer name, email, and address are required." });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty." });
  }

  const orderItems = [];

  for (const item of items) {
    const product = productFromRow(await get("SELECT * FROM products WHERE id = ?", [Number(item.id)]));
    const quantity = Number(item.quantity);

    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Cart contains an invalid product or quantity." });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: `${product.name} only has ${product.stock} in stock.` });
    }

    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      lineTotal: Number((product.price * quantity).toFixed(2))
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal > 75 ? 0 : 7.95;
  const tax = Number((subtotal * 0.0825).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  for (const item of orderItems) {
    await run("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.productId]);
  }

  const order = {
    id: `ORD-${Date.now().toString().slice(-7)}`,
    userId: req.user.id,
    customer,
    items: orderItems,
    subtotal: Number(subtotal.toFixed(2)),
    shipping,
    tax,
    total,
    status: "Processing",
    createdAt: new Date().toISOString()
  };

  await run(
    `INSERT INTO orders
      (id, userId, customerName, customerEmail, address, items, subtotal, shipping, tax, total, status, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.id,
      req.user.id,
      customer.name,
      customer.email,
      customer.address,
      JSON.stringify(orderItems),
      order.subtotal,
      order.shipping,
      order.tax,
      order.total,
      order.status,
      order.createdAt
    ]
  );

  res.status(201).json(order);
});

app.get("/api/orders", requireUser, async (req, res) => {
  const rows = await all("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC", [req.user.id]);
  res.json(rows.map(orderFromRow));
});

app.get("/api/orders/:id", requireUser, async (req, res) => {
  const order = orderFromRow(await get("SELECT * FROM orders WHERE id = ? AND userId = ?", [req.params.id, req.user.id]));

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function orderFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId,
    customer: {
      name: row.customerName,
      email: row.customerEmail,
      address: row.address
    },
    items: JSON.parse(row.items || "[]"),
    subtotal: row.subtotal,
    shipping: row.shipping,
    tax: row.tax,
    total: row.total,
    status: row.status,
    createdAt: row.createdAt
  };
}

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Storefront running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to initialize database", error);
    process.exit(1);
  });
