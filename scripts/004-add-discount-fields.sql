-- Add discount price fields to products table
-- Migration: 004-add-discount-fields.sql

-- Add original_price column (nullable, for products with discount)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_price INTEGER;

-- Add discount_percentage column (nullable, calculated field)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER;

-- Add slug column for SEO-friendly URLs (optional but recommended)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.original_price IS 'Original price before discount (in Rupiah). If set, product is on sale.';
COMMENT ON COLUMN products.discount_percentage IS 'Discount percentage (0-100). Can be calculated or set manually.';
COMMENT ON COLUMN products.slug IS 'SEO-friendly URL slug for product detail pages';


