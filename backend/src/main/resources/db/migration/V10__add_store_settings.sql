-- =====================================================
-- STORE SETTINGS
-- =====================================================

CREATE TABLE store_settings (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO store_settings (id, company_name, logo_url)
VALUES (1, 'MG Store', NULL)
ON CONFLICT (id) DO NOTHING;
