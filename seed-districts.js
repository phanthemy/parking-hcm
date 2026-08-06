const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

// Unsplash images per type
const IMG = {
  PARKING_LOT: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&h=400&fit=crop&q=80',
  RESTROOM: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop&q=80',
  RESTAURANT: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&q=80',
  CAFE: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop&q=80',
  SERVICE: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&q=80',
};

(async () => {
  const users = await p.user.findMany({ take: 1 });
  const ownerId = users[0].id;

  const spots = [
    // === QUẬN 7 ===
    { name: 'Bãi xe SC VivoCity Quận 7', address: '1058 Nguyễn Văn Linh, Quận 7, TP.HCM', lat: 10.7295, lng: 106.7215, type: 'PARKING_LOT', carSlots: 500, bikeSlots: 2000, pricePerHour: 5000, openTime: '09:00', closeTime: '22:00', description: 'Bãi xe SC VivoCity, miễn phí 2h khi mua hàng', isPremium: true },
    { name: 'Bãi xe Crescent Mall Quận 7', address: '101 Tôn Dật Tiên, Quận 7, TP.HCM', lat: 10.7285, lng: 106.7190, type: 'PARKING_LOT', carSlots: 400, bikeSlots: 1500, pricePerHour: 10000, openTime: '09:00', closeTime: '22:00', description: 'Bãi xe TTTM Crescent Mall Phú Mỹ Hưng' },
    { name: 'Bãi xe Lotte Mart Nam Sài Gòn', address: '469 Nguyễn Hữu Thọ, Quận 7, TP.HCM', lat: 10.7385, lng: 106.7125, type: 'PARKING_LOT', carSlots: 300, bikeSlots: 800, pricePerHour: 5000, openTime: '08:00', closeTime: '22:00', description: 'Bãi xe Lotte Mart, rộng rãi' },
    { name: 'WC SC VivoCity Quận 7', address: '1058 Nguyễn Văn Linh, Quận 7, TP.HCM', lat: 10.7298, lng: 106.7220, type: 'RESTROOM', openTime: '09:00', closeTime: '22:00', description: 'Nhà vệ sinh sạch tại SC VivoCity' },
    { name: 'WC Crescent Mall Quận 7', address: '101 Tôn Dật Tiên, Quận 7, TP.HCM', lat: 10.7288, lng: 106.7195, type: 'RESTROOM', openTime: '09:00', closeTime: '22:00', description: 'Nhà vệ sinh Crescent Mall, sạch sẽ' },
    { name: 'Highlands Coffee Crescent Q7', address: 'Crescent Mall, Quận 7, TP.HCM', lat: 10.7290, lng: 106.7188, type: 'CAFE', openTime: '07:00', closeTime: '22:00', description: 'Highlands Coffee tại Crescent Mall Q7' },
    { name: 'Nhà hàng Cơm Niêu Sài Gòn Q7', address: '18 Tôn Dật Tiên, Quận 7, TP.HCM', lat: 10.7300, lng: 106.7200, type: 'RESTAURANT', openTime: '10:00', closeTime: '22:00', description: 'Nhà hàng cơm niêu nổi tiếng Phú Mỹ Hưng', phone: '02854104049' },
    { name: 'Phúc Long SC VivoCity Q7', address: 'SC VivoCity, Quận 7, TP.HCM', lat: 10.7292, lng: 106.7212, type: 'CAFE', openTime: '08:00', closeTime: '22:00', description: 'Trà sữa Phúc Long tại VivoCity Q7' },
    { name: 'Circle K Nguyễn Thị Thập Q7', address: '825 Nguyễn Thị Thập, Quận 7, TP.HCM', lat: 10.7355, lng: 106.7235, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Cửa hàng tiện lợi Circle K 24/7' },
    { name: 'Trạm xăng Petrolimex Huỳnh Tấn Phát Q7', address: '1200 Huỳnh Tấn Phát, Quận 7, TP.HCM', lat: 10.7340, lng: 106.7285, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Trạm xăng Petrolimex mở 24/7' },
    { name: 'Lẩu Hải Sản Biển Đông Q7', address: '65 Nguyễn Lương Bằng, Quận 7, TP.HCM', lat: 10.7310, lng: 106.7180, type: 'RESTAURANT', openTime: '10:00', closeTime: '22:00', description: 'Lẩu hải sản tươi sống Phú Mỹ Hưng' },

    // === QUẬN 2 (THỦ ĐỨC MỚI) ===
    { name: 'Bãi xe Thảo Điền Pearl', address: '12 Quốc Hương, Thảo Điền, TP Thủ Đức', lat: 10.8020, lng: 106.7365, type: 'PARKING_LOT', carSlots: 200, bikeSlots: 500, pricePerHour: 15000, openTime: '06:00', closeTime: '22:00', description: 'Bãi xe cao cấp khu Thảo Điền' },
    { name: 'Bãi xe Mega Mall Thủ Đức', address: '159 Xa Lộ Hà Nội, TP Thủ Đức', lat: 10.8050, lng: 106.7510, type: 'PARKING_LOT', carSlots: 600, bikeSlots: 2000, pricePerHour: 5000, openTime: '09:00', closeTime: '22:00', description: 'Bãi xe Mega Mall rộng lớn', isPremium: true },
    { name: 'The Coffee House Thảo Điền', address: '2 Nguyễn Ư Dĩ, Thảo Điền, TP Thủ Đức', lat: 10.8015, lng: 106.7350, type: 'CAFE', openTime: '07:00', closeTime: '22:30', description: 'The Coffee House khu Thảo Điền' },
    { name: 'Pizza 4Ps Thảo Điền', address: '8 Thảo Điền, TP Thủ Đức', lat: 10.8025, lng: 106.7370, type: 'RESTAURANT', openTime: '10:00', closeTime: '22:00', description: 'Pizza 4Ps chi nhánh Thảo Điền', phone: '02836202494', isPremium: true },
    { name: 'GS25 Thảo Điền', address: '40 Thảo Điền, TP Thủ Đức', lat: 10.8030, lng: 106.7375, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Cửa hàng tiện lợi GS25 24/7' },
    { name: 'WC Mega Mall Thủ Đức', address: '159 Xa Lộ Hà Nội, TP Thủ Đức', lat: 10.8055, lng: 106.7515, type: 'RESTROOM', openTime: '09:00', closeTime: '22:00', description: 'Nhà vệ sinh Mega Mall sạch sẽ' },

    // === QUẬN 9 (THỦ ĐỨC) ===
    { name: 'Bãi xe Vincom Plaza Lê Văn Việt', address: '50 Lê Văn Việt, TP Thủ Đức', lat: 10.8480, lng: 106.7835, type: 'PARKING_LOT', carSlots: 300, bikeSlots: 1000, pricePerHour: 5000, openTime: '08:00', closeTime: '22:00', description: 'Bãi xe Vincom Q9' },
    { name: 'Highlands Coffee Vincom Q9', address: 'Vincom Lê Văn Việt, TP Thủ Đức', lat: 10.8475, lng: 106.7830, type: 'CAFE', openTime: '07:00', closeTime: '22:00', description: 'Highlands Coffee Vincom Q9' },

    // === QUẬN 8 ===
    { name: 'Bãi xe Chợ Phạm Thế Hiển Q8', address: 'Phạm Thế Hiển, Quận 8, TP.HCM', lat: 10.7380, lng: 106.6645, type: 'PARKING_LOT', carSlots: 50, bikeSlots: 300, pricePerHour: 5000, openTime: '06:00', closeTime: '18:00', description: 'Bãi xe khu chợ Q8' },
    { name: 'Circle K Phạm Hùng Q8', address: '338 Phạm Hùng, Quận 8, TP.HCM', lat: 10.7365, lng: 106.6720, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Cửa hàng tiện lợi Circle K 24/7' },
    { name: 'Cơm Tấm Thuận Kiều Q8', address: '190 Dương Bá Trạc, Quận 8, TP.HCM', lat: 10.7400, lng: 106.6680, type: 'RESTAURANT', openTime: '06:00', closeTime: '21:00', description: 'Cơm tấm bình dân Q8' },

    // === QUẬN 6 ===
    { name: 'Bãi xe Chợ Bình Tây Q6', address: '57A Tháp Mười, Quận 6, TP.HCM', lat: 10.7490, lng: 106.6435, type: 'PARKING_LOT', carSlots: 100, bikeSlots: 500, pricePerHour: 5000, openTime: '05:00', closeTime: '18:00', description: 'Bãi xe chợ Bình Tây, chợ sỉ lớn nhất' },
    { name: 'WC Chợ Bình Tây Q6', address: '57A Tháp Mười, Quận 6, TP.HCM', lat: 10.7492, lng: 106.6438, type: 'RESTROOM', openTime: '05:00', closeTime: '18:00', description: 'Nhà vệ sinh trong chợ Bình Tây' },

    // === QUẬN 12 ===
    { name: 'Bãi xe BigC Trường Chinh Q12', address: 'Trường Chinh, Quận 12, TP.HCM', lat: 10.8555, lng: 106.6425, type: 'PARKING_LOT', carSlots: 200, bikeSlots: 800, pricePerHour: 5000, openTime: '08:00', closeTime: '22:00', description: 'Bãi xe BigC Q12' },
    { name: 'Phở Ông Hùng Q12', address: '395 Lê Văn Khương, Quận 12, TP.HCM', lat: 10.8480, lng: 106.6350, type: 'RESTAURANT', openTime: '06:00', closeTime: '22:00', description: 'Phở chuỗi Ông Hùng' },

    // === GÒ VẤP ===
    { name: 'Bãi xe Emart Gò Vấp', address: '366 Phan Văn Trị, Gò Vấp, TP.HCM', lat: 10.8285, lng: 106.6690, type: 'PARKING_LOT', carSlots: 200, bikeSlots: 600, pricePerHour: 5000, openTime: '08:00', closeTime: '22:00', description: 'Bãi xe siêu thị Emart' },
    { name: 'The Coffee House Quang Trung GV', address: '422 Quang Trung, Gò Vấp, TP.HCM', lat: 10.8355, lng: 106.6650, type: 'CAFE', openTime: '07:00', closeTime: '22:30', description: 'The Coffee House chi nhánh Gò Vấp' },
    { name: 'Bách Hóa Xanh Quang Trung GV', address: '500 Quang Trung, Gò Vấp, TP.HCM', lat: 10.8370, lng: 106.6635, type: 'SERVICE', openTime: '06:00', closeTime: '22:30', description: 'Bách Hóa Xanh thực phẩm tươi' },

    // === BÌNH TÂN ===
    { name: 'Bãi xe AEON Bình Tân', address: 'Số 1, Đường 17A, Bình Tân, TP.HCM', lat: 10.7395, lng: 106.6070, type: 'PARKING_LOT', carSlots: 500, bikeSlots: 2000, pricePerHour: 5000, openTime: '08:00', closeTime: '22:00', description: 'Bãi xe AEON Mall Bình Tân', isPremium: true },
    { name: 'Highlands Coffee AEON Bình Tân', address: 'AEON Mall Bình Tân, TP.HCM', lat: 10.7398, lng: 106.6075, type: 'CAFE', openTime: '09:00', closeTime: '22:00', description: 'Highlands Coffee AEON Bình Tân' },
    { name: 'WC AEON Mall Bình Tân', address: 'AEON Mall Bình Tân, TP.HCM', lat: 10.7400, lng: 106.6072, type: 'RESTROOM', openTime: '09:00', closeTime: '22:00', description: 'Nhà vệ sinh sạch tại AEON Bình Tân' },

    // === TÂN PHÚ ===
    { name: 'Phở Phú Vương Tân Phú', address: '243 Lũy Bán Bích, Tân Phú, TP.HCM', lat: 10.7755, lng: 106.6335, type: 'RESTAURANT', openTime: '06:00', closeTime: '14:00', description: 'Phở nổi tiếng khu Tân Phú' },
    { name: 'FamilyMart Lũy Bán Bích', address: '300 Lũy Bán Bích, Tân Phú, TP.HCM', lat: 10.7760, lng: 106.6340, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Cửa hàng tiện lợi FamilyMart 24/7' },

    // === QUẬN 11 ===
    { name: 'Bãi xe Đầm Sen Q11', address: '3 Hòa Bình, Quận 11, TP.HCM', lat: 10.7695, lng: 106.6400, type: 'PARKING_LOT', carSlots: 300, bikeSlots: 1000, pricePerHour: 10000, openTime: '07:00', closeTime: '21:00', description: 'Bãi xe khu du lịch Đầm Sen' },
    { name: 'Phở Lệ Quận 11', address: '413-415 Nguyễn Trãi, Quận 11, TP.HCM', lat: 10.7580, lng: 106.6535, type: 'RESTAURANT', openTime: '06:00', closeTime: '02:00', description: 'Phở Lệ nổi tiếng, mở khuya' },

    // === BÌNH THẠNH bổ sung ===
    { name: 'Bãi xe Landmark 81', address: 'Vinhomes Central Park, Bình Thạnh, TP.HCM', lat: 10.7945, lng: 106.7215, type: 'PARKING_LOT', carSlots: 1000, bikeSlots: 3000, pricePerHour: 15000, openTime: '00:00', closeTime: '23:59', description: 'Bãi xe tòa nhà Landmark 81', isPremium: true },
    { name: 'Starbucks Landmark 81', address: 'Landmark 81, Bình Thạnh, TP.HCM', lat: 10.7948, lng: 106.7218, type: 'CAFE', openTime: '07:00', closeTime: '22:00', description: 'Starbucks view tầng cao Landmark 81' },
    { name: 'WC Landmark 81', address: 'Landmark 81, Bình Thạnh, TP.HCM', lat: 10.7950, lng: 106.7220, type: 'RESTROOM', openTime: '07:00', closeTime: '22:00', description: 'Nhà vệ sinh Landmark 81 rất sạch' },
  ];

  let created = 0;
  for (const s of spots) {
    const exists = await p.parkingSpot.findFirst({ where: { name: s.name } });
    if (exists) { console.log(`SKIP: ${s.name}`); continue; }

    const spot = await p.parkingSpot.create({
      data: {
        name: s.name, address: s.address, description: s.description || '',
        lat: s.lat, lng: s.lng, type: s.type,
        carSlots: s.carSlots || 0, bikeSlots: s.bikeSlots || 0,
        pricePerHour: s.pricePerHour || 0,
        openTime: s.openTime || '00:00', closeTime: s.closeTime || '23:59',
        phone: s.phone || null, isPremium: s.isPremium || false,
        status: 'active', ownerId: ownerId,
      }
    });

    // Add image
    await p.parkingImage.create({
      data: { url: IMG[s.type] || IMG.SERVICE, parkingSpotId: spot.id }
    });

    created++;
    console.log(`✅ ${s.type} | ${s.name}`);
  }

  const counts = await p.parkingSpot.groupBy({ by: ['type'], _count: true });
  console.log('\n=== TỔNG KẾT ===');
  counts.forEach(c => console.log(`  ${c.type}: ${c._count}`));
  const total = await p.parkingSpot.count();
  console.log(`  TOTAL: ${total}`);
  await p.$disconnect();
})();
