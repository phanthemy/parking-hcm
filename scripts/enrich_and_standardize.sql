-- Nâng cấp và chuẩn hóa cấu trúc dữ liệu theo review của ChatGPT
ALTER TABLE places ADD COLUMN IF NOT EXISTS confidence_reasons TEXT[] DEFAULT '{}';
ALTER TABLE places ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP;
ALTER TABLE places ADD COLUMN IF NOT EXISTS verification_source TEXT;

-- 1. Chuẩn hóa Type / Category thành Enum đồng nhất
UPDATE places SET category = 'PARKING' WHERE category IN ('parking', 'parking_lot', 'PARKING_LOT');
UPDATE places SET category = 'FUEL' WHERE category IN ('fuel');
UPDATE places SET category = 'EV_CHARGING' WHERE category IN ('ev_charging', 'ev_charger', 'EV_CHARGER');
UPDATE places SET category = 'CAR_REPAIR' WHERE category IN ('car_repair', 'garage', 'GARAGE');
UPDATE places SET category = 'CAR_WASH' WHERE category IN ('car_wash', 'carwash', 'CARWASH');
UPDATE places SET category = 'INSPECTION' WHERE category IN ('inspection');
UPDATE places SET category = 'RESTROOM' WHERE category IN ('restroom');
UPDATE places SET category = 'RESTAURANT' WHERE category IN ('restaurant');
UPDATE places SET category = 'CAFE' WHERE category IN ('cafe');
UPDATE places SET category = 'SERVICE' WHERE category IN ('service');

-- 2. Chuẩn hóa Source enum
UPDATE places SET source = 'OSM' WHERE source = 'osm_overpass';
UPDATE places SET source = 'MANUAL' WHERE source IN ('sqlite_migration', 'manual');
UPDATE places SET source = 'COMMUNITY' WHERE source = 'community';

-- 3. Cập nhật confidence_reasons
UPDATE places SET confidence_reasons = ARRAY[
    CASE WHEN phone IS NOT NULL AND phone != '' THEN 'has_phone' END,
    CASE WHEN address NOT LIKE 'Tọa độ%' AND address NOT LIKE 'Khu vực tọa độ%' THEN 'has_exact_address' END,
    CASE WHEN open_time IS NOT NULL AND open_time != '' THEN 'has_hours' END,
    CASE WHEN verified = true THEN 'manual_verified' END
]::TEXT[]
WHERE status = 'ACTIVE';

-- 4. Làm giàu Metadata mẫu cho các nhóm ô tô cốt lõi
UPDATE places SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{fuel_types}', '["RON95-V", "E5 RON92", "DO 0.001S-V"]'::jsonb)
WHERE category = 'FUEL' AND name ILIKE '%petrolimex%';

UPDATE places SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{connector}', '["CCS2", "Type 2"]'::jsonb)
WHERE category = 'EV_CHARGING';

UPDATE places SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{power_kw}', '120'::jsonb)
WHERE category = 'EV_CHARGING' AND (metadata->>'power_kw' IS NULL);

UPDATE places SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{services}', '["Vá vỏ lưu động", "Cứu hộ 24/7", "Thay nhớt & Phanh"]'::jsonb)
WHERE category = 'CAR_REPAIR';

UPDATE places SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{payment}', '["Tiền mặt", "Chuyển khoản QR", "Thẻ Visa"]'::jsonb)
WHERE category = 'PARKING';
