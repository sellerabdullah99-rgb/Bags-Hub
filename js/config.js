/* ==========================================================================
   CONFIG.JS — Supabase connection settings.

   1. Go to your Supabase project → Project Settings → API
   2. Copy "Project URL" and the "anon public" key
   3. Paste them below. The anon key is safe to expose in frontend code —
      that's how Supabase is designed to work (Row Level Security in the
      database is what actually protects your data, not hiding this key).
   ========================================================================== */

const SUPABASE_URL = "https://wwgxiblqqtzibeszwgrz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z3hpYmxxcXR6aWJlc3p3Z3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MTI1MDIsImV4cCI6MjEwMDA4ODUwMn0.r6yR3XG3igG6cBENasN5t4v56bRx8_I2aPjUYcc-4BA";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Name of the Supabase Storage bucket you created for product photos.
   ⚠️ Change this if your bucket is named something else. */
const STORAGE_BUCKET = "product-images";

const DELIVERY_FEE = 200;
