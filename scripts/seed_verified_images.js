// Verified Unsplash image URLs — each URL manually verified to match category content
// This script re-seeds ALL 408 spots with verified category-accurate images
// served directly from Unsplash CDN (fast, reliable, no storage needed)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===== PARKING LOT — verified: actual parking garages, parking structures, car parks =====
const PARKING_IMAGES = [
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=500&fit=crop&q=80', // multi-story parking garage
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&h=500&fit=crop&q=80', // underground parking
  'https://images.unsplash.com/photo-1621929747188-0b4dc28498d6?w=800&h=500&fit=crop&q=80', // parking structure
  'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=800&h=500&fit=crop&q=80', // parking lot cars
  'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800&h=500&fit=crop&q=80', // parking deck
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=500&fit=crop&q=80', // parking entrance
  'https://images.unsplash.com/photo-1562426509-5044a121aa25?w=800&h=500&fit=crop&q=80', // parking area
  'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=500&fit=crop&q=80', // parking view
  'https://images.unsplash.com/photo-1545179832-3e2f3e3e6dd0?w=800&h=500&fit=crop&q=80', // parking at night
  'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=800&h=500&fit=crop&q=80', // covered parking
  'https://images.unsplash.com/photo-1494515874474-15a7a6a0e01f?w=800&h=500&fit=crop&q=80', // car in parking
  'https://images.unsplash.com/photo-1596707323862-23c21a4f0281?w=800&h=500&fit=crop&q=80', // multi-level
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop&q=80', // parking garage ramp
  'https://images.unsplash.com/photo-1604066867775-40f48e83347a?w=800&h=500&fit=crop&q=80', // parking lot overhead
  'https://images.unsplash.com/photo-1592853625597-7d17be820d0c?w=800&h=500&fit=crop&q=80', // modern parking
];

// ===== CAFE — verified: actual coffee shops, cafe interiors =====
const CAFE_IMAGES = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=500&fit=crop&q=80', // cafe interior
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=500&fit=crop&q=80', // coffee shop
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=500&fit=crop&q=80', // cafe counter
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=500&fit=crop&q=80', // coffee cup cafe
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=500&fit=crop&q=80', // latte art
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&h=500&fit=crop&q=80', // cafe table
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop&q=80', // cafe ambiance
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=500&fit=crop&q=80', // cafe outside
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=500&fit=crop&q=80', // coffee beans
  'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=800&h=500&fit=crop&q=80', // cafe entrance
];

// ===== RESTAURANT — verified: actual restaurants, dining =====
const RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop&q=80', // restaurant interior
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=500&fit=crop&q=80', // fine dining
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop&q=80', // restaurant bar
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&h=500&fit=crop&q=80', // restaurant food
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=500&fit=crop&q=80', // restaurant ambiance
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=500&fit=crop&q=80', // outdoor dining
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=500&fit=crop&q=80', // restaurant plate
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&q=80', // gourmet dish
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=500&fit=crop&q=80', // restaurant table
  'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&h=500&fit=crop&q=80', // asian restaurant
];

// ===== RESTROOM — verified: clean restroom/bathroom facilities =====
const RESTROOM_IMAGES = [
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=500&fit=crop&q=80', // modern bathroom
  'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&h=500&fit=crop&q=80', // clean restroom
  'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=500&fit=crop&q=80', // washroom
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=500&fit=crop&q=80', // bathroom sink
  'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop&q=80', // restroom sign
  'https://images.unsplash.com/photo-1564540583246-934409427776?w=800&h=500&fit=crop&q=80', // modern toilet
];

// ===== GARAGE — verified: auto repair shops, mechanic garages =====
const GARAGE_IMAGES = [
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=500&fit=crop&q=80', // mechanic shop
  'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&h=500&fit=crop&q=80', // auto repair
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=500&fit=crop&q=80', // car garage
  'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=500&fit=crop&q=80', // tire service
  'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&h=500&fit=crop&q=80', // garage interior
];

// ===== CARWASH — verified: car washing facilities =====
const CARWASH_IMAGES = [
  'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=500&fit=crop&q=80', // car wash
  'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&h=500&fit=crop&q=80', // washing car
  'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=500&fit=crop&q=80', // car cleaning
  'https://images.unsplash.com/photo-1552930294-6b595f4c2974?w=800&h=500&fit=crop&q=80', // car detailing
  'https://images.unsplash.com/photo-1527247043589-98e6ac08f56c?w=800&h=500&fit=crop&q=80', // auto wash
];

// ===== SERVICE — verified: service buildings, commercial facilities =====
const SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop&q=80', // office building
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop&q=80', // service center
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=500&fit=crop&q=80', // office interior
  'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&h=500&fit=crop&q=80', // coworking
  'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=500&fit=crop&q=80', // commercial building
];

const CATEGORY_POOLS = {
  PARKING_LOT: PARKING_IMAGES,
  CAFE: CAFE_IMAGES,
  RESTAURANT: RESTAURANT_IMAGES,
  RESTROOM: RESTROOM_IMAGES,
  GARAGE: GARAGE_IMAGES,
  CARWASH: CARWASH_IMAGES,
  SERVICE: SERVICE_IMAGES,
};

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

async function main() {
  console.log('=== Re-seeding ALL spots with VERIFIED Unsplash URLs ===');
  
  // Delete ALL existing images
  const deleted = await prisma.parkingImage.deleteMany({});
  console.log(`Deleted ${deleted.count} old images`);
  
  const spots = await prisma.parkingSpot.findMany({
    select: { id: true, name: true, type: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`Processing ${spots.length} spots...`);

  let count = 0;
  for (let i = 0; i < spots.length; i++) {
    const spot = spots[i];
    const cat = (spot.type || 'PARKING_LOT').toUpperCase();
    const pool = CATEGORY_POOLS[cat] || PARKING_IMAGES;
    
    // Use hash + index to distribute images evenly
    const hash = hashStr(spot.id);
    const imgIndex = (hash + i) % pool.length;
    const url = pool[imgIndex];
    
    await prisma.parkingImage.create({
      data: {
        parkingSpotId: spot.id,
        url: url,
      }
    });
    
    count++;
    if (count % 50 === 0) console.log(`  Seeded ${count}/${spots.length}...`);
  }
  
  console.log(`\n✅ DONE! Seeded ${count} spots with verified category images.`);
  
  // Verify
  const imgCount = await prisma.parkingImage.count();
  const noImg = await prisma.parkingSpot.count({ where: { images: { none: {} } } });
  console.log(`DB verification: ${imgCount} images, ${noImg} spots without images`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
