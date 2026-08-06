const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();
(async () => {
  // Check restroom addresses
  const wc = await p.parkingSpot.findMany({ where: { type: 'RESTROOM', status: { in: ['active','ACTIVE'] } }, select: { id: true, name: true, address: true }, take: 50 });
  console.log(`=== NHÀ VỆ SINH (${wc.length}) ===`);
  let noAddr = 0;
  wc.forEach(s => {
    const bad = !s.address || s.address === 'Thành phố Hồ Chí Minh' || s.address.length < 20;
    if (bad) noAddr++;
    console.log(`  ${bad ? '❌' : '✅'} ${s.name} | "${s.address}"`);
  });
  console.log(`  → ${noAddr} thiếu địa chỉ cụ thể\n`);

  // Check cafe images
  const cafe = await p.parkingSpot.findMany({ where: { type: 'CAFE', status: { in: ['active','ACTIVE'] } }, select: { id: true, name: true, images: { select: { url: true } } }, take: 50 });
  console.log(`=== CAFE (${cafe.length}) ===`);
  const imgSet = new Set();
  cafe.forEach(s => {
    const urls = s.images.map(i => i.url);
    urls.forEach(u => imgSet.add(u));
    console.log(`  ${urls.length} img | ${s.name} | ${urls[0] ? urls[0].substring(0, 60) + '...' : 'NO IMG'}`);
  });
  console.log(`  → ${imgSet.size} unique images across ${cafe.length} cafes\n`);

  // Check all types image diversity
  const types = ['PARKING_LOT', 'RESTROOM', 'RESTAURANT', 'CAFE', 'SERVICE'];
  for (const t of types) {
    const spots = await p.parkingSpot.findMany({ where: { type: t, status: { in: ['active','ACTIVE'] } }, select: { images: { select: { url: true } } } });
    const urls = new Set();
    let noImg = 0;
    spots.forEach(s => { if (s.images.length === 0) noImg++; s.images.forEach(i => urls.add(i.url)); });
    console.log(`${t}: ${spots.length} spots | ${noImg} no image | ${urls.size} unique imgs`);
  }

  await p.$disconnect();
})();
