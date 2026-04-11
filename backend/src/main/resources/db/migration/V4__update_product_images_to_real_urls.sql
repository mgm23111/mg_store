-- =====================================================
-- UPDATE PRODUCT IMAGES TO USE REAL IMAGE URLs
-- =====================================================
-- Using picsum.photos for real placeholder images

-- Update Camiseta Basica images
UPDATE product_images SET url = 'https://picsum.photos/seed/camiseta-roja/600/800' WHERE id = 1;
UPDATE product_images SET url = 'https://picsum.photos/seed/camiseta-azul/600/800' WHERE id = 2;
UPDATE product_images SET url = 'https://picsum.photos/seed/camiseta-verde/600/800' WHERE id = 3;

-- Update Polo Deportivo images
UPDATE product_images SET url = 'https://picsum.photos/seed/polo-deportivo/600/800' WHERE id = 4;
UPDATE product_images SET url = 'https://picsum.photos/seed/polo-verde/600/800' WHERE id = 5;

-- Update Jean images
UPDATE product_images SET url = 'https://picsum.photos/seed/jean-clasico/600/800' WHERE id = 6;
UPDATE product_images SET url = 'https://picsum.photos/seed/jean-detalle/600/800' WHERE id = 7;

-- Update Vestido images
UPDATE product_images SET url = 'https://picsum.photos/seed/vestido-elegante/600/800' WHERE id = 8;
UPDATE product_images SET url = 'https://picsum.photos/seed/vestido-rojo/600/800' WHERE id = 9;

-- Update Camisa images
UPDATE product_images SET url = 'https://picsum.photos/seed/camisa-formal/600/800' WHERE id = 10;
