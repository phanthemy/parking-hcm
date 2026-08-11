const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const types = await prisma.parkingSpot.groupBy({
    by: ['type'],
    _count: true
  });
  console.log('Spot Types count:', types);

  const total = await prisma.parkingSpot.count();
  console.log('Total spots:', total);

  const imageCount = await prisma.parkingImage.count();
  console.log('Total images in DB:', imageCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
