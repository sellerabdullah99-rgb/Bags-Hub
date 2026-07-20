-- ============================================================
-- STORAGE POLICIES for the "product-images" bucket
-- Run this in Supabase SQL Editor AFTER creating the bucket.
-- ⚠️ If you named your bucket something other than "product-images",
--    replace 'product-images' everywhere below with your bucket's name.
--
-- Folder convention used by the site: {seller_id}/{filename}
-- e.g. 4599c6ff-0bbc-4cae-9cea-aef5761b62f3/1737288888-front.jpg
-- ============================================================

-- Anyone (even logged-out visitors) can VIEW product images
create policy "Public read access on product-images"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- Any logged-in user can UPLOAD into their own folder (folder name = their user id)
create policy "Sellers can upload their own product images"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Sellers can REPLACE their own images
create policy "Sellers can update their own product images"
on storage.objects for update
using (
  bucket_id = 'product-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Sellers can DELETE their own images
create policy "Sellers can delete their own product images"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
