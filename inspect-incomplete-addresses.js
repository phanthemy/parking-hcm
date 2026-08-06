const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

(async () => {
  const spots = await p.parkingSpot.findMany({
    select: { id: true, name: true, address: true, type: true, lat: true, lng: true }
  });

  console.log(`Analyzing addresses of ${spots.length} spots across all types...\n`);

  const incomplete = [];

  spots.forEach(s => {
    const addr = (s.address || '').trim();
    // Incomplete if starts with a comma, or doesn't have a street name/number (length < 15 or matches generic patterns)
    const isGeneric = addr.startsWith(',') || addr === 'Thành phố Hồ Chí Minh' || /^Quận\s*\d+,\s*TP\.HCM$/i.test(addr) || addr.length < 15;
    if (isGeneric) {
      incomplete.push(s);
    }
  });

  console.log(`Found ${incomplete.length} spots with incomplete/generic addresses:`);
  const byType = {};
  incomplete.forEach(s => {
    byType[s.type] = (byType[s.type] || 0) + 1;
    console.log(`  [${s.type}] ID ${s.id} | Name: "${s.name}" | Addr: "${s.address}" | (${s.lat}, ${s.lng})`);
  });

  console.log('\nIncomplete count by category:', byType);

  await p.$disconnect();
})();
