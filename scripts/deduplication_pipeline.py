import psycopg2
import json

def main():
    conn = psycopg2.connect("postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial")
    cur = conn.cursor()
    print("Starting Data Normalization & Deduplication Pipeline...")

    # 1. Chuẩn hóa Categories về chuẩn chữ thường duy nhất
    category_mappings = {
        'PARKING_LOT': 'parking',
        'CARWASH': 'car_wash',
        'GARAGE': 'car_repair',
        'EV_CHARGER': 'ev_charging',
        'RESTROOM': 'restroom',
        'RESTAURANT': 'restaurant',
        'CAFE': 'cafe',
        'SERVICE': 'service',
        'FUEL': 'fuel',
        'INSPECTION': 'inspection'
    }

    for old_cat, new_cat in category_mappings.items():
        cur.execute("UPDATE places SET category = %s WHERE category = %s;", (new_cat, old_cat))
    conn.commit()
    print("✓ Đã chuẩn hóa danh mục category về chuẩn thống nhất!")

    # 2. Tính toán Confidence Score
    cur.execute("""
        UPDATE places SET confidence_score = (
            0.4 -- Base score
            + (CASE WHEN phone IS NOT NULL AND phone != '' THEN 0.3 ELSE 0 END)
            + (CASE WHEN address NOT LIKE 'Khu vực tọa độ%' AND address NOT LIKE 'Tọa độ%' THEN 0.2 ELSE 0 END)
            + (CASE WHEN open_time IS NOT NULL AND open_time != '' THEN 0.1 ELSE 0 END)
        );
    """)
    conn.commit()
    print("✓ Đã tính toán Confidence Score cho toàn bộ POIs!")

    # 3. Thuật toán Deduplication (Khử trùng lặp không gian + tên tương đồng)
    cur.execute("""
        SELECT a.id, b.id, a.name, b.name, a.category,
               ST_Distance(a.geom::geography, b.geom::geography) as dist,
               similarity(a.name, b.name) as name_sim
        FROM places a
        JOIN places b ON a.id < b.id
        WHERE a.status = 'ACTIVE' AND b.status = 'ACTIVE'
          AND a.category = b.category
          AND ST_DWithin(a.geom::geography, b.geom::geography, 35)
          AND (
              similarity(a.name, b.name) > 0.4
              OR a.name ILIKE '%' || b.name || '%'
              OR b.name ILIKE '%' || a.name || '%'
          );
    """)
    duplicates = cur.fetchall()
    print(f"\n🔍 Phát hiện {len(duplicates)} cặp địa điểm trùng lặp gần nhau (< 35m):")

    merged_count = 0
    for d in duplicates:
        id_keep, id_remove = d[0], d[1]
        name_a, name_b = d[2], d[3]
        dist, sim = d[5], d[6]
        
        # Merge và de-activate bản ghi trùng lặp
        cur.execute("UPDATE places SET status = 'DUPLICATE' WHERE id = %s;", (id_remove,))
        merged_count += 1
        print(f"  - Hợp nhất: '{name_a}' (ID: {id_keep}) với '{name_b}' (ID: {id_remove}) [Cách nhau {dist:.1f}m, Độ tương đồng: {sim:.2f}]")

    conn.commit()
    print(f"\n🎉 HOÀN TẤT DEDUPLICATION! Đã loại bỏ/hợp nhất {merged_count} bản ghi trùng.")

    # 4. Thống kê lại sau khi chuẩn hóa & khử trùng
    cur.execute("SELECT category, COUNT(*) FROM places WHERE status = 'ACTIVE' GROUP BY category ORDER BY count DESC;")
    print("\n========================================================")
    print("   BÁO CÁO POI CHUẨN HÓA (CLEAN DATA) TRONG POSTGIS    ")
    print("========================================================")
    for r in cur.fetchall():
        print(f"* {r[0].upper():<15} : {r[1]} địa điểm")

    cur.execute("SELECT COUNT(*) FROM places WHERE status = 'ACTIVE';")
    active_count = cur.fetchone()[0]
    print(f"\n=> TỔNG POI CHUẨN ĐANG HOẠT ĐỘNG: {active_count} ĐỊA ĐIỂM!")

    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
