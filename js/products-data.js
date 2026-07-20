/* ==========================================================================
   PRODUCTS-DATA.JS — fetches the live product catalog from Supabase
   (every seller's bags) and exposes the same helper functions the rest
   of the site (main.js, shop.html, index.html) already expects.
   ========================================================================== */

let PRODUCTS_DB = [];

/* Maps a Supabase product row (+ joined seller profile) to the shape
   the rest of the site's rendering code expects. */
function mapProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    sub: row.sub || "",
    price: row.price,
    stock: row.stock,
    colors: row.colors || [],
    views: row.images && row.images.length ? row.images : [{ emoji: "👜", img: "", label: "Front" }],
    specs: row.specs || [],
    collections: row.collections || [],
    isBestSeller: (row.collections || []).includes("best-sellers"),
    isNew: (row.collections || []).includes("new"),
    description: row.description || "",
    seller_id: row.seller_id,
    seller_name: row.seller?.shop_name || row.seller?.name || "Bags Hub Seller"
  };
}

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*, seller:profiles(name, shop_name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  PRODUCTS_DB = error ? [] : data.map(mapProductRow);
  document.dispatchEvent(new Event("productsLoaded"));
  return PRODUCTS_DB;
}

async function fetchProductById(id) {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*, seller:profiles(name, shop_name)")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return mapProductRow(data);
}

/* ---------- Synchronous helpers (work off the PRODUCTS_DB cache) ---------- */
function getProductById(id) {
  return PRODUCTS_DB.find(p => p.id === id);
}
function getBestSellers() {
  return PRODUCTS_DB.filter(p => p.isBestSeller);
}
function getNewArrivals() {
  return PRODUCTS_DB.filter(p => p.isNew);
}
function getByCategory(cat) {
  return PRODUCTS_DB.filter(p => p.category === cat);
}
function searchProducts(term) {
  term = term.toLowerCase();
  return PRODUCTS_DB.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.category.toLowerCase().includes(term) ||
    (p.sub || "").toLowerCase().includes(term)
  );
}

loadProducts();
