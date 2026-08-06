const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const CAFE_IMAGES = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1463797221720-6b07e6426c24?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&h=400&fit=crop',
];

const RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop',
];

const PARKING_LOT_IMAGES = [
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1621929747188-0b4dc28498d6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1545179832-3e2f3e3e6dd0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1567449303078-57ad995bd329?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494515874474-15a7a6a0e01f?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1513036191774-b2badb8fcb76?w=600&h=400&fit=crop',
];

const RESTROOM_IMAGES = [
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521783988139-89397d761dce?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1613214049841-55ee23b98e66?w=600&h=400&fit=crop',
];

const SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1528698827591-e19cef791f48?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop',
];

const IMAGE_POOLS = {
  'CAFE': CAFE_IMAGES,
  'RESTAURANT': RESTAURANT_IMAGES,
  'PARKING_LOT': PARKING_LOT_IMAGES,
  'RESTROOM': RESTROOM_IMAGES,
  'SERVICE': SERVICE_IMAGES,
  'CAR_WASH': SERVICE_IMAGES,
  'GAS_STATION': SERVICE_IMAGES,
  'REPAIR_SHOP': SERVICE_IMAGES
};

async function fixRestrooms() {
  console.log("Fixing Restrooms...");
  const restrooms = await prisma.parkingSpot.findMany({
    where: {
      type: 'RESTROOM',
      address: 'Thành phố Hồ Chí Minh'
    }
  });

  console.log(`Found ${restrooms.length} restrooms to fix.`);
  
  for (const spot of restrooms) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${spot.lat}&lon=${spot.lng}&zoom=18&addressdetails=1`;
      const response = await fetch(url, { headers: { 'User-Agent': 'MapGo.vn DB Fix Script' } });
      const data = await response.json();
      
      let newAddress = data.display_name;
      let newName = "WC Công cộng";
      
      if (data.address) {
        const road = data.address.road || data.address.pedestrian || data.address.footway || data.address.suburb || data.address.quarter;
        const district = data.address.city_district || data.address.district || data.address.county || data.address.city;
        
        if (road && district) {
          newName = `WC Công cộng gần ${road}, ${district}`;
        } else if (road) {
          newName = `WC Công cộng gần ${road}`;
        } else if (district) {
          newName = `WC Công cộng tại ${district}`;
        }
      }
      
      await prisma.parkingSpot.update({
        where: { id: spot.id },
        data: {
          name: newName,
          address: newAddress || spot.address
        }
      });
      
      console.log(`Updated ${spot.id}: ${newName}`);
      await sleep(1500); // Nominatim limit: 1 request per second
    } catch (error) {
      console.error(`Error processing spot ${spot.id}:`, error);
    }
  }
}

async function fixImages() {
  console.log("Fixing Images...");
  const spots = await prisma.parkingSpot.findMany({
    include: {
      images: true
    }
  });
  
  const typeCounters = {
    'CAFE': 0,
    'RESTAURANT': 0,
    'PARKING_LOT': 0,
    'RESTROOM': 0,
    'SERVICE': 0,
    'CAR_WASH': 0,
    'GAS_STATION': 0,
    'REPAIR_SHOP': 0
  };
  
  for (const spot of spots) {
    if (!spot.images || spot.images.length === 0) continue;
    
    let type = spot.type;
    let pool = IMAGE_POOLS[type] || IMAGE_POOLS['PARKING_LOT'];
    if (!IMAGE_POOLS[type]) type = 'PARKING_LOT';
    
    for (let i = 0; i < spot.images.length; i++) {
      const image = spot.images[i];
      const newUrl = pool[typeCounters[type] % pool.length];
      
      await prisma.parkingImage.update({
        where: { id: image.id },
        data: { url: newUrl }
      });
      
      typeCounters[type]++;
    }
  }
  
  console.log("Images fixed.");
}

async function main() {
  await fixRestrooms();
  await fixImages();
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
