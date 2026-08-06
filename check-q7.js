const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();
(async () => {
  // Check Q7 data
  const q7 = await p.parkingSpot.findMany({
    where: { address: { contains: '7' } },
    select: { name: true, type: true, address: true }
  });
  console.log(`Spots with "7" in address: ${q7.length}`);
  q7.forEach(s => console.log(`  ${s.type} | ${s.name} | ${s.address}`));
  
  // Check all unique districts
  const all = await p.parkingSpot.findMany({ select: { address: true } });
  const districts = new Set();
  all.forEach(s => {
    const m = s.address.match(/Qu[aậ]n\s*(\d+|[A-ZĐa-zđÀ-ỹ\s]+)/i);
    if (m) districts.add(m[0].trim());
  });
  console.log('\nDistricts found:', [...districts].sort().join(', '));
  
  await p.$disconnect();
})();
