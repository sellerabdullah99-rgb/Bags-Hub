/* ==========================================================================
   CATEGORY-IMAGES.JS
   Paste a Supabase Storage public URL next to any category to show a real
   photo on the homepage's "Shop by Category" tiles. Leave it as "" to keep
   the default color gradient.

   How to get a URL:
   1. Supabase Dashboard → Storage → your bucket (e.g. product-images)
   2. Create a folder called "categories" and upload a square-ish photo
      (e.g. totes.jpg)
   3. Click the uploaded file → "Copy URL" (or "Get public URL")
   4. Paste it below
   ========================================================================== */

const CATEGORY_IMAGES = {
  totes: "",
  backpacks: "",
  crossbody: "",
  "laptop-bags": ""
};

function applyCategoryImages(){
  document.querySelectorAll(".cat-tile[data-cat]").forEach(tile => {
    const cat = tile.dataset.cat;
    const url = CATEGORY_IMAGES[cat];
    if(url){
      const bg = tile.querySelector(".bg");
      if(bg) bg.style.backgroundImage = `url('${url}')`;
      if(bg) bg.style.backgroundSize = "cover";
      if(bg) bg.style.backgroundPosition = "center";
    }
  });
}

document.addEventListener("DOMContentLoaded", applyCategoryImages);
