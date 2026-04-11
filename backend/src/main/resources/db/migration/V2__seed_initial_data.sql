-- =====================================================
-- SEED INITIAL DATA FOR MG STORE
-- =====================================================

-- INSERT DEFAULT COLORS
INSERT INTO colors (name, hex_code) VALUES
    ('Negro', '#000000'),
    ('Blanco', '#FFFFFF'),
    ('Gris', '#808080'),
    ('Rojo', '#FF0000'),
    ('Azul', '#0000FF'),
    ('Azul Marino', '#000080'),
    ('Verde', '#008000'),
    ('Amarillo', '#FFFF00'),
    ('Naranja', '#FFA500'),
    ('Rosa', '#FFC0CB'),
    ('Morado', '#800080'),
    ('Beige', '#F5F5DC'),
    ('Café', '#8B4513'),
    ('Celeste', '#87CEEB'),
    ('Vino', '#722F37')
ON CONFLICT (name) DO NOTHING;

-- INSERT DEFAULT SIZES
INSERT INTO sizes (name, sort_order) VALUES
    ('XS', 1),
    ('S', 2),
    ('M', 3),
    ('L', 4),
    ('XL', 5),
    ('XXL', 6),
    ('XXXL', 7)
ON CONFLICT (name) DO NOTHING;

-- INSERT DEFAULT SHIPPING METHODS
INSERT INTO shipping_methods (name, code, base_price, estimated_days, is_active) VALUES
    ('Olva Courier', 'OLVA', 15.00, '2-3 días hábiles', true),
    ('Shalom', 'SHALOM', 12.00, '3-5 días hábiles', true),
    ('Envío Estándar', 'STANDARD', 10.00, '5-7 días hábiles', true),
    ('Recojo en Tienda', 'PICKUP', 0.00, 'Inmediato', true)
ON CONFLICT (code) DO NOTHING;

-- INSERT DEFAULT ADMIN USER
-- Password: admin123 (BCrypt hash)
-- IMPORTANT: Change this password in production!
INSERT INTO admins (email, password_hash, full_name, is_active)
VALUES (
    'admin@mgstore.com',
    '$2a$10$X5wFWtY8/5Z8KpSfEqF8TOxOaL1d9L3zV3aDN0YpKJJZqq5F5F5F5F',
    'Administrador Principal',
    true
)
ON CONFLICT (email) DO NOTHING;

-- INSERT SAMPLE CATEGORY
INSERT INTO categories (name, slug, description, is_active) VALUES
    ('Camisetas', 'camisetas', 'Camisetas de alta calidad para todo tipo de ocasión', true),
    ('Pantalones', 'pantalones', 'Pantalones cómodos y de estilo', true),
    ('Vestidos', 'vestidos', 'Vestidos elegantes para cualquier evento', true),
    ('Accesorios', 'accesorios', 'Complementa tu outfit con nuestros accesorios', true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- NOTES
-- =====================================================
-- Admin credentials for first login:
-- Email: admin@mgstore.com
-- Password: admin123
-- IMPORTANT: Change the password after first login!
