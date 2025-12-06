-- Add button_text column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Beli Sekarang';
