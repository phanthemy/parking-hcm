-- Bật pg_trgm cho tìm kiếm mờ & autocomplete tiếng Việt
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Nâng cấp schema places với confidence score, verification, tags & search vector
ALTER TABLE places ADD COLUMN IF NOT EXISTS confidence_score DOUBLE PRECISION DEFAULT 1.0;
ALTER TABLE places ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE places ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Index Trigram cho Autocomplete & Search siêu tốc
CREATE INDEX IF NOT EXISTS idx_places_name_trgm ON places USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_places_address_trgm ON places USING GIN (address gin_trgm_ops);
