/* ==========================================================================
   AUTH.JS — Supabase auth helpers used across every page.
   Handles: sign up (buyer/seller), login, logout, session lookup,
   and injecting "Login / My Account / Sell on Bags Hub" into the header nav.
   ========================================================================== */

async function porta_signUp({ name, email, phone, password, role, shop_name }) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { name, phone, role, shop_name: shop_name || null } }
  });
  return { data, error };
}

async function porta_signIn({ email, password }) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function porta_signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

/* Returns { user, profile } or null if nobody is logged in */
async function porta_getSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return null;
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  if (error) return { user: session.user, profile: null };
  return { user: session.user, profile };
}

/* Call at the top of a page's script to gate access.
   redirectTo defaults to login.html with a return path. */
async function porta_requireAuth(role) {
  const session = await porta_getSession();
  if (!session) {
    window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname + window.location.search);
    return null;
  }
  if (role && session.profile?.role !== role) {
    alert(role === "seller" ? "This page is for seller accounts only." : "This page is for buyer accounts only.");
    window.location.href = "index.html";
    return null;
  }
  return session;
}

/* Injects account/login/sell links into every page's header */
async function porta_injectAuthNav() {
  const session = await porta_getSession();
  const iconsWrap = document.querySelector(".header-icons");
  const navList = document.querySelector("nav.main-nav > ul");
  if (!iconsWrap) return;

  // "Sell on Bags Hub" nav item (only added if not already present)
  if (navList && !document.getElementById("sellNavItem")) {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.id = "sellNavItem";
    li.innerHTML = `<a href="${session && session.profile?.role === "seller" ? "seller-dashboard.html" : "sell.html"}">Sell on Bags Hub</a>`;
    navList.appendChild(li);
  }

  const acctBtn = document.createElement("div");
  acctBtn.style.position = "relative";

  if (session) {
    const firstName = (session.profile?.name || "Account").split(" ")[0];
    acctBtn.innerHTML = `
      <button class="icon-btn" id="acctToggleBtn" title="${session.profile?.name || ""}">👤</button>
    `;
    iconsWrap.insertBefore(acctBtn, iconsWrap.firstChild);
    document.getElementById("acctToggleBtn").addEventListener("click", () => {
      const menu = document.getElementById("acctDropdown");
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    });
    const dropdown = document.createElement("div");
    dropdown.id = "acctDropdown";
    dropdown.style.cssText = "display:none; position:absolute; top:38px; right:0; background:var(--cream-card); border:1px solid var(--line); min-width:180px; padding:10px; z-index:300; border-radius:2px; box-shadow:0 8px 20px rgba(0,0,0,0.1);";
    const dashLink = session.profile?.role === "seller"
      ? `<a href="seller-dashboard.html" style="display:block;padding:8px 6px;font-size:13.5px;">Seller Dashboard</a>`
      : `<a href="my-orders.html" style="display:block;padding:8px 6px;font-size:13.5px;">My Orders</a>`;
    dropdown.innerHTML = `
      <div style="padding:6px;font-size:12px;color:var(--ink-soft);">Signed in as ${session.profile?.name || session.user.email}</div>
      ${dashLink}
      <a href="#" id="signOutLink" style="display:block;padding:8px 6px;font-size:13.5px;color:var(--rust);">Sign Out</a>
    `;
    acctBtn.appendChild(dropdown);
    setTimeout(() => {
      document.getElementById("signOutLink")?.addEventListener("click", (e) => { e.preventDefault(); porta_signOut(); });
    }, 0);
  } else {
    acctBtn.innerHTML = `<a class="icon-btn" href="login.html" style="font-size:13px; text-transform:uppercase; letter-spacing:0.04em; font-weight:600;">Login</a>`;
    iconsWrap.insertBefore(acctBtn, iconsWrap.firstChild);
  }
}

document.addEventListener("DOMContentLoaded", porta_injectAuthNav);
