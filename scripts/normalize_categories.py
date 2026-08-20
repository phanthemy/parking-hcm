import psycopg2

conn = psycopg2.connect("postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial")
cur = conn.cursor()

# Chuẩn hóa toàn bộ category thành UPPERCASE
cur.execute("UPDATE places SET category = UPPER(category);")

# Map các category aliases về chuẩn duy nhất
cur.execute("UPDATE places SET category = 'PARKING' WHERE category IN ('PARKING_LOT', 'PARKING');")
cur.execute("UPDATE places SET category = 'EV_CHARGING' WHERE category IN ('EV_CHARGER', 'EV_CHARGING');")
cur.execute("UPDATE places SET category = 'CAR_REPAIR' WHERE category IN ('GARAGE', 'CAR_REPAIR');")
cur.execute("UPDATE places SET category = 'CAR_WASH' WHERE category IN ('CARWASH', 'CAR_WASH');")

conn.commit()

cur.execute("SELECT category, COUNT(*) FROM places WHERE status = 'ACTIVE' GROUP BY category ORDER BY count DESC;")
print("BẢNG CATEGORIES SAU CHUẨN HÓA:")
for r in cur.fetchall():
    print(f"  * {r[0]:<15}: {r[1]} bản ghi")

cur.close()
conn.close()
