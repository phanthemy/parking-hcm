const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const spots = await prisma.parkingSpot.findMany({
    take: 12,
    include: { images: true }
  });
  console.log('Sample spots & images:');
  spots.forEach(s => console.log(`- ${s.name} (${s.type}): ${s.images[0]?.url}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
