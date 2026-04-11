-- =====================================================
-- MG STORE DATABASE SCHEMA
-- E-commerce Platform for Clothing Store
-- =====================================================

-- CATEGORIES TABLE
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COLORS TABLE
CREATE TABLE colors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    hex_code VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SIZES TABLE
CREATE TABLE sizes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(10) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS TABLE
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    retail_price DECIMAL(10, 2) NOT NULL,
    wholesale_price DECIMAL(10, 2),
    wholesale_min_quantity INT DEFAULT 6,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    meta_title VARCHAR(200),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCT IMAGES TABLE
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    is_primary BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCT VARIANTS TABLE (Color + Size + Stock)
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_id BIGINT REFERENCES colors(id) ON DELETE CASCADE,
    size_id BIGINT REFERENCES sizes(id) ON DELETE CASCADE,
    sku VARCHAR(50) UNIQUE,
    stock_quantity INT DEFAULT 0 NOT NULL,
    reserved_quantity INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, color_id, size_id)
);

-- CUSTOMERS TABLE
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    full_name VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADMINS TABLE
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CARTS TABLE (Persistent Backend Carts)
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    session_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CART ITEMS TABLE
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_variant_id)
);

-- SHIPPING METHODS TABLE
CREATE TABLE shipping_methods (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    base_price DECIMAL(10, 2) NOT NULL,
    estimated_days VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS TABLE
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,

    -- Customer Information (Denormalized for History)
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,

    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Status: PENDING, PENDING_YAPE, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    status VARCHAR(50) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP
);

-- ORDER ITEMS TABLE
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE SET NULL,

    -- Product Snapshot (Denormalized)
    product_name VARCHAR(200) NOT NULL,
    color_name VARCHAR(50),
    size_name VARCHAR(10),
    sku VARCHAR(50),

    -- Pricing
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SHIPPING ADDRESSES TABLE
CREATE TABLE shipping_addresses (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Perú',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SHIPPINGS TABLE
CREATE TABLE shippings (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    shipping_method_id BIGINT REFERENCES shipping_methods(id) ON DELETE SET NULL,
    shipping_method_name VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),

    -- Status: PENDING, PROCESSING, SHIPPED, IN_TRANSIT, DELIVERED
    status VARCHAR(50) NOT NULL,

    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PAYMENTS TABLE
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Payment Method: CULQI, YAPE
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,

    -- Status: PENDING, COMPLETED, FAILED, REFUNDED
    status VARCHAR(50) NOT NULL,

    -- Culqi Specific Fields
    culqi_charge_id VARCHAR(100),
    culqi_transaction_id VARCHAR(100),

    -- Yape Specific Fields
    yape_transaction_image_url VARCHAR(500),
    yape_approved_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
    yape_approval_notes TEXT,

    -- Metadata (JSON for additional data)
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- COUPONS TABLE
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,

    -- Type: PERCENTAGE, FIXED_AMOUNT
    type VARCHAR(50) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,

    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_uses INT,
    current_uses INT DEFAULT 0,

    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COUPON USAGE TABLE
CREATE TABLE coupon_usage (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GIFT CARDS TABLE
CREATE TABLE gift_cards (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    initial_balance DECIMAL(10, 2) NOT NULL,
    current_balance DECIMAL(10, 2) NOT NULL,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GIFT CARD TRANSACTIONS TABLE
CREATE TABLE gift_card_transactions (
    id BIGSERIAL PRIMARY KEY,
    gift_card_id BIGINT NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,

    -- Type: CREATION, USAGE, REFUND
    type VARCHAR(50) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WHATSAPP LOGS TABLE
CREATE TABLE whatsapp_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL,

    -- Message Type: ORDER_CONFIRMATION, SHIPPING_UPDATE, etc.
    message_type VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,

    -- Status: SENT, FAILED, PENDING
    status VARCHAR(50) NOT NULL,
    whatsapp_message_id VARCHAR(100),
    error_message TEXT,

    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Products indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);

-- Product variants indexes
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_color ON product_variants(color_id);
CREATE INDEX idx_product_variants_size ON product_variants(size_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

-- Orders indexes
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Payments indexes
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(payment_method);

-- Coupons indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

-- Gift cards indexes
CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_active ON gift_cards(is_active);

-- Cart items indexes
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variant ON cart_items(product_variant_id);

-- WhatsApp logs indexes
CREATE INDEX idx_whatsapp_logs_order ON whatsapp_logs(order_id);
CREATE INDEX idx_whatsapp_logs_status ON whatsapp_logs(status);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE products IS 'Master products table with retail and wholesale pricing';
COMMENT ON TABLE product_variants IS 'Product variants combining color, size, and individual stock tracking';
COMMENT ON TABLE orders IS 'Main orders table with support for multiple payment methods and statuses';
COMMENT ON TABLE payments IS 'Payments table supporting Culqi (automatic) and Yape (manual approval)';
COMMENT ON TABLE coupons IS 'Discount coupons with percentage or fixed amount';
COMMENT ON TABLE gift_cards IS 'Gift cards with balance management and transaction history';
COMMENT ON TABLE whatsapp_logs IS 'Logs for WhatsApp notifications sent to customers';

COMMENT ON COLUMN product_variants.reserved_quantity IS 'Stock reserved for pending orders (not yet paid)';
COMMENT ON COLUMN orders.status IS 'Order status: PENDING, PENDING_YAPE, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED';
COMMENT ON COLUMN payments.payment_method IS 'Payment method: CULQI (automatic), YAPE (manual approval)';
