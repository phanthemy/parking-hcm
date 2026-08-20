import psycopg2
import subprocess
import json
import time

def run():
    conn = psycopg2.connect("postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial")
    cur = conn.cursor()

    print("=================================================================")
    print(" 1. XÁC MINH DATABASE & EXTENSIONS")
    print("=================================================================")
    cur.execute("SELECT version();")
    print(f"- Postgres Version: {cur.fetchone()[0]}")

    cur.execute("SELECT PostGIS_Full_Version();")
    print(f"- PostGIS Version: {cur.fetchone()[0]}")

    cur.execute("SELECT extname FROM pg_extension;")
    exts = [r[0] for r in cur.fetchall()]
    print(f"- Extensions installed: {exts}")

    print("\n=================================================================")
    print(" 2. XÁC MINH CẤU TRÚC BẢNG PLACES (SCHEMA COLUMNS)")
    print("=================================================================")
    cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='places' ORDER BY ordinal_position;")
    cols = cur.fetchall()
    for col in cols:
        print(f"  * {col[0]:<20} : {col[1]}")

    print("\n=================================================================")
    print(" 3. XÁC MINH DỮ LIỆU & PHÂN BỐ DANH MỤC")
    print("=================================================================")
    cur.execute("SELECT COUNT(*) FROM places WHERE status = 'ACTIVE';")
    total_active = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM places WHERE status = 'DUPLICATE';")
    total_dup = cur.fetchone()[0]
    print(f"- Tổng POI Active: {total_active}")
    print(f"- Tổng POI Duplicate (đã khử trùng): {total_dup}")

    cur.execute("SELECT category, COUNT(*) FROM places WHERE status = 'ACTIVE' GROUP BY category ORDER BY count DESC;")
    print("- Phân bố POI sạch theo Category:")
    for r in cur.fetchall():
        print(f"    * {r[0].upper():<15} : {r[1]} POIs")

    print("\n=================================================================")
    print(" 4. XÁC MINH SPATIAL GIST & GIN INDEXES")
    print("=================================================================")
    cur.execute("SELECT indexname, indexdef FROM pg_indexes WHERE tablename='places';")
    for idx in cur.fetchall():
        print(f"  * {idx[0]}:\n    {idx[1]}\n")

    print("\n=================================================================")
    print(" 5. EXPLAIN ANALYZE SPATIAL QUERY (ST_DWithin 1000m)")
    print("=================================================================")
    cur.execute("""
        EXPLAIN ANALYZE
        SELECT id, name, category, address,
               ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326)::geography)::numeric, 1) as dist
        FROM places
        WHERE status = 'ACTIVE'
          AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326)::geography, 1000)
        ORDER BY dist ASC;
    """)
    for plan in cur.fetchall():
        print(f"  {plan[0]}")

    cur.close()
    conn.close()

if __name__ == '__main__':
    run()
