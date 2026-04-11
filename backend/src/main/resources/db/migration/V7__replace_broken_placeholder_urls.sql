-- =====================================================
-- REPLACE BROKEN PLACEHOLDER IMAGE URLS
-- =====================================================
-- Some environments cannot reach via.placeholder.com.
-- Replace any remaining placeholder URLs with stable picsum URLs.

UPDATE product_images pi
SET url = 'https://picsum.photos/seed/' || COALESCE(p.slug, 'product-' || p.id::text) || '-' || COALESCE(pi.sort_order, 0)::text || '/600/800'
FROM products p
WHERE pi.product_id = p.id
  AND (
    pi.url LIKE 'https://via.placeholder.com/%'
    OR pi.url LIKE 'http://via.placeholder.com/%'
  );

