const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("northline-cart") || "[]"),
  user: JSON.parse(localStorage.getItem("northline-user") || "null"),
  token: localStorage.getItem("northline-token"),
  authMode: "login",
  search: "",
  category: "All"
};

const appView = document.querySelector("#appView");
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const cartToggle = document.querySelector("#cartToggle");
const cartClose = document.querySelector("#cartClose");
const cartDrawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#overlay");
const checkoutForm = document.querySelector("#checkoutForm");
const orderMessage = document.querySelector("#orderMessage");
const checkoutNotice = document.querySelector("#checkoutNotice");
const accountToggle = document.querySelector("#accountToggle");
const authModal = document.querySelector("#authModal");
const authClose = document.querySelector("#authClose");
const authForm = document.querySelector("#authForm");
const authTitle = document.querySelector("#authTitle");
const authName = document.querySelector("#authName");
const authSubmit = document.querySelector("#authSubmit");
const authModeToggle = document.querySelector("#authModeToggle");
const authMessage = document.querySelector("#authMessage");
const logoutButton = document.querySelector("#logoutButton");

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

async function fetchProducts() {
  const params = new URLSearchParams();
  if (state.search) params.set("q", state.search);
  if (state.category !== "All") params.set("category", state.category);

  const response = await fetch(`/api/products?${params.toString()}`);
  state.products = await response.json();
  renderProducts();
}

async function fetchProduct(id) {
  appView.innerHTML = `<div class="loading-state">Loading product...</div>`;
  const response = await fetch(`/api/products/${id}`);

  if (!response.ok) {
    appView.innerHTML = `<div class="empty-state">Product not found.</div>`;
    return;
  }

  renderProductDetail(await response.json());
}

async function loadCategories() {
  const response = await fetch("/api/products");
  const products = await response.json();
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  categorySelect.innerHTML = categories.map((category) => `<option>${category}</option>`).join("");
}

function renderProducts() {
  if (state.products.length === 0) {
    appView.innerHTML = `<div class="empty-state">No products matched your filters.</div>`;
    return;
  }

  appView.innerHTML = `
    <section class="product-grid">
      ${state.products
        .map(
          (product) => `
            <article class="product-card">
              <a href="#/products/${product.id}" aria-label="View ${product.name}">
                <img src="${product.image}" alt="${product.name}" />
              </a>
              <div class="product-info">
                <div class="product-meta">
                  <span class="category">${product.category}</span>
                  <span class="rating">${product.rating.toFixed(1)} stars</span>
                </div>
                <h2><a href="#/products/${product.id}">${product.name}</a></h2>
                <p>${product.shortDescription}</p>
                <div class="price-row">
                  <span class="price">${currency.format(product.price)}</span>
                  <button class="primary-button" type="button" data-add="${product.id}">Add</button>
                </div>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderProductDetail(product) {
  appView.innerHTML = `
    <section class="detail-layout">
      <div class="detail-image">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="detail-panel">
        <a class="secondary-button" href="#/">Back to products</a>
        <div class="detail-meta">
          <span class="category">${product.category}</span>
          <span class="rating">${product.rating.toFixed(1)} stars</span>
        </div>
        <h2>${product.name}</h2>
        <p class="detail-copy">${product.description}</p>
        <ul class="feature-list">
          ${product.features.map((feature) => `<li>${feature}</li>`).join("")}
        </ul>
        <div class="detail-actions">
          <strong class="price">${currency.format(product.price)}</strong>
          <button class="primary-button" type="button" data-add="${product.id}">Add to cart</button>
        </div>
        <p class="detail-copy">${product.stock} available</p>
      </div>
    </section>
  `;
}

function addToCart(id) {
  const product = state.products.find((entry) => entry.id === Number(id));
  if (!product) return;

  const existing = state.cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  openCart();
}

function updateQuantity(id, change) {
  const item = state.cart.find((entry) => entry.id === Number(id));
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== Number(id));
  }

  saveCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((entry) => entry.id !== Number(id));
  saveCart();
}

function saveCart() {
  localStorage.setItem("northline-cart", JSON.stringify(state.cart));
  renderCart();
}

function getTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = state.cart.length === 0 || subtotal > 75 ? 0 : 7.95;
  const tax = subtotal * 0.0825;
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

