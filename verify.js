const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.parkingSpot.groupBy({ by: ['type'], _count: { type: true } });
  console.log("Counts:", c);
  
  const test = await prisma.parkingSpot.findMany({
    where: { name: { contains: 'vệ sinh' } },
    take: 1
  });
  console.log('Tìm nhà vệ sinh:', test.length > 0 ? 'Có kết quả: ' + test[0].name : 'Không có');
}
main().finally(() => prisma.$disconnect());
