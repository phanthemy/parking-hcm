const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

(async () => {
  const spot = await p.parkingSpot.findFirst({
    where: { name: { contains: 'Takashimaya' } },
    include: { images: true }
  });
  console.log(JSON.stringify(spot, null, 2));
  await p.$disconnect();
})();
