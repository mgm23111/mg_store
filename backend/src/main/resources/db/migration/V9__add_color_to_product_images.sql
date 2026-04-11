-- =====================================================
-- ADD OPTIONAL COLOR REFERENCE TO PRODUCT IMAGES
-- =====================================================
-- Allows assigning images to a specific color while keeping
-- support for generic images (color_id NULL).

ALTER TABLE product_images
ADD COLUMN IF NOT EXISTS color_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_product_images_color'
          AND table_name = 'product_images'
    ) THEN
        ALTER TABLE product_images
        ADD CONSTRAINT fk_product_images_color
        FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_product_images_color_id ON product_images(color_id);

