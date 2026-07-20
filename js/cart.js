/* ==========================================================================
   CART.JS — cart state, persisted in localStorage so it survives
   navigating between index.html / shop.html / product.html / cart.html.

   NOTE: If you're previewing this inside a sandboxed preview window,
   localStorage may be blocked by the sandbox. Once you deploy the real
   files (Netlify, your own hosting, etc.) this works normally in any
   real browser.
   ========================================================================== */

const CART_KEY = "porta_cart_v1";

function getCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    return [];
  }
}

function saveCart(cart){
  try{
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }catch(e){ /* storage unavailable, fail silently */ }
  updateCartBadge();
}

function addToCart(productId, qty, colorName){
  qty = qty || 1;
  const product = getProductById(productId);
  if(!product) return;
  colorName = colorName || (product.colors[0] && product.colors[0].name) || "";
  const cart = getCart();
  const existing = cart.find(c => c.id === productId && c.color === colorName);
  if(existing){
    existing.qty += qty;
  }else{
    cart.push({ id: productId, color: colorName, qty: qty });
  }
  saveCart(cart);
  showToast(product.name + " added to bag");
}

function updateCartQty(productId, colorName, delta){
  const cart = getCart();
  const item = cart.find(c => c.id === productId && c.color === colorName);
  if(!item) return;
  item.qty += delta;
  const filtered = item.qty <= 0 ? cart.filter(c => !(c.id === productId && c.color === colorName)) : cart;
  saveCart(filtered);
  if(typeof renderCartDrawer === "function") renderCartDrawer();
  if(typeof renderCartPage === "function") renderCartPage();
}

function removeFromCart(productId, colorName){
  const cart = getCart().filter(c => !(c.id === productId && c.color === colorName));
  saveCart(cart);
  if(typeof renderCartDrawer === "function") renderCartDrawer();
  if(typeof renderCartPage === "function") renderCartPage();
}

function getCartWithDetails(){
  return getCart().map(c => {
    const product = getProductById(c.id);
    return product ? { ...c, product } : null;
  }).filter(Boolean);
}

function getCartTotal(){
  return getCartWithDetails().reduce((sum, c) => sum + c.product.price * c.qty, 0);
}

function getCartCount(){
  return getCart().reduce((sum, c) => sum + c.qty, 0);
}

function updateCartBadge(){
  const badge = document.getElementById("cartCount");
  if(badge) badge.textContent = getCartCount();
}

function fmtPKR(n){
  return "Rs. " + n.toLocaleString();
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
