-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow anyone to upload product images (for admin)
CREATE POLICY "Allow upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Allow anyone to update product images
CREATE POLICY "Allow update product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images');

-- Allow anyone to delete product images
CREATE POLICY "Allow delete product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');
