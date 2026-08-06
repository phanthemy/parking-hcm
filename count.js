const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();
(async () => {
  const c = await p.parkingSpot.groupBy({ by: ['type'], _count: true });
  c.forEach(x => console.log(`  ${x.type}: ${x._count}`));
  const t = await p.parkingSpot.count();
  console.log(`  TOTAL: ${t}`);
  await p.$disconnect();
})();
