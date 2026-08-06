#!/usr/bin/env node
/**
 * sync-db.js — Đồng bộ database giữa VPS và máy local
 * 
 * Sử dụng:
 *   node sync-db.js pull   — Tải DB từ VPS về máy local (overwrite local)
 *   node sync-db.js push   — Đẩy DB từ máy local lên VPS (overwrite VPS)
 *   node sync-db.js status — Thống kê số lượng dữ liệu trong DB hiện tại
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('./node_modules/.prisma/client');
const path = require('path');

const VPS_HOST = 'ubuntu@149.118.62.155';
const VPS_DB_PATH = '/var/www/parking-hcm/prisma/dev.db';
const LOCAL_DB_PATH = path.join(__dirname, 'prisma', 'dev.db');
const SSH_KEY = process.env.SSH_KEY || 'C:\\Users\\editor02\\.gemini\\antigravity\\scratch\\ORACLE\\phanthemy\\ssh-key-2026-06-17.key';

const SCP_OPTS = `-o StrictHostKeyChecking=no -i "${SSH_KEY}"`;

async function showStats() {
  const p = new PrismaClient();
  try {
    const total = await p.parkingSpot.count();
    const byType = await p.parkingSpot.groupBy({ by: ['type'], _count: { id: true } });
    const images = await p.parkingImage.count();
    const reviews = await p.review.count();

    console.log('\n📊 THỐNG KÊ DATABASE HIỆN TẠI:');
    console.log('──────────────────────────────────');
    console.log(`  Tổng địa điểm: ${total}`);
    console.log(`  Ảnh địa điểm: ${images}`);
    console.log(`  Đánh giá: ${reviews}`);
    console.log('\nChi tiết theo loại:');
    const icons = { PARKING_LOT: '🅿️', RESTAURANT: '🍜', CAFE: '☕', RESTROOM: '🚻', SERVICE: '🔧' };
    for (const row of byType) {
      const icon = icons[row.type] || '📍';
      console.log(`  ${icon} ${row.type}: ${row._count.id}`);
    }
    console.log('──────────────────────────────────\n');
  } finally {
    await p.$disconnect();
  }
}

function runScp(src, dst) {
  const cmd = `scp -r ${SCP_OPTS} "${src}" "${dst}"`;
  console.log(`⏳ Đang chạy: ${cmd}\n`);
  try {
    execSync(cmd, { stdio: 'inherit', shell: 'powershell.exe' });
    return true;
  } catch (err) {
    console.error(`❌ Lỗi SCP: ${err.message}`);
    return false;
  }
}

(async () => {
  const action = process.argv[2] || 'status';

  console.log('====================================');
  console.log('🔄  MapGo.vn — DB Sync Tool');
  console.log('====================================');

  if (action === 'status') {
    await showStats();
    return;
  }

  if (action === 'pull') {
    console.log(`\n⬇️  PULL: Tải DB từ VPS → Máy local...`);
    console.log(`  Nguồn: ${VPS_HOST}:${VPS_DB_PATH}`);
    console.log(`  Đích:  ${LOCAL_DB_PATH}\n`);
    const ok = runScp(`${VPS_HOST}:${VPS_DB_PATH}`, LOCAL_DB_PATH);
    if (ok) {
      console.log('\n✅ PULL thành công!');
      await showStats();
    }
    return;
  }

  if (action === 'push') {
    console.log(`\n⬆️  PUSH: Đẩy DB từ máy local → VPS...`);
    console.log(`  Nguồn: ${LOCAL_DB_PATH}`);
    console.log(`  Đích:  ${VPS_HOST}:${VPS_DB_PATH}\n`);
    const ok = runScp(LOCAL_DB_PATH, `${VPS_HOST}:${VPS_DB_PATH}`);
    if (ok) {
      // Restart PM2 on VPS
      try {
        execSync(`ssh ${SCP_OPTS.replace('-r', '')} ${VPS_HOST} "pm2 restart parking-hcm --silent"`, {
          stdio: 'inherit', shell: 'powershell.exe'
        });
        console.log('\n✅ PUSH thành công! PM2 đã restart trên VPS.');
      } catch {
        console.log('\n✅ PUSH thành công! (Nhớ restart PM2 trên VPS thủ công)');
      }
      await showStats();
    }
    return;
  }

  console.log(`\n❓ Lệnh không hợp lệ: "${action}"`);
  console.log('Dùng: node sync-db.js [pull|push|status]');
})();
