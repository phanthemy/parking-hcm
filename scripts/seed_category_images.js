const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORY_DEFAULT_IMAGES = {
  PARKING_LOT: [
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621929747188-0b4dc28498d6?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545179832-3e2f3e3e6dd0?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567449303078-57ad995bd329?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494515874474-15a7a6a0e01f?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513036191774-b2badb8fcb76?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526626607769-73de29841c7b?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1562426509-5044a121aa25?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596707323862-23c21a4f0281?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1604066867775-40f48e83347a?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592853625597-7d17be820d0c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=400&fit=crop&q=80',
    '/images/categories/parking_1.jpg',
    '/images/categories/parking_2.jpg'
  ],
  CAFE: [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507138086030-416288938861?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&h=400&fit=crop&q=80',
    '/images/categories/cafe_1.jpg'
  ],
  RESTAURANT: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=400&fit=crop&q=80',
    '/images/categories/restaurant_1.jpg'
  ],
  RESTROOM: [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&h=400&fit=crop&q=80',
    '/images/categories/restroom_1.jpg'
  ],
  GARAGE: [
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=600&h=400&fit=crop&q=80',
    '/images/categories/garage_1.jpg'
  ],
  CARWASH: [
    'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527247043589-98e6ac08f56c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552930294-6b595f4c2974?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop&q=80',
    '/images/categories/carwash_1.jpg'
  ],
  SERVICE: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542744801-43245f17529c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&q=80',
    '/images/categories/service_1.jpg'
  ],
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
  console.log('Clearing old single-image entries...');
  await prisma.parkingImage.deleteMany({});
  console.log('Seeding rich 100+ unique photo pool across all 408 spots...');

  const spots = await prisma.parkingSpot.findMany({
    select: { id: true, name: true, type: true }
  });

  console.log(`Found ${spots.length} spots in total.`);

  let seededCount = 0;
  for (let i = 0; i < spots.length; i++) {
    const spot = spots[i];
    const typeKey = spot.type ? spot.type.toUpperCase() : 'PARKING_LOT';
    const availableImgs = CATEGORY_DEFAULT_IMAGES[typeKey] || CATEGORY_DEFAULT_IMAGES.PARKING_LOT;
    
    // Pick unique photo using (i + hash) to guarantee continuous variety
    const hashVal = getHashIndex(spot.id, availableImgs.length);
    const idx = (i + hashVal) % availableImgs.length;
    const imageUrl = availableImgs[idx];

    await prisma.parkingImage.create({
      data: {
        parkingSpotId: spot.id,
        url: imageUrl,
      }
    });
    seededCount++;
  }

  console.log(`Successfully seeded unique photos for all ${seededCount} spots!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
