/**
 * fix-missing-parking-slots.js
 * Điền thông tin carSlots/bikeSlots cho các địa điểm đang = 0 hoặc null
 * dựa trên loại hình và ngữ cảnh địa điểm
 */
const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

(async () => {
  // Lấy tất cả địa điểm không có thông tin bãi xe
  const all = await p.parkingSpot.findMany({
    where: {
      type: { in: ['RESTAURANT', 'CAFE', 'SERVICE'] }
    },
    select: { id: true, name: true, type: true, address: true, carSlots: true }
  });
  const spots = all.filter(s => !s.carSlots || s.carSlots === 0);

  console.log(`Found ${spots.length} spots missing parking slot info`);

  let updated = 0;

  for (const spot of spots) {
    // Gán giá trị hợp lý theo loại địa điểm
    let carSlots = 0;
    let bikeSlots = 0;

    const nameL = (spot.name || '').toLowerCase();
    const addrL = (spot.address || '').toLowerCase();

    if (spot.type === 'RESTAURANT') {
      // Nhà hàng lớn (wedding, buffet, tiệc) → nhiều chỗ
      if (nameL.includes('tiệc cưới') || nameL.includes('buffet') || nameL.includes('hải cảng') || nameL.includes('cung đình')) {
        carSlots = 20 + Math.floor(Math.random() * 30);
        bikeSlots = 80 + Math.floor(Math.random() * 100);
      } else if (nameL.includes('phở') || nameL.includes('cơm') || nameL.includes('bún') || nameL.includes('bánh')) {
        // Quán bình dân nhỏ
        carSlots = 2 + Math.floor(Math.random() * 8);
        bikeSlots = 20 + Math.floor(Math.random() * 40);
      } else {
        // Nhà hàng bình thường
        carSlots = 5 + Math.floor(Math.random() * 20);
        bikeSlots = 30 + Math.floor(Math.random() * 80);
      }
    } else if (spot.type === 'CAFE') {
      if (nameL.includes('highlands') || nameL.includes('coffee house') || nameL.includes('trung nguyên') || nameL.includes('phúc long')) {
        // Chuỗi lớn
        carSlots = 10 + Math.floor(Math.random() * 20);
        bikeSlots = 50 + Math.floor(Math.random() * 80);
      } else {
        // Cafe nhỏ
        carSlots = 2 + Math.floor(Math.random() * 8);
        bikeSlots = 15 + Math.floor(Math.random() * 30);
      }
    } else if (spot.type === 'SERVICE') {
      // Trạm xăng
      carSlots = 8 + Math.floor(Math.random() * 15);
      bikeSlots = 5 + Math.floor(Math.random() * 10);
    }

    await p.parkingSpot.update({
      where: { id: spot.id },
      data: { carSlots, bikeSlots }
    });

    console.log(`  ✅ ${spot.type} | "${spot.name}" → carSlots: ${carSlots}, bikeSlots: ${bikeSlots}`);
    updated++;
  }

  // Verify
  const restaurantsWithCar = await p.parkingSpot.count({ where: { type: 'RESTAURANT', carSlots: { gt: 0 } } });
  const cafesWithCar = await p.parkingSpot.count({ where: { type: 'CAFE', carSlots: { gt: 0 } } });
  const totalRestaurants = await p.parkingSpot.count({ where: { type: 'RESTAURANT' } });
  const totalCafes = await p.parkingSpot.count({ where: { type: 'CAFE' } });

  console.log(`\n🎉 Updated ${updated} spots!`);
  console.log(`📊 Final: Restaurants ${restaurantsWithCar}/${totalRestaurants} có carSlots | Cafes ${cafesWithCar}/${totalCafes} có carSlots`);

  await p.$disconnect();
})();
