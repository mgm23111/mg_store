-- =====================================================
-- ADD SAMPLE PRODUCTS WITH IMAGES AND VARIANTS
-- =====================================================

-- Ensure base product exists before adding images/variants
INSERT INTO products (name, slug, description, category_id, retail_price, wholesale_price, wholesale_min_quantity, is_active, is_featured)
SELECT
    'Camiseta Basica Essential',
    'camiseta-basica-essential',
    'Camiseta basica de algodon premium para uso diario.',
    id,
    39.90,
    30.00,
    6,
    true,
    true
FROM categories
WHERE slug = 'camisetas'
ON CONFLICT (slug) DO NOTHING;

-- First, add product images for base product without hardcoded IDs
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT
    p.id,
    i.url,
    i.alt_text,
    i.is_primary,
    i.sort_order
FROM products p
CROSS JOIN (
    VALUES
        ('https://via.placeholder.com/600x800/FF6B6B/FFFFFF?text=Camiseta+Basica+Roja', 'Camiseta Basica Roja', true, 1),
        ('https://via.placeholder.com/600x800/4ECDC4/FFFFFF?text=Camiseta+Basica+Azul', 'Camiseta Basica Azul', false, 2),
        ('https://via.placeholder.com/600x800/95E1D3/FFFFFF?text=Camiseta+Basica+Verde', 'Camiseta Basica Verde', false, 3)
) AS i(url, alt_text, is_primary, sort_order)
WHERE p.slug = 'camiseta-basica-essential'
ON CONFLICT DO NOTHING;

-- Add variants for base product (Camiseta basica)
-- Get color and size IDs
INSERT INTO product_variants (product_id, color_id, size_id, sku, stock_quantity, reserved_quantity, is_active)
SELECT
    p.id, -- product_id
    c.id, -- color_id
    s.id, -- size_id
    'CAM-BAS-' || c.name || '-' || s.name, -- sku
    50, -- stock_quantity
    0, -- reserved_quantity
    true -- is_active
FROM products p
CROSS JOIN colors c
CROSS JOIN sizes s
WHERE p.slug = 'camiseta-basica-essential'
  AND c.name IN ('Negro', 'Blanco', 'Gris', 'Rojo', 'Azul')
  AND s.name IN ('S', 'M', 'L', 'XL')
ON CONFLICT DO NOTHING;
-- =====================================================
-- ADD MORE SAMPLE PRODUCTS
-- =====================================================

-- Product 2: Polo Deportivo
INSERT INTO products (name, slug, description, category_id, retail_price, wholesale_price, wholesale_min_quantity, is_active, is_featured)
SELECT
    'Polo Deportivo Premium',
    'polo-deportivo-premium',
    'Polo deportivo de alta calidad, ideal para entrenamientos y actividades físicas. Tela breathable y diseño moderno.',
    id,
    45.00,
    35.00,
    6,
    true,
    true
FROM categories WHERE slug = 'camisetas'
ON CONFLICT (slug) DO NOTHING;

-- Images for Polo Deportivo
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT
    p.id,
    'https://via.placeholder.com/600x800/3498DB/FFFFFF?text=Polo+Deportivo',
    'Polo Deportivo Premium',
    true,
    1
FROM products p WHERE p.slug = 'polo-deportivo-premium'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT
    p.id,
    'https://via.placeholder.com/600x800/2ECC71/FFFFFF?text=Polo+Deportivo+Verde',
    'Polo Deportivo Verde',
    false,
    2
FROM products p WHERE p.slug = 'polo-deportivo-premium'
ON CONFLICT DO NOTHING;

-- Variants for Polo Deportivo
INSERT INTO product_variants (product_id, color_id, size_id, sku, stock_quantity, reserved_quantity, is_active)
SELECT
    p.id,
    c.id,
    s.id,
    'POLO-DEP-' || c.name || '-' || s.name,
    30,
    0,
    true
FROM products p
CROSS JOIN colors c
CROSS JOIN sizes s
WHERE p.slug = 'polo-deportivo-premium'
  AND c.name IN ('Negro', 'Azul', 'Rojo', 'Verde')
  AND s.name IN ('S', 'M', 'L', 'XL', 'XXL')
ON CONFLICT DO NOTHING;

-- Product 3: Jean Clásico
INSERT INTO products (name, slug, description, category_id, retail_price, wholesale_price, wholesale_min_quantity, is_active, is_featured)
SELECT
    'Jean Clásico Azul',
    'jean-clasico-azul',
    'Jean de corte clásico en tela denim de alta calidad. Diseño atemporal y cómodo para uso diario.',
    id,
    89.90,
    70.00,
    6,
    true,
    true
