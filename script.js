document.getElementById('year').textContent = new Date().getFullYear();

const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach((el) => observer.observe(el));

const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* Carrito de compras (checkout vía WhatsApp) */
const WHATSAPP_NUMBER = '13059519784';
const CART_KEY = 'fruitsbypili_cart';

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}
function saveCart(items) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
}

let cart = loadCart();

const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartOpenBtn = document.getElementById('cart-open');
const cartCloseBtn = document.getElementById('cart-close');
const cartBadge = document.getElementById('cart-badge');
const cartList = document.getElementById('cart-list');
const cartEmpty = document.getElementById('cart-empty');
const cartFooter = document.getElementById('cart-footer');
const cartTotalEl = document.getElementById('cart-total');
const cartCheckoutBtn = document.getElementById('cart-checkout');
const cartClearBtn = document.getElementById('cart-clear');

function openCart() {
  cartDrawer.classList.add('is-open');
  cartOverlay.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  cartDrawer.classList.remove('is-open');
  cartOverlay.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

function addToCart(item) {
  const existing = cart.find((i) => i.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart(cart);
  renderCart();
  openCart();
}

function updateQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart(cart);
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}
function cartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

function buildWhatsappLink() {
  const lines = cart.map((i) => `${i.qty} x ${i.title} (US$${i.price} c/u)`).join('\n');
  const message = `Hola Pili, quiero pedir:\n${lines}\n\nTotal: US$${cartTotal()}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function renderCart() {
  const count = cartCount();
  if (count > 0) {
    cartBadge.hidden = false;
    cartBadge.textContent = String(count);
  } else {
    cartBadge.hidden = true;
  }

  if (cart.length === 0) {
    cartEmpty.hidden = false;
    cartList.hidden = true;
    cartFooter.hidden = true;
    return;
  }

  cartEmpty.hidden = true;
  cartList.hidden = false;
  cartFooter.hidden = false;

  cartList.innerHTML = cart.map((item) => `
    <li class="cart-item" data-id="${item.id}">
      <img class="cart-item__img" src="${item.image}" alt="${item.title}">
      <div class="cart-item__info">
        <div class="cart-item__top">
          <span class="cart-item__title">${item.title}</span>
          <span class="cart-item__price">US$ ${item.price * item.qty}</span>
        </div>
        <div class="cart-item__qty">
          <button class="qty-minus" aria-label="Reducir cantidad">−</button>
          <span>${item.qty}</span>
          <button class="qty-plus" aria-label="Aumentar cantidad">+</button>
          <button class="cart-item__remove">Quitar</button>
        </div>
      </div>
    </li>
  `).join('');

  cartList.querySelectorAll('.cart-item').forEach((row) => {
    const id = row.dataset.id;
    row.querySelector('.qty-minus').addEventListener('click', () => updateQty(id, -1));
    row.querySelector('.qty-plus').addEventListener('click', () => updateQty(id, 1));
    row.querySelector('.cart-item__remove').addEventListener('click', () => removeItem(id));
  });

  cartTotalEl.textContent = `US$ ${cartTotal()}`;
  cartCheckoutBtn.href = buildWhatsappLink();
}

document.querySelectorAll('.add-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    addToCart({
      id: btn.dataset.id,
      title: btn.dataset.title,
      price: Number(btn.dataset.price),
      image: btn.dataset.image
    });
  });
});

if (cartOpenBtn) cartOpenBtn.addEventListener('click', openCart);
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
if (cartClearBtn) cartClearBtn.addEventListener('click', () => {
  cart = [];
  saveCart(cart);
  renderCart();
});

renderCart();
