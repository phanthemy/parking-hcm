const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

(async () => {
  const restaurants = await p.parkingSpot.findMany({
    where: { type: 'RESTAURANT' },
    select: { id: true, name: true, address: true, carSlots: true, bikeSlots: true, pricePerHour: true }
  });

  console.log('=== RESTAURANTS ===');
  console.log('Total:', restaurants.length);
  const withCar = restaurants.filter(r => r.carSlots > 0);
  const withBike = restaurants.filter(r => r.bikeSlots > 0);
  const noPark = restaurants.filter(r => !r.carSlots && !r.bikeSlots);
  console.log('Có chỗ đỗ ô tô (carSlots > 0):', withCar.length);
  console.log('Có chỗ để xe máy (bikeSlots > 0):', withBike.length);
  console.log('Không có thông tin bãi xe:', noPark.length);

  console.log('\n--- Chi tiết có carSlots > 0 ---');
  withCar.forEach(r => console.log(`  ${r.name} | carSlots: ${r.carSlots} | bikeSlots: ${r.bikeSlots}`));

  console.log('\n--- Chi tiết không có bãi xe ---');
  noPark.slice(0, 10).forEach(r => console.log(`  [NO PARK] ${r.name} | ${r.address}`));

  // Also check cafes
  const cafes = await p.parkingSpot.findMany({
    where: { type: 'CAFE' },
    select: { id: true, name: true, carSlots: true, bikeSlots: true }
  });
  const cafesWithCar = cafes.filter(c => c.carSlots > 0);
  console.log(`\n=== CAFES ===`);
  console.log(`Total: ${cafes.length} | Có ô tô: ${cafesWithCar.length}`);

  await p.$disconnect();
})();
