# MapGo — Quy Trình & Lịch Sử Triển Khai (deployment.md)

## 1. Môi Trường VPS Production
- **Host**: `149.118.62.155` (Ubuntu Oracle Cloud)
- **SSH User**: `ubuntu`
- **SSH Key**: `C:\Users\editor02\.gemini\antigravity\scratch\ORACLE\phanthemy\ssh-key-2026-06-17.key`
- **Database**: PostgreSQL 16 (`parking_hcm` / `chamcong_db`)
- **Web App Path**: `/var/www/parking-hcm`
- **PM2 App Name**: `parking-hcm`
- **Domain**: `baidoxe.nextapp.vn`, `parking.nextapp.vn`

## 2. Quy Trình Triển Khai Chuẩn
1. Build local: `npm run build`
2. Run test: `npm test` hoặc script test API
3. Git sync: `git add . && git commit -m "..." && git push origin main`
4. Deploy to VPS qua SSH: `git pull && npm run build && pm2 restart parking-hcm`
5. Kiểm tra HTTP Status: `curl -I https://baidoxe.nextapp.vn`
6. Kiểm tra giao diện & chức năng thực tế trên trình duyệt
7. Cập nhật nhật ký vào `deployment.md`
