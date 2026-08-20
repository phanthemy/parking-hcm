const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getDistrictFromAddress(address) {
  if (!address) return 'Khu vực khác';
  const addr = address.trim();
  if (/(?:Huyện\s+)?Bình Chánh(?![a-zA-ZÀ-ỹ])/i.test(addr) && !/Hiệp Bình Chánh/i.test(addr)) return 'Bình Chánh';
  if (/(?:Huyện\s+)?Hóc Môn(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Hóc Môn';
  if (/(?:Huyện\s+)?Củ Chi(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Củ Chi';
  if (/(?:Huyện\s+)?Nhà Bè(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Nhà Bè';
  if (/(?:Huyện\s+)?Cần Giờ(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Cần Giờ';
  return 'Khác';
}

async function check() {
  const spots = await prisma.parkingSpot.findMany({
    where: {
      status: { in: ['active', 'ACTIVE'] },
      type: { in: ['PARKING_LOT', 'parking'] }
    },
    select: { id: true, name: true, address: true }
  });

  const districts = ['Bình Chánh', 'Hóc Môn', 'Củ Chi', 'Nhà Bè', 'Cần Giờ'];
  for (const d of districts) {
    const matched = spots.filter(s => getDistrictFromAddress(s.address) === d);
    console.log(`\n[${d}]: ${matched.length} bãi xe`);
    matched.forEach(s => console.log(`  - ${s.name} (📍 ${s.address})`));
  }
}
check();