FROM categories WHERE slug = 'pantalones'
ON CONFLICT (slug) DO NOTHING;

-- Images for Jean
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT
    p.id,
    'https://via.placeholder.com/600x800/2C3E50/FFFFFF?text=Jean+Clasico',
    'Jean Clásico Azul',
    true,
    1
FROM products p WHERE p.slug = 'jean-clasico-azul'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT
    p.id,
    'https://via.placeholder.com/600x800/34495E/FFFFFF?text=Jean+Detalle',
    'Jean Clásico Detalle',
    false,
    2
FROM products p WHERE p.slug = 'jean-clasico-azul'
ON CONFLICT DO NOTHING;

-- Variants for Jean
INSERT INTO product_variants (product_id, color_id, size_id, sku, stock_quantity, reserved_quantity, is_active)
SELECT
    p.id,
    c.id,
    s.id,
    'JEAN-CLS-' || c.name || '-' || s.name,
    25,
    0,
    true
FROM products p
CROSS JOIN colors c
CROSS JOIN sizes s
WHERE p.slug = 'jean-clasico-azul'
  AND c.name IN ('Azul Marino', 'Negro', 'Gris')
  AND s.name IN ('S', 'M', 'L', 'XL')
ON CONFLICT DO NOTHING;

-- Product 4: Vestido Elegante
INSERT INTO products (name, slug, description, category_id, retail_price, wholesale_price, wholesale_min_quantity, is_active, is_featured)
SELECT
    'Vestido Elegante Noche',
    'vestido-elegante-noche',
    'Vestido elegante perfecto para eventos nocturnos. Diseño sofisticado y tela de alta calidad que realza la figura.',
    id,
    120.00,
    95.00,
    4,
    true,
    true
FROM categories WHERE slug = 'vestidos'
ON CONFLICT (slug) DO NOTHING;

-- Images for Vestido
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT
    p.id,
    'https://via.placeholder.com/600x800/E74C3C/FFFFFF?text=Vestido+Elegante',
    'Vestido Elegante Noche',
    true,
    1
FROM products p WHERE p.slug = 'vestido-elegante-noche'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT
    p.id,
    'https://via.placeholder.com/600x800/C0392B/FFFFFF?text=Vestido+Rojo',
    'Vestido Rojo Elegante',
    false,
    2
FROM products p WHERE p.slug = 'vestido-elegante-noche'
ON CONFLICT DO NOTHING;

-- Variants for Vestido
INSERT INTO product_variants (product_id, color_id, size_id, sku, stock_quantity, reserved_quantity, is_active)
SELECT
    p.id,
    c.id,
    s.id,
    'VEST-ELE-' || c.name || '-' || s.name,
    15,
    0,
    true
FROM products p
CROSS JOIN colors c
CROSS JOIN sizes s
WHERE p.slug = 'vestido-elegante-noche'
  AND c.name IN ('Negro', 'Rojo', 'Azul Marino', 'Vino')
  AND s.name IN ('XS', 'S', 'M', 'L', 'XL')
ON CONFLICT DO NOTHING;

-- Product 5: Camisa Formal
INSERT INTO products (name, slug, description, category_id, retail_price, wholesale_price, wholesale_min_quantity, is_active, is_featured)
SELECT
    'Camisa Formal Blanca',
    'camisa-formal-blanca',
    'Camisa formal de corte slim fit. Perfecta para eventos formales y uso ejecutivo. Tela de algodón premium.',
    id,
    65.00,
    50.00,
    6,
    true,
    false
FROM categories WHERE slug = 'camisetas'
ON CONFLICT (slug) DO NOTHING;

-- Images for Camisa
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT
    p.id,
    'https://via.placeholder.com/600x800/ECF0F1/333333?text=Camisa+Formal',
    'Camisa Formal Blanca',
    true,
    1
FROM products p WHERE p.slug = 'camisa-formal-blanca'
ON CONFLICT DO NOTHING;

-- Variants for Camisa
INSERT INTO product_variants (product_id, color_id, size_id, sku, stock_quantity, reserved_quantity, is_active)
SELECT
    p.id,
    c.id,
    s.id,
    'CAM-FOR-' || c.name || '-' || s.name,
    40,
    0,
    true
FROM products p
CROSS JOIN colors c
CROSS JOIN sizes s
WHERE p.slug = 'camisa-formal-blanca'
  AND c.name IN ('Blanco', 'Celeste', 'Rosa')
  AND s.name IN ('S', 'M', 'L', 'XL', 'XXL')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Products added: 5 total (1 existing + 4 new)
-- Each product has:
--   - 2-3 images (using placeholder URLs)
--   - Multiple variants (color + size combinations)
--   - Stock available for purchase
-- =====================================================
