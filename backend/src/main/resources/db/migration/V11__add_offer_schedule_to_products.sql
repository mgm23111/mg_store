-- =====================================================
-- OFFER SCHEDULE FIELDS FOR PRODUCTS
-- =====================================================

ALTER TABLE products
    ADD COLUMN offer_start_at TIMESTAMP NULL,
    ADD COLUMN offer_end_at TIMESTAMP NULL;

CREATE INDEX idx_products_offer_start_at ON products(offer_start_at);
CREATE INDEX idx_products_offer_end_at ON products(offer_end_at);
