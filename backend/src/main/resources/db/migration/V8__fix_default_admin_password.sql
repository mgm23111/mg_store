-- =====================================================
-- FIX DEFAULT ADMIN PASSWORD
-- =====================================================
-- Ensure seeded admin has a valid bcrypt hash for password: admin123

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE admins
SET password_hash = crypt('admin123', gen_salt('bf'))
WHERE email = 'admin@mgstore.com';

