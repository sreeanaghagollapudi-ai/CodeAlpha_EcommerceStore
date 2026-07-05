const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "store.db"));

const seedProducts = [
  {
    id: 1,
    name: "Canvas Daypack",
    category: "Bags",
    price: 64.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Durable everyday backpack with padded laptop storage.",
    description:
      "A structured canvas daypack built for commutes, campus days, and weekend errands. It includes a padded 15-inch laptop sleeve, quick-access front pocket, and weather-resistant finish.",
    features: ["18L capacity", "Padded laptop sleeve", "Water-resistant canvas", "Two side pockets"],
    stock: 18
  },
  {
    id: 2,
    name: "Ceramic Pour-Over Set",
    category: "Kitchen",
    price: 42,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Minimal ceramic brewer with matching server.",
    description:
      "Brew bright, clean coffee at home with a ceramic cone, ribbed interior, and a heat-safe glass server. The set works with standard V60-style filters.",
    features: ["Ceramic dripper", "600ml glass server", "Dishwasher safe", "Includes measuring scoop"],
    stock: 23
  },
  {
    id: 3,
    name: "Wireless Desk Lamp",
    category: "Home Office",
    price: 79.5,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Adjustable LED lamp with wireless phone charging.",
    description:
      "A compact desk lamp with warm-to-cool LED modes, touch controls, and a Qi charging pad built into the base for a tidier work surface.",
    features: ["Three color temperatures", "Qi wireless charging", "Dimmable LED", "Fold-flat arm"],
    stock: 12
  },
  {
    id: 4,
    name: "Trail Water Bottle",
    category: "Outdoors",
    price: 28.75,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Insulated stainless bottle for hikes and daily hydration.",
    description:
      "Double-wall insulation keeps drinks cold through long trail days and hot through early starts. The leakproof cap clips easily to packs.",
    features: ["24 oz capacity", "24-hour cold retention", "Leakproof cap", "BPA-free"],
    stock: 35
  },
  {
    id: 5,
    name: "Linen Throw Blanket",
    category: "Home",
    price: 58,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Soft woven blanket for sofa, bed, or reading chair.",
    description:
      "A breathable cotton-linen throw with a subtle woven texture. Sized generously for layering over bedding or keeping close on chilly evenings.",
    features: ["Cotton-linen blend", "Machine washable", "Fringed edge", "50 x 70 inches"],
    stock: 16
  },
  {
    id: 6,
    name: "Bluetooth Speaker Mini",
    category: "Audio",
    price: 49.99,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Portable speaker with punchy sound and long battery life.",
    description:
      "Small enough for a tote, loud enough for a picnic. This splash-resistant speaker pairs quickly and runs up to 14 hours on a single charge.",
    features: ["14-hour battery", "Splash resistant", "USB-C charging", "Built-in microphone"],
    stock: 21
  },
  {
    id: 7,
    name: "Everyday Knit Sneakers",
    category: "Footwear",
    price: 89,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Lightweight sneakers with a breathable knit upper.",
    description:
      "A flexible everyday sneaker with a cushioned midsole, grippy rubber outsole, and a clean profile that works for errands, travel, and casual office days.",
    features: ["Breathable knit upper", "Cushioned midsole", "Rubber traction sole", "Removable insole"],
    stock: 19
  },
  {
    id: 8,
    name: "Noise-Canceling Headphones",
    category: "Audio",
    price: 129.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Over-ear headphones for focused work and travel.",
    description:
      "Comfortable wireless headphones with active noise cancellation, soft ear cushions, and quick charging for long work sessions or flights.",
    features: ["Active noise cancellation", "30-hour battery", "USB-C quick charge", "Foldable design"],
    stock: 14
  },
  {
    id: 9,
    name: "Minimal Steel Watch",
    category: "Accessories",
    price: 118,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Clean analog watch with a stainless steel case.",
    description:
      "A simple everyday watch with a slim stainless steel case, mineral glass face, and comfortable leather strap for dressed-up or casual wear.",
    features: ["Stainless steel case", "Leather strap", "Water resistant", "Japanese quartz movement"],
    stock: 11
  },
  {
    id: 10,
    name: "Polarized Sunglasses",
    category: "Accessories",
    price: 54,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Classic frames with glare-cutting polarized lenses.",
    description:
      "Durable sunglasses with polarized lenses, lightweight frames, and a timeless shape made for bright commutes, beach days, and road trips.",
    features: ["Polarized lenses", "UV400 protection", "Lightweight frame", "Protective case included"],
    stock: 27
  },
  {
    id: 11,
    name: "Hardcover Journal Set",
    category: "Stationery",
    price: 24,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Two ruled notebooks with lay-flat binding.",
    description:
      "A paired journal set with smooth ruled paper, sturdy covers, and lay-flat binding for planning, notes, sketches, and project lists.",
    features: ["Set of two", "Ruled acid-free paper", "Lay-flat binding", "Elastic closure"],
    stock: 34
  },
  {
    id: 12,
    name: "Stoneware Dinner Bowl",
    category: "Kitchen",
    price: 18.5,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Hand-glazed bowl for pasta, salads, and grain bowls.",
    description:
      "A versatile stoneware bowl with a hand-glazed finish and low, wide profile. It stacks neatly and moves easily from weeknight meals to hosting.",
    features: ["Hand-glazed stoneware", "Dishwasher safe", "Microwave safe", "9-inch diameter"],
    stock: 42
  }
];

function run(sql, params = []) {
  const result = db.prepare(sql).run(...params);
  return Promise.resolve({
    changes: result.changes,
    lastID: Number(result.lastInsertRowid || 0)
  });
}

function get(sql, params = []) {
  return Promise.resolve(db.prepare(sql).get(...params));
}

function all(sql, params = []) {
  return Promise.resolve(db.prepare(sql).all(...params));
}

function productFromRow(row) {
  if (!row) return null;
  return {
    ...row,
    features: JSON.parse(row.features || "[]")
  };
}

async function initDb() {
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      rating REAL NOT NULL,
      image TEXT NOT NULL,
      shortDescription TEXT NOT NULL,
      description TEXT NOT NULL,
      features TEXT NOT NULL,
      stock INTEGER NOT NULL
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      token TEXT UNIQUE,
      createdAt TEXT NOT NULL
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId INTEGER NOT NULL,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      address TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  for (const product of seedProducts) {
    await run(
      `INSERT INTO products
        (id, name, category, price, rating, image, shortDescription, description, features, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        price = excluded.price,
        rating = excluded.rating,
        image = excluded.image,
        shortDescription = excluded.shortDescription,
        description = excluded.description,
        features = excluded.features,
        stock = products.stock`,
      [
        product.id,
        product.name,
        product.category,
        product.price,
        product.rating,
        product.image,
        product.shortDescription,
        product.description,
        JSON.stringify(product.features),
        product.stock
      ]
    );
  }
}

module.exports = {
  all,
  db,
  get,
  initDb,
  productFromRow,
  run
};
