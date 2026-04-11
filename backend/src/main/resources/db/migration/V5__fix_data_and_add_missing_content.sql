-- =====================================================
-- FIX DATA AND ADD MISSING CONTENT
-- =====================================================
-- This migration ensures all necessary data is present
-- and fixes any inconsistencies

-- =====================================================
-- ENSURE CATEGORIES EXIST
-- =====================================================
INSERT INTO categories (name, slug, description, is_active) VALUES
    ('Camisetas', 'camisetas', 'Camisetas de alta calidad para todo tipo de ocasión', true),
    ('Pantalones', 'pantalones', 'Pantalones cómodos y de estilo', true),
    ('Vestidos', 'vestidos', 'Vestidos elegantes para cualquier evento', true),
    ('Accesorios', 'accesorios', 'Complementa tu outfit con nuestros accesorios', true),
    ('Polos', 'polos', 'Polos deportivos y casuales de alta calidad', true)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- =====================================================
-- ENSURE ALL PRODUCTS HAVE A VALID CATEGORY
-- =====================================================
-- Assign default category to products without one
UPDATE products
SET category_id = (SELECT id FROM categories WHERE slug = 'camisetas' LIMIT 1)
WHERE category_id IS NULL AND is_active = true;

-- =====================================================
-- ENSURE ALL PRODUCTS HAVE AT LEAST ONE IMAGE
-- =====================================================
-- Add placeholder images for products without images
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT
    p.id,
    'https://picsum.photos/seed/product-' || p.id || '/600/800',
    p.name,
    true,
    1
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
)
AND p.is_active = true
ON CONFLICT DO NOTHING;

-- =====================================================
-- ENSURE ALL PRODUCTS HAVE AT LEAST ONE VARIANT
-- =====================================================
-- Add default variants for products without variants
INSERT INTO product_variants (product_id, color_id, size_id, sku, stock_quantity, reserved_quantity, is_active)
SELECT
    p.id,
    (SELECT id FROM colors WHERE name = 'Negro' LIMIT 1),
    (SELECT id FROM sizes WHERE name = 'M' LIMIT 1),
    'SKU-' || p.id || '-BLK-M',
    50,
    0,
    true
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
)
AND p.is_active = true
ON CONFLICT DO NOTHING;

-- =====================================================
-- ADD SAMPLE COUPONS FOR TESTING
-- =====================================================
INSERT INTO coupons (code, type, value, min_purchase_amount, max_uses, current_uses, valid_from, valid_until, is_active) VALUES
    ('VERANO2024', 'PERCENTAGE', 20, 50.00, 100, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
    ('BIENVENIDA10', 'PERCENTAGE', 10, 0.00, NULL, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
    ('DESC50', 'FIXED_AMOUNT', 50, 200.00, 50, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', true)
ON CONFLICT (code) DO UPDATE SET
    type = EXCLUDED.type,
    value = EXCLUDED.value,
    min_purchase_amount = EXCLUDED.min_purchase_amount,
    valid_until = EXCLUDED.valid_until,
    is_active = EXCLUDED.is_active;

-- =====================================================
-- ADD SAMPLE GIFT CARDS FOR TESTING
-- =====================================================
INSERT INTO gift_cards (code, initial_balance, current_balance, valid_until, is_active) VALUES
    ('GC-2024-TEST100', 100.00, 100.00, CURRENT_DATE + INTERVAL '365 days', true),
    ('GC-2024-TEST50', 50.00, 50.00, CURRENT_DATE + INTERVAL '365 days', true),
    ('GC-2024-TEST25', 25.00, 25.00, CURRENT_DATE + INTERVAL '365 days', true)
ON CONFLICT (code) DO UPDATE SET
    current_balance = EXCLUDED.current_balance,
    valid_until = EXCLUDED.valid_until,
    is_active = EXCLUDED.is_active;

-- =====================================================
-- SUMMARY
-- =====================================================
-- This migration:
-- 1. Ensures all categories exist
-- 2. Assigns categories to products without one
-- 3. Adds placeholder images to products without images
-- 4. Adds default variants to products without variants
-- 5. Creates sample coupons for testing
-- 6. Creates sample gift cards for testing
-- =====================================================
