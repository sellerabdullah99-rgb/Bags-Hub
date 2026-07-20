/* ==========================================================================
   MAIN.JS — shared UI behavior used on every page:
   product card rendering + hover image-cycle, cart drawer, search overlay,
   mobile menu, bag match quiz, toast notifications.
   ========================================================================== */

/* ---------- Product card rendering (used on index.html + shop.html) ---------- */
function renderMedia(views){
  return views.map((v, i) => {
    const inner = v.img
      ? `<img src="${v.img}" alt="${v.label}" style="width:100%;height:100%;object-fit:cover;">`
      : `<div class="bag-icon" style="font-size:54px;">${v.emoji || "👜"}</div><span class="tag">${v.label}</span>`;
    return `<div class="frame ${i === 0 ? "active" : ""}" data-idx="${i}">${inner}</div>`;
  }).join("");
}

function renderProductCard(p){
  const dots = p.views.map((v, i) => `<span class="${i === 0 ? "on" : ""}"></span>`).join("");
  const swatches = p.colors.map((c, i) =>
    `<span style="background:${c.hex}" class="${i === 0 ? "active" : ""}" title="${c.name}"></span>`
  ).join("");
  const badge = p.isBestSeller ? "Best Seller" : (p.isNew ? "New" : null);
  return `
  <div class="card">
    <a href="product.html?id=${p.id}" style="display:block;">
      <div class="card-media" onmouseenter="cycleStart(this)" onmouseleave="cycleStop(this)">
        ${badge ? `<span class="card-badge">${badge}</span>` : ""}
        <span class="card-wish" onclick="event.preventDefault();">♡</span>
        ${renderMedia(p.views)}
        <div class="dot-row">${dots}</div>
        <div class="add-quick" onclick="event.preventDefault();event.stopPropagation();addToCart('${p.id}',1,null);toggleCart(true);">Quick Add</div>
      </div>
      <div class="card-info">
        <div class="name">${p.name}</div>
        <div class="sub">${p.sub}</div>
        <div class="price">${fmtPKR(p.price)}</div>
        <div class="card-swatches">${swatches}</div>
        ${p.seller_name ? `<div class="sub" style="margin-top:4px; opacity:0.75;">Sold by ${p.seller_name}</div>` : ""}
      </div>
    </a>
  </div>`;
}

function renderProductGrid(containerId, products){
  const el = document.getElementById(containerId);
  if(!el) return;
  if(products.length === 0){
    el.innerHTML = `<div class="empty-state"><h3>No bags here yet</h3><p>Try a different filter or check back soon.</p></div>`;
    return;
  }
  el.innerHTML = products.map(renderProductCard).join("");
}

/* ---------- Hover image-cycle ---------- */
const cycleTimers = new WeakMap();
function cycleStart(el){
  const frames = el.querySelectorAll(".frame");
  const dots = el.querySelectorAll(".dot-row span");
  if(frames.length <= 1) return;
  let idx = 0;
  const timer = setInterval(() => {
    idx = (idx + 1) % frames.length;
    frames.forEach(f => f.classList.remove("active"));
    dots.forEach(d => d.classList.remove("on"));
    frames[idx].classList.add("active");
    dots[idx].classList.add("on");
  }, 750);
  cycleTimers.set(el, timer);
}
function cycleStop(el){
  clearInterval(cycleTimers.get(el));
  const frames = el.querySelectorAll(".frame");
  const dots = el.querySelectorAll(".dot-row span");
  frames.forEach((f, i) => f.classList.toggle("active", i === 0));
  dots.forEach((d, i) => d.classList.toggle("on", i === 0));
}

