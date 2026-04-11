-- Add customer document fields to orders table
ALTER TABLE orders
ADD COLUMN customer_document_type VARCHAR(20),
ADD COLUMN customer_document_number VARCHAR(20);

-- Add comment to document type column
COMMENT ON COLUMN orders.customer_document_type IS 'Document type: DNI, RUC, CE, Passport, etc.';
COMMENT ON COLUMN orders.customer_document_number IS 'Customer document/ID number';

-- Add applied coupon and gift card references to carts table
ALTER TABLE carts
ADD COLUMN applied_coupon_id BIGINT,
ADD COLUMN applied_gift_card_id BIGINT;

-- Add foreign key constraints
ALTER TABLE carts
ADD CONSTRAINT fk_carts_coupon
    FOREIGN KEY (applied_coupon_id)
    REFERENCES coupons(id)
    ON DELETE SET NULL;

ALTER TABLE carts
ADD CONSTRAINT fk_carts_gift_card
    FOREIGN KEY (applied_gift_card_id)
    REFERENCES gift_cards(id)
    ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX idx_carts_applied_coupon ON carts(applied_coupon_id);
CREATE INDEX idx_carts_applied_gift_card ON carts(applied_gift_card_id);
CREATE INDEX idx_orders_document_number ON orders(customer_document_number);
