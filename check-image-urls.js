const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

(async () => {
  const images = await p.parkingImage.findMany();
  console.log(`Checking ${images.length} ParkingImage records...`);

  const invalid = [];

  images.forEach(img => {
    if (!img.url || !img.url.startsWith('http')) {
      invalid.push(img);
    }
  });

  console.log(`Found ${invalid.length} invalid ParkingImage URLs:`);
  invalid.forEach(img => {
    console.log(`  ❌ ID: ${img.id} | SpotId: ${img.parkingSpotId} | Invalid URL: "${img.url}"`);
  });

  await p.$disconnect();
})();
