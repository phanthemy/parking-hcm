const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Hàm chuẩn hóa & trích xuất chính xác Quận / Huyện từ địa chỉ
function extractExactDistrict(address) {
  if (!address) return 'Khác';
  const addr = address.trim();

  // 1. Kiểm tra các Huyện ngoại thành trước
  if (/(?:Huyện\s+)?Bình Chánh\b/i.test(addr) && !/Hiệp Bình Chánh/i.test(addr)) return 'Huyện Bình Chánh';
  if (/(?:Huyện\s+)?Hóc Môn\b/i.test(addr)) return 'Huyện Hóc Môn';
  if (/(?:Huyện\s+)?Củ Chi\b/i.test(addr)) return 'Huyện Củ Chi';
  if (/(?:Huyện\s+)?Nhà Bè\b/i.test(addr)) return 'Huyện Nhà Bè';
  if (/(?:Huyện\s+)?Cần Giờ\b/i.test(addr)) return 'Huyện Cần Giờ';

  // 2. TP Thủ Đức (gồm Quận 2, Quận 9, Thủ Đức, Hiệp Bình Chánh, Hiệp Bình Phước...)
  if (/(?:TP|Thành phố)\s*Thủ Đức/i.test(addr) || /\bThủ Đức\b/i.test(addr) || /\bQuận 2\b/i.test(addr) || /\bQuận 9\b/i.test(addr) || /Hiệp Bình/i.test(addr)) {
    return 'TP Thủ Đức';
  }

  // 3. Các quận có số (cần khớp chính xác biên độ từ, tránh 'Quận 1' khớp 'Quận 10', 'Quận 11', 'Quận 12')
  if (/\bQuận\s*12\b/i.test(addr) || /\bQ\.?\s*12\b/i.test(addr)) return 'Quận 12';
  if (/\bQuận\s*11\b/i.test(addr) || /\bQ\.?\s*11\b/i.test(addr)) return 'Quận 11';
  if (/\bQuận\s*10\b/i.test(addr) || /\bQ\.?\s*10\b/i.test(addr)) return 'Quận 10';
  if (/\bQuận\s*1\b/i.test(addr) || /\bQ\.?\s*1\b/i.test(addr)) return 'Quận 1';
  if (/\bQuận\s*3\b/i.test(addr) || /\bQ\.?\s*3\b/i.test(addr)) return 'Quận 3';
  if (/\bQuận\s*4\b/i.test(addr) || /\bQ\.?\s*4\b/i.test(addr)) return 'Quận 4';
  if (/\bQuận\s*5\b/i.test(addr) || /\bQ\.?\s*5\b/i.test(addr)) return 'Quận 5';
  if (/\bQuận\s*6\b/i.test(addr) || /\bQ\.?\s*6\b/i.test(addr)) return 'Quận 6';
  if (/\bQuận\s*7\b/i.test(addr) || /\bQ\.?\s*7\b/i.test(addr)) return 'Quận 7';
  if (/\bQuận\s*8\b/i.test(addr) || /\bQ\.?\s*8\b/i.test(addr)) return 'Quận 8';

  // 4. Các quận có tên chữ
  if (/\bBình Thạnh\b/i.test(addr)) return 'Bình Thạnh';
  if (/\bPhú Nhuận\b/i.test(addr)) return 'Phú Nhuận';
  if (/\bTân Bình\b/i.test(addr) && !/Bình Tân/i.test(addr)) return 'Tân Bình';
  if (/\bBình Tân\b/i.test(addr)) return 'Bình Tân';
  if (/\bTân Phú\b/i.test(addr)) return 'Tân Phú';
  if (/\bGò Vấp\b/i.test(addr)) return 'Gò Vấp';

  return 'Khác';
}

async function run() {
  const spots = await prisma.parkingSpot.findMany({
    select: { id: true, name: true, address: true, type: true }
  });
  console.log(`Total spots in DB: ${spots.length}`);

  const counts = {};
  const sampleMistakes = [];

  for (const s of spots) {
    const dist = extractExactDistrict(s.address);
    counts[dist] = (counts[dist] || 0) + 1;

    // Check false positive on Binh Chanh
    if (dist === 'Huyện Bình Chánh' && s.address.includes('Thủ Đức')) {
      sampleMistakes.push({ name: s.name, address: s.address, assigned: dist });
    }
  }

  console.log('\n--- THỐNG KÊ SPOT THEO TỪNG QUẬN/HUYỆN ---');
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`${k.padEnd(20)} : ${v} spots`);
  });

  if (sampleMistakes.length > 0) {
    console.log('\n❌ Phát hiện sai lệch:', sampleMistakes);
  } else {
    console.log('\n✅ Không có bãi xe Thủ Đức nào bị gán nhầm sang Bình Chánh!');
  }
}

run();
