#!/usr/bin/env node
/**
 * auto-sync.js — Main orchestrator đồng bộ dữ liệu
 * Chạy Google Maps API trước, sau đó chạy OpenStreetMap
 * 
 * Sử dụng:
 *   node scripts/auto-sync.js [--dry-run] [--source=google|osm]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================
// 🔑 PARSE ARGS & ENV
// ============================
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const sourceArg = args.find(a => a.startsWith('--source='));
const targetSource = sourceArg ? sourceArg.split('=')[1] : 'all';

let GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  try {
    const envPath = path.join(__dirname, '../.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_MAPS_API_KEY=(.*)/);
    if (match) GOOGLE_MAPS_API_KEY = match[1].trim();
  } catch (err) {}
}

const runCommand = (cmd) => {
  try {
    console.log(`\n▶️ Chạy lệnh: ${cmd}`);
    const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    return output;
  } catch (err) {
    console.error(`❌ Lỗi khi chạy lệnh:`);
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
    return err.stdout || '';
  }
};

const extractAddedCount = (output, keyword) => {
  // Parse for specific outputs if we want exactly how many were added
  // For now, let's keep it simple
  return 0; // TBD
};

function writeLog(googleAdded, osmAdded) {
  const logFile = path.join(__dirname, 'sync-log.json');
  const logEntry = {
    timestamp: new Date().toISOString(),
    googleAdded,
    osmAdded,
    totalAdded: googleAdded + osmAdded,
    isDryRun
  };
  
  let logs = [];
  if (fs.existsSync(logFile)) {
    try {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    } catch(e) {}
  }
  logs.push(logEntry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

// ============================
// 🚀 ORCHESTRATOR
// ============================
console.log(`====================================`);
console.log(`🤖 MapGo.vn — Auto Sync Orchestrator`);
if (isDryRun) console.log(`   [CHẾ ĐỘ DRY-RUN]`);
console.log(`====================================\n`);

let googleAdded = 0;
let osmAdded = 0;

// 1. CHẠY GOOGLE MAPS SYNC
if (targetSource === 'all' || targetSource === 'google') {
  if (GOOGLE_MAPS_API_KEY) {
    console.log(`📍 Bắt đầu đồng bộ từ Google Maps...`);
    const cmd = `node ${path.join(__dirname, 'google-places-sync.js')} all 10.7769 106.7009 5000 ${isDryRun ? '--dry-run' : ''}`;
    const out = runCommand(cmd);
    
    // Lấy số lượng thêm từ log nếu có
    const match = out.match(/RESULT_ADDED:(\d+)/);
    if (match) googleAdded = parseInt(match[1], 10);
  } else {
    console.log(`⚠️ Bỏ qua Google Maps do không tìm thấy GOOGLE_MAPS_API_KEY.`);
  }
}

// 2. CHẠY OPENSTREETMAP SYNC
if (targetSource === 'all' || targetSource === 'osm') {
  console.log(`\n📍 Bắt đầu đồng bộ từ OpenStreetMap...`);
  // scrape-overpass.js is in root directory, 5 is radius in km
  // wait, scrape-overpass.js doesn't have dry-run, but let's run it normally
  if (!isDryRun) {
    const cmd = `node ${path.join(__dirname, '../scrape-overpass.js')} all 10.7769 106.7009 5`;
    const out = runCommand(cmd);
    
    // Rough parse of added lines
    const matchAdded = [...out.matchAll(/Thêm (\d+) điểm mới/g)];
    osmAdded = matchAdded.reduce((sum, m) => sum + parseInt(m[1], 10), 0);
  } else {
    console.log(`⚠️ Bỏ qua OSM do script hiện tại không hỗ trợ --dry-run.`);
  }
}

// 3. TỔNG KẾT
console.log(`\n====================================`);
console.log(`📊 TỔNG KẾT ĐỒNG BỘ:`);
console.log(`- Google Maps : ${googleAdded} điểm mới`);
console.log(`- OSM         : ${osmAdded} điểm mới`);
console.log(`- TỔNG CỘNG   : ${googleAdded + osmAdded} điểm mới`);
console.log(`====================================\n`);

if (!isDryRun) {
  writeLog(googleAdded, osmAdded);
  console.log(`✅ Đã lưu kết quả vào scripts/sync-log.json`);
}
