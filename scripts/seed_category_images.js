const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORY_DEFAULT_IMAGES = {
  PARKING_LOT: ['/images/categories/parking_1.jpg', '/images/categories/parking_2.jpg'],
  CAFE: ['/images/categories/cafe_1.jpg'],
  RESTAURANT: ['/images/categories/restaurant_1.jpg'],
  RESTROOM: ['/images/categories/restroom_1.jpg'],
  GARAGE: ['/images/categories/garage_1.jpg'],
  CARWASH: ['/images/categories/carwash_1.jpg'],
  SERVICE: ['/images/categories/service_1.jpg'],
};

function getHashIndex(str, max) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

async function main() {
  console.log('Seeding category-accurate images for spots without images...');

  const spots = await prisma.parkingSpot.findMany({
    include: { images: true }
  });

  console.log(`Found ${spots.length} spots in total.`);

  let seededCount = 0;
  for (const spot of spots) {
    if (!spot.images || spot.images.length === 0) {
      const typeKey = spot.type ? spot.type.toUpperCase() : 'PARKING_LOT';
      const availableImgs = CATEGORY_DEFAULT_IMAGES[typeKey] || CATEGORY_DEFAULT_IMAGES.PARKING_LOT;
      const idx = getHashIndex(spot.id, availableImgs.length);
      const imageUrl = availableImgs[idx];

      await prisma.parkingImage.create({
        data: {
          parkingSpotId: spot.id,
          url: imageUrl,
          caption: `${spot.name}`,
        }
      });
      seededCount++;
    }
  }

  console.log(`Successfully seeded category images for ${seededCount} spots.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