function renderCart() {
  const cartItems = document.querySelector("#cartItems");
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totals = getTotals();

  document.querySelector("#cartCount").textContent = count;
  document.querySelector("#heroTotal").textContent = `${currency.format(totals.subtotal)} in cart`;
  document.querySelector("#subtotal").textContent = currency.format(totals.subtotal);
  document.querySelector("#shipping").textContent = totals.shipping === 0 ? "Free" : currency.format(totals.shipping);
  document.querySelector("#tax").textContent = currency.format(totals.tax);
  document.querySelector("#total").textContent = currency.format(totals.total);
  accountToggle.textContent = state.user ? state.user.name.split(" ")[0] : "Sign in";
  checkoutNotice.textContent = state.user
    ? `Checking out as ${state.user.email}`
    : "Sign in before placing your order.";

  if (state.cart.length === 0) {
    cartItems.innerHTML = `<div class="empty-state">Your cart is empty.</div>`;
    return;
  }

  cartItems.innerHTML = state.cart
    .map(
      (item) => `
        <article class="cart-line">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h3>${item.name}</h3>
            <span>${currency.format(item.price)}</span>
            <div class="line-controls">
              <div class="quantity-control" aria-label="Quantity controls for ${item.name}">
                <button class="quantity-button" type="button" data-qty="${item.id}" data-change="-1">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-button" type="button" data-qty="${item.id}" data-change="1">+</button>
              </div>
              <button class="remove-button" type="button" data-remove="${item.id}">Remove</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

function saveSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("northline-token", token);
  localStorage.setItem("northline-user", JSON.stringify(user));
  renderCart();
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("northline-token");
  localStorage.removeItem("northline-user");
  renderCart();
}

function openAuth() {
  renderAuth();
  authModal.classList.add("open");
  overlay.classList.add("open");
  authModal.setAttribute("aria-hidden", "false");
}

function closeAuth() {
  authModal.classList.remove("open");
  overlay.classList.remove("open");
  authModal.setAttribute("aria-hidden", "true");
}

function renderAuth() {
  const isRegister = state.authMode === "register";
  authTitle.textContent = state.user ? "Signed in" : isRegister ? "Create account" : "Sign in";
  authName.hidden = !isRegister;
  authName.required = isRegister;
  authForm.hidden = Boolean(state.user);
  authSubmit.textContent = isRegister ? "Create account" : "Sign in";
  authModeToggle.hidden = Boolean(state.user);
  authModeToggle.textContent = isRegister ? "I already have an account" : "Create an account";
  logoutButton.hidden = !state.user;
  authMessage.textContent = state.user ? `${state.user.email} is ready for checkout.` : "";
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

async function placeOrder(event) {
  event.preventDefault();
  orderMessage.textContent = "";

  if (!state.user || !state.token) {
    orderMessage.textContent = "Please sign in before placing your order.";
    openAuth();
    return;
  }

  const form = new FormData(checkoutForm);
  const payload = {
    customer: {
      name: form.get("name"),
      email: form.get("email"),
      address: form.get("address")
    },
    items: state.cart.map(({ id, quantity }) => ({ id, quantity }))
  };

  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    orderMessage.textContent = result.message || "Unable to place order.";
    return;
  }

  state.cart = [];
  saveCart();
  checkoutForm.reset();
  orderMessage.textContent = `Order ${result.id} is processing. Total: ${currency.format(result.total)}.`;
  await fetchProducts();
}

async function submitAuth(event) {
  event.preventDefault();
  authMessage.textContent = "";

  const form = new FormData(authForm);
  const payload = {
    name: form.get("name"),
    email: form.get("email"),
    password: form.get("password")
  };
  const endpoint = state.authMode === "register" ? "/api/auth/register" : "/api/auth/login";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json();

  if (!response.ok) {
    authMessage.textContent = result.message || "Unable to sign in.";
    return;
  }

  saveSession(result.token, result.user);
  authForm.reset();
  closeAuth();
}

async function logout() {
  if (state.token) {
    await fetch("/api/auth/logout", { method: "POST", headers: authHeaders() });
  }
  clearSession();
  renderAuth();
}

function route() {
  const detailMatch = window.location.hash.match(/^#\/products\/(\d+)/);

  if (detailMatch) {
    fetchProduct(detailMatch[1]);
    return;
  }

  fetchProducts();
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const qtyButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (addButton) addToCart(addButton.dataset.add);
  if (qtyButton) updateQuantity(qtyButton.dataset.qty, Number(qtyButton.dataset.change));
  if (removeButton) removeFromCart(removeButton.dataset.remove);
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim();
  window.location.hash = "#/";
  fetchProducts();
});

categorySelect.addEventListener("change", (event) => {
  state.category = event.target.value;
  window.location.hash = "#/";
  fetchProducts();
});

cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
accountToggle.addEventListener("click", openAuth);
authClose.addEventListener("click", closeAuth);
authForm.addEventListener("submit", submitAuth);
authModeToggle.addEventListener("click", () => {
  state.authMode = state.authMode === "register" ? "login" : "register";
  renderAuth();
});
logoutButton.addEventListener("click", logout);
overlay.addEventListener("click", () => {
  closeCart();
  closeAuth();
});
checkoutForm.addEventListener("submit", placeOrder);
window.addEventListener("hashchange", route);

loadCategories();
renderCart();
renderAuth();
route();
