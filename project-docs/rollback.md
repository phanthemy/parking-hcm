# MapGo — Kế Hoạch Hoàn Tác (rollback.md)

Tài liệu này cung cấp các bước khôi phục khẩn cấp khi phát sinh sự cố sau deploy.

---

## 1. Rollback Mã Nguồn (Code Rollback)

```bash
# SSH vào VPS
ssh -i "C:\Users\editor02\.gemini\antigravity\scratch\ORACLE\phanthemy\ssh-key-2026-06-17.key" ubuntu@149.118.62.155

# Quay về commit ổn định trước đó
cd /var/www/parking-hcm
git log -n 5 --oneline
git checkout <COMMIT_HASH_TRUOC_DO>

# Rebuild và restart PM2
npm run build
pm2 restart parking-hcm
```

---

## 2. Rollback Cơ Sở Dữ Liệu (Database Rollback)

Nếu migration bảng `user_reports` phát sinh lỗi:

```sql
-- Xóa bảng user_reports an toàn (không ảnh hưởng bảng places)
DROP TABLE IF EXISTS user_reports CASCADE;
```

---

## 3. Khôi Phục Dữ Liệu từ Backup (PostgreSQL Backup Restore)

```bash
# Khôi phục từ snapshot sao lưu gần nhất
sudo -u postgres psql -d mapgo_spatial < /var/backups/mapgo_spatial_backup_latest.sql
```

---

## 4. Kiểm Tra Sau Khi Rollback

```bash
curl -I http://localhost:3003/api/admin/stats
pm2 status parking-hcm
```
