CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION f_unaccent(text)
  RETURNS text AS $$
SELECT public.unaccent($1);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;

CREATE INDEX IF NOT EXISTS idx_places_name_unaccent_trgm ON places USING GIN (f_unaccent(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_places_address_unaccent_trgm ON places USING GIN (f_unaccent(address) gin_trgm_ops);
