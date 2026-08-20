import psycopg2
import urllib.request
import json
import time

def reverse_geocode_osm(lat, lon):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'MapGoAddressEnricher/1.0 (contact@mapgo.vn)'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            addr = data.get('address', {})
            
            road = addr.get('road') or addr.get('pedestrian') or addr.get('street') or ''
            suburb = addr.get('suburb') or addr.get('quarter') or addr.get('neighbourhood') or ''
            district = addr.get('city_district') or addr.get('county') or addr.get('district') or ''
            city = addr.get('city') or addr.get('state') or 'TP.HCM'
            
            parts = []
            if road:
                parts.append(f"Đường {road}" if not road.lower().startswith('đường') else road)
            if suburb:
                parts.append(f"Phường {suburb}" if not suburb.lower().startswith('phường') and not suburb.lower().startswith('xã') else suburb)
            if district:
                parts.append(district if district.lower().startswith('quận') or district.lower().startswith('huyện') or district.lower().startswith('tp') else f"Quận {district}")
            parts.append(city)
            
            if len(parts) >= 2:
                return ", ".join(parts)
            elif data.get('display_name'):
                return data.get('display_name').split(', TP')[0] + ', TP.HCM'
    except Exception as e:
        pass
    return None

def main():
    conn = psycopg2.connect("postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial")
    cur = conn.cursor()

    cur.execute("SELECT id, name, lat, lon, address FROM places WHERE address LIKE 'Tọa độ%' OR address LIKE 'Khu vực tọa độ%' LIMIT 100;")
    rows = cur.fetchall()
    print(f"Tìm thấy {len(rows)} địa điểm cần chuẩn hóa địa chỉ...")

    updated_count = 0
    for r in rows:
        place_id, name, lat, lon, old_addr = r[0], r[1], r[2], r[3], r[4]
        new_addr = reverse_geocode_osm(lat, lon)
        if new_addr:
            cur.execute("UPDATE places SET address = %s WHERE id = %s;", (new_addr, place_id))
            conn.commit()
            updated_count += 1
            print(f"✓ [{updated_count}] ID {place_id} ({name}):\n    -> Cũ: {old_addr}\n    -> Mới: {new_addr}\n")
            time.sleep(1.1) # Rate limit for Nominatim
        else:
            print(f"x Bỏ qua ID {place_id}")

    cur.close()
    conn.close()
    print(f"\n🎉 Đã cập nhật xong {updated_count} địa chỉ thực tế!")

if __name__ == '__main__':
    main()
