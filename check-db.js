const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

(async () => {
  const total = await p.parkingSpot.count();
  const spots = await p.parkingSpot.findMany({ 
    select: { id: true, name: true, type: true, lat: true, lng: true, images: true },
    orderBy: { name: 'asc' }
  });
  
  let noImg = 0;
  const types = {};
  spots.forEach(s => {
    let imgs = [];
    try { imgs = JSON.parse(s.images || '[]'); } catch(e) { imgs = []; }
    if (!imgs || imgs.length === 0) noImg++;
    types[s.type] = (types[s.type] || 0) + 1;
  });
  
  console.log(`Total: ${total} | No images: ${noImg}`);
  console.log('Types:', JSON.stringify(types));
  console.log('\nSample:');
  spots.slice(0, 5).forEach(s => {
    console.log(`  ${s.type} | ${s.name} | imgs: ${s.images}`);
  });
  
  await p.$disconnect();
})();
