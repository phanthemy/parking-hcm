const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();
(async () => {
  const total = await p.parkingSpot.count();
  console.log('Total:', total);
  const vivo = await p.parkingSpot.findFirst({ where: { name: { contains: 'Vivo' } } });
  console.log('VivoCity:', vivo ? vivo.name : 'NOT FOUND');
  const q7 = await p.parkingSpot.findMany({ where: { address: { contains: 'Quận 7' } }, select: { name: true, type: true } });
  console.log('Q7 spots:', q7.length);
  q7.forEach(s => console.log(`  ${s.type} | ${s.name}`));
  await p.$disconnect();
})();