/* ---------- Cart drawer ---------- */
function renderCartDrawer(){
  const body = document.getElementById("cartBody");
  const foot = document.getElementById("cartFoot");
  if(!body) return;
  const items = getCartWithDetails();
  if(items.length === 0){
    body.innerHTML = `<div class="empty-cart">Your bag is empty.<br>Add something you'll actually use.</div>`;
    if(foot) foot.style.display = "none";
    return;
  }
  body.innerHTML = items.map(c => `
    <div class="cart-line">
      <div class="thumb">${c.product.views[0].img ? `<img src="${c.product.views[0].img}" style="width:100%;height:100%;object-fit:cover;">` : (c.product.views[0].emoji || "👜")}</div>
      <div class="meta">
        <div class="nm">${c.product.name}</div>
        <div class="op">${c.color} · ${fmtPKR(c.product.price)}</div>
        <div class="qty-row">
          <button onclick="updateCartQty('${c.id}','${c.color}',-1)">−</button>
          <span>${c.qty}</span>
          <button onclick="updateCartQty('${c.id}','${c.color}',1)">+</button>
        </div>
      </div>
    </div>`).join("");
  if(foot){
    foot.style.display = "block";
    document.getElementById("cartSubtotal").textContent = fmtPKR(getCartTotal());
  }
}

function toggleCart(open){
  renderCartDrawer();
  document.getElementById("cartDrawer")?.classList.toggle("open", open);
  document.getElementById("overlay")?.classList.toggle("open", open);
}
function toggleSearchBox(open){
  document.getElementById("searchOverlay")?.classList.toggle("open", open);
  if(open) document.getElementById("searchInput")?.focus();
}
function toggleMobileMenu(open){
  document.getElementById("mobileMenu")?.classList.toggle("open", open);
}
function closeAllOverlays(){
  toggleCart(false);
  closeQuiz();
  toggleSearchBox(false);
  toggleMobileMenu(false);
}

/* ---------- Search ---------- */
function runSearch(term){
  const resultsEl = document.getElementById("searchResults");
  if(!resultsEl) return;
  if(!term){ resultsEl.innerHTML = ""; return; }
  const results = searchProducts(term);
  if(results.length === 0){
    resultsEl.innerHTML = `<div class="search-result-item">No bags matched "${term}".</div>`;
    return;
  }
  resultsEl.innerHTML = results.map(p => `
    <a class="search-result-item" href="product.html?id=${p.id}">
      <span>${p.name}</span><span>${fmtPKR(p.price)}</span>
    </a>`).join("");
}

/* ---------- Toast ---------- */
function showToast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Bag Match Quiz ---------- */
const quizSteps = [
  { q: "What's this bag mainly for?", opts: ["Work / office", "College / school", "Travel", "Everyday errands"] },
  { q: "How do you like to carry it?", opts: ["Over the shoulder", "On my back", "Crossbody", "Hand-carry"] },
  { q: "Pick a vibe.", opts: ["Minimal & clean", "Bold color", "Classic neutral"] }
];
let quizStep = 0;
function openQuiz(){
  quizStep = 0;
  renderQuizStep();
  document.getElementById("quizModal")?.classList.add("open");
}
function closeQuiz(){
  document.getElementById("quizModal")?.classList.remove("open");
}
function renderQuizStep(){
  const card = document.getElementById("quizCard");
  if(!card) return;
  if(quizStep >= quizSteps.length){
    const pool = getBestSellers();
    const result = pool[Math.floor(Math.random() * pool.length)];
    card.innerHTML = `
      <button class="quiz-close" onclick="closeQuiz()">✕</button>
      <div class="quiz-result">
        <p class="eyebrow">Your Match</p>
        <div class="bagname">${result.name}</div>
        <p style="color:var(--ink-soft); margin-bottom:20px;">${result.sub} · ${fmtPKR(result.price)}</p>
        <a class="btn btn-dark" href="product.html?id=${result.id}">Shop This Bag</a>
      </div>`;
    return;
  }
  const s = quizSteps[quizStep];
  card.innerHTML = `
    <button class="quiz-close" onclick="closeQuiz()">✕</button>
    <p class="step-label">Question ${quizStep + 1} of ${quizSteps.length}</p>
    <h3>${s.q}</h3>
    ${s.opts.map(o => `<button class="quiz-opt" onclick="quizNext()">${o}</button>`).join("")}
  `;
}
function quizNext(){
  quizStep++;
  renderQuizStep();
}

document.addEventListener("DOMContentLoaded", renderCartDrawer);
