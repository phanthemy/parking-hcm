-- Bật PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Bảng Places tổng hợp (Unified Spatial Places)
CREATE TABLE IF NOT EXISTS places (
    id BIGSERIAL PRIMARY KEY,
    osm_id BIGINT,
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- parking, fuel, ev_charging, car_repair, car_wash, rescue, inspection, restroom, cafe, restaurant
    sub_category TEXT,
    address TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    source TEXT DEFAULT 'osm', -- osm, community, overture, manual
    phone TEXT,
    open_time TEXT,
    close_time TEXT,
    price_info TEXT,
    car_slots INT DEFAULT 0,
    bike_slots INT DEFAULT 0,
    rating DOUBLE PRECISION DEFAULT 5.0,
    review_count INT DEFAULT 0,
    metadata JSONB,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tự động tính geom từ lat/lon nếu chưa có
CREATE OR REPLACE FUNCTION set_places_geom() RETURNS trigger AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lon IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lon, NEW.lat), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_places_geom ON places;
CREATE TRIGGER trg_places_geom BEFORE INSERT OR UPDATE OF lat, lon ON places
FOR EACH ROW EXECUTE FUNCTION set_places_geom();

-- Spatial GIST Index cho bán kính < 5ms
CREATE INDEX IF NOT EXISTS idx_places_geom ON places USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_places_category ON places (category);
CREATE INDEX IF NOT EXISTS idx_places_status ON places (status);
CREATE INDEX IF NOT EXISTS idx_places_name ON places (name);

-- Cấp quyền cho user erp
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erp;
