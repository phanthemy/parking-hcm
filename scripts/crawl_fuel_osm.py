import urllib.request
import urllib.parse
import json
import psycopg2
import time
import re

OVERPASS_MIRRORS = [
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter'
]

HCM_BBOX = '10.3,106.3,11.2,107.1'

TARGETS = [
    {'cat': 'fuel', 'query': f'[out:json][timeout:90];(node["amenity"="fuel"]({HCM_BBOX});way["amenity"="fuel"]({HCM_BBOX}););out center;'},
    {'cat': 'car_repair', 'query': f'[out:json][timeout:90];(node["shop"="tyres"]({HCM_BBOX});way["shop"="tyres"]({HCM_BBOX});node["shop"="car_repair"]({HCM_BBOX});way["shop"="car_repair"]({HCM_BBOX}););out center;'},
    {'cat': 'ev_charging', 'query': f'[out:json][timeout:90];(node["amenity"="charging_station"]({HCM_BBOX});way["amenity"="charging_station"]({HCM_BBOX}););out center;'},
    {'cat': 'inspection', 'query': f'[out:json][timeout:90];(node["amenity"="vehicle_inspection"]({HCM_BBOX});way["amenity"="vehicle_inspection"]({HCM_BBOX}););out center;'},
]

def slugify(text, osm_id):
    text = text.lower()
    text = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', text)
    text = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', text)
    text = re.sub(r'[ìíịỉĩ]', 'i', text)
    text = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', text)
    text = re.sub(r'[ùúụủũưừứựửữ]', 'u', text)
    text = re.sub(r'[ỳýỵỷỹ]', 'y', text)
    text = re.sub(r'[đ]', 'd', text)
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return f"{text}-{osm_id}"[:100]

def fetch_overpass_with_fallback(query):
    data_encoded = urllib.parse.urlencode({'data': query}).encode('utf-8')
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MapGoBot/1.0',
        'Accept': 'application/json'
    }

    for url in OVERPASS_MIRRORS:
        try:
            print(f"  -> Thử mirror: {url}...")
            req = urllib.request.Request(url, data=data_encoded, headers=headers)
            with urllib.request.urlopen(req, timeout=60) as resp:
                if resp.status == 200:
                    raw = resp.read().decode('utf-8')
                    res_data = json.loads(raw)
                    return res_data.get('elements', [])
        except Exception as e:
            print(f"     ! Mirror error: {e}")
            time.sleep(2)
    return []

def main():
    conn = psycopg2.connect("postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial")
    cur = conn.cursor()
    print("Connected to PostgreSQL mapgo_spatial via Python!")

    total_added = 0

    for target in TARGETS:
        cat = target['cat']
        print(f"\n[+] Đang cào dữ liệu: {cat.upper()}...")
        elements = fetch_overpass_with_fallback(target['query'])
        print(f"  ✓ Nhận được {len(elements)} records từ Overpass")

        count = 0
        for el in elements:
            lat = el.get('lat') or el.get('center', {}).get('lat')
            lon = el.get('lon') or el.get('center', {}).get('lon')
            tags = el.get('tags', {})

            if not lat or not lon:
                continue

            name = tags.get('name') or tags.get('name:vi') or tags.get('brand') or tags.get('operator')
            if not name:
                if cat == 'fuel': name = 'Cây xăng Petrolimex / PV Oil'
                elif cat == 'inspection': name = 'Trung tâm đăng kiểm xe cơ giới'
                elif cat == 'car_wash': name = 'Tiệm rửa xe'
                elif cat == 'car_repair': name = 'Tiệm sửa xe & vá vỏ ô tô'
                elif cat == 'ev_charging': name = 'Trạm sạc xe điện EV'
                else: name = 'Điểm tiện ích ô tô'

            parts = []
            if tags.get('addr:housenumber'): parts.append(tags['addr:housenumber'])
            if tags.get('addr:street'): parts.append(tags['addr:street'])
            if tags.get('addr:suburb') or tags.get('addr:ward'): parts.append(tags.get('addr:suburb') or tags.get('addr:ward'))
            if tags.get('addr:district'): parts.append(tags['addr:district'])
            if tags.get('addr:city'): parts.append(tags['addr:city'])
            else: parts.append('TP. Hồ Chí Minh')

            address = ', '.join(parts) if len(parts) > 1 else f"Tọa độ ({lat:.4f}, {lon:.4f}), TP.HCM"
            slug = slugify(name, el['id'])
            phone = tags.get('phone') or tags.get('contact:phone')
            open_time = tags.get('opening_hours')

            query = """
                INSERT INTO places (osm_id, slug, name, category, address, lat, lon, phone, open_time, source, metadata)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (slug) DO UPDATE SET
                  name = EXCLUDED.name,
                  address = EXCLUDED.address,
                  lat = EXCLUDED.lat,
                  lon = EXCLUDED.lon,
                  category = EXCLUDED.category;
            """
            cur.execute(query, (
                el['id'], slug, name, cat, address, lat, lon, phone, open_time, 'osm_overpass', json.dumps(tags)
            ))
            count += 1
        
        conn.commit()
        total_added += count
        print(f"  => Đã lưu {count} điểm {cat} vào PostGIS!")
        time.sleep(3)

    cur.execute("SELECT category, COUNT(*) FROM places GROUP BY category ORDER BY count DESC;")
    print("\n========================================================")
    print("      BÁO CÁO TOÀN DIỆN POSTGIS DATABASE MAPGO.VN       ")
    print("========================================================")
    for r in cur.fetchall():
        print(f"* {r[0].upper():<15} : {r[1]} địa điểm")

    cur.execute("SELECT COUNT(*) FROM places;")
    print(f"\n=> TỔNG CỘNG: {cur.fetchone()[0]} ĐỊA ĐIỂM TRONG POSTGIS!")
    
    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
