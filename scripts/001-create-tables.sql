-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('produk', 'gratis')),
  image TEXT,
  marketplace_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view products and settings)
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on site_settings" ON site_settings FOR SELECT USING (true);

-- Create policies for public write access (admin password handled in app)
CREATE POLICY "Allow public insert on products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on products" ON products FOR DELETE USING (true);

CREATE POLICY "Allow public insert on site_settings" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on site_settings" ON site_settings FOR UPDATE USING (true);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('siteName', 'HudzStore'),
  ('tagline', 'Produk Digital Terbaik'),
  ('communityLink', 'https://t.me/yourgroup'),
  ('heroTitle', 'Produk Digital Premium'),
  ('heroSubtitle', 'Temukan berbagai produk digital berkualitas dengan harga terjangkau')
ON CONFLICT (key) DO NOTHING;
