import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const realParkingSpots = [
  // === QUẬN 1 ===
  {
    name: 'Bãi xe Vincom Center Đồng Khởi',
    address: '72 Lê Thánh Tôn, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Bãi xe hầm trong TTTM Vincom Center. An ninh 24/24, có camera giám sát. Thuận tiện mua sắm, ăn uống.',
    lat: 10.7784, lng: 106.7012,
    type: 'PARKING_LOT', carSlots: 200, bikeSlots: 500,
    pricePerHour: 40000, openTime: '06:00', closeTime: '23:00',
    phone: '028 3936 9999', isPremium: true, status: 'ACTIVE'
  },
  {
    name: 'Diamond Plaza - Bãi xe hầm',
    address: '34 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Bãi xe hầm Diamond Plaza, giữ xe 24/24. Cổng vào đường Nguyễn Văn Chiêm hoặc Lê Duẩn.',
    lat: 10.7807, lng: 106.6991,
    type: 'PARKING_LOT', carSlots: 300, bikeSlots: 800,
    pricePerHour: 30000, openTime: '00:00', closeTime: '23:59',
    phone: '028 3822 5500', isPremium: true, status: 'ACTIVE'
  },
  {
    name: 'Hầm xe Kumho - mPlaza',
    address: '39 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Hầm giữ xe Kumho Asiana trong tòa nhà mPlaza. Rộng rãi, an ninh tốt.',
    lat: 10.7812, lng: 106.6983,
    type: 'PARKING_LOT', carSlots: 150, bikeSlots: 300,
    pricePerHour: 35000, openTime: '06:00', closeTime: '22:00',
    phone: '028 3823 2323', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Green Power Building - Bãi xe',
    address: '35 Tôn Đức Thắng, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Bãi xe tòa nhà Green Power, gần bến Bạch Đằng. Giữ xe theo giờ và theo tháng.',
    lat: 10.7745, lng: 106.7053,
    type: 'PARKING_LOT', carSlots: 100, bikeSlots: 200,
    pricePerHour: 30000, openTime: '06:00', closeTime: '22:00',
    phone: '028 3910 0234', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Sân vận động Hoa Lư - Bãi xe',
    address: '2 Nguyễn Thị Minh Khai, P. Đa Kao, Quận 1, TP.HCM',
    description: 'Bãi giữ xe ngoài trời tại SVĐ Hoa Lư. Diện tích rộng, gần trung tâm.',
    lat: 10.7872, lng: 106.6944,
    type: 'PARKING_LOT', carSlots: 80, bikeSlots: 400,
    pricePerHour: 20000, openTime: '05:00', closeTime: '22:00',
    phone: '028 3829 0744', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Samco Parking - Võ Văn Kiệt',
    address: '326 Võ Văn Kiệt, P. Cầu Ông Lãnh, Quận 1, TP.HCM',
    description: 'Bãi giữ xe Samco, diện tích lớn. Gần khu vực Quận 4 và cầu Ông Lãnh.',
    lat: 10.7640, lng: 106.6942,
    type: 'PARKING_LOT', carSlots: 120, bikeSlots: 300,
    pricePerHour: 25000, openTime: '06:00', closeTime: '22:00',
    phone: '028 3836 2777', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Bãi xe 225 Trần Hưng Đạo',
    address: '225 Trần Hưng Đạo, P. Cầu Ông Lãnh, Quận 1, TP.HCM',
    description: 'Bãi giữ xe ô tô công cộng, gần khu vực chợ và trung tâm.',
    lat: 10.7628, lng: 106.6907,
    type: 'PARKING_LOT', carSlots: 60, bikeSlots: 200,
    pricePerHour: 20000, openTime: '06:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Thảo Cầm Viên - Bãi xe',
    address: '2 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Bãi xe công cộng tại Thảo Cầm Viên. Phù hợp du khách và gia đình.',
    lat: 10.7876, lng: 106.7050,
    type: 'PARKING_LOT', carSlots: 100, bikeSlots: 500,
    pricePerHour: 20000, openTime: '06:00', closeTime: '20:00',
    phone: '028 3829 1425', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Bãi xe Trống Đồng - Cách Mạng Tháng 8',
    address: '12B Cách Mạng Tháng 8, P. Bến Thành, Quận 1, TP.HCM',
    description: 'Bãi giữ xe Trống Đồng gần chợ Bến Thành. Thuận tiện di chuyển trung tâm.',
    lat: 10.7726, lng: 106.6895,
    type: 'PARKING_LOT', carSlots: 50, bikeSlots: 200,
    pricePerHour: 25000, openTime: '06:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Khách sạn New World - Bãi xe',
    address: '76 Lê Lai, P. Bến Thành, Quận 1, TP.HCM',
    description: 'Bãi xe hầm khách sạn New World Saigon. An ninh cao, giá cao cấp.',
    lat: 10.7707, lng: 106.6938,
    type: 'PARKING_LOT', carSlots: 100, bikeSlots: 50,
    pricePerHour: 50000, openTime: '00:00', closeTime: '23:59',
    phone: '028 3822 8888', isPremium: true, status: 'ACTIVE'
  },

  // === QUẬN 3 ===
  {
    name: 'Bãi xe 86 Nguyễn Thị Minh Khai',
    address: '86 Nguyễn Thị Minh Khai, P. 6, Quận 3, TP.HCM',
    description: 'Bãi giữ xe có mái che, giữ 24/24. Gần Dinh Độc Lập.',
    lat: 10.7810, lng: 106.6916,
    type: 'PARKING_LOT', carSlots: 40, bikeSlots: 150,
    pricePerHour: 25000, openTime: '00:00', closeTime: '23:59',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Bãi xe 274 Nam Kỳ Khởi Nghĩa',
    address: '274 Nam Kỳ Khởi Nghĩa, P. 8, Quận 3, TP.HCM',
    description: 'Bãi giữ xe có mái che, giờ giấc linh hoạt. Gần khu vực văn phòng.',
    lat: 10.7850, lng: 106.6880,
    type: 'PARKING_LOT', carSlots: 35, bikeSlots: 100,
    pricePerHour: 20000, openTime: '06:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },

  // === QUẬN 5 ===
  {
    name: 'Bãi xe Chợ Lớn',
    address: '944 Nguyễn Trãi, P. 14, Quận 5, TP.HCM',
    description: 'Bãi xe lớn khu vực Chợ Lớn. Giá rẻ, tiện mua sắm.',
    lat: 10.7512, lng: 106.6565,
    type: 'PARKING_LOT', carSlots: 80, bikeSlots: 300,
    pricePerHour: 15000, openTime: '06:00', closeTime: '21:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Thuận Kiều Plaza - Bãi xe',
    address: '190 Hồng Bàng, P. 12, Quận 5, TP.HCM',
    description: 'Bãi xe tại Thuận Kiều Plaza. Rộng rãi, dễ tìm.',
    lat: 10.7555, lng: 106.6595,
    type: 'PARKING_LOT', carSlots: 100, bikeSlots: 200,
    pricePerHour: 20000, openTime: '06:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Bãi xe An Đông Plaza',
    address: '51-53 An Dương Vương, P. 16, Quận 5, TP.HCM',
    description: 'Bãi xe đối diện Chợ An Đông. Thuận tiện mua sắm khu Chợ Lớn.',
    lat: 10.7540, lng: 106.6620,
    type: 'PARKING_LOT', carSlots: 60, bikeSlots: 200,
    pricePerHour: 20000, openTime: '07:00', closeTime: '21:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },

  // === QUẬN 7 - PHÚ MỸ HƯNG ===
  {
    name: 'Crescent Mall - Bãi xe hầm',
    address: '101 Tôn Dật Tiên, P. Tân Phú, Quận 7, TP.HCM',
    description: 'Bãi xe hầm hiện đại tại TTTM Crescent Mall Phú Mỹ Hưng. An ninh tốt.',
    lat: 10.7293, lng: 106.7188,
    type: 'PARKING_LOT', carSlots: 500, bikeSlots: 1000,
    pricePerHour: 30000, openTime: '07:00', closeTime: '22:00',
    phone: '028 5413 5555', isPremium: true, status: 'ACTIVE'
  },
  {
    name: 'SC VivoCity - Bãi xe',
    address: '1058 Nguyễn Văn Linh, P. Tân Phong, Quận 7, TP.HCM',
    description: 'Bãi xe hầm TTTM SC VivoCity. Rộng, hiện đại, gần khu Phú Mỹ Hưng.',
    lat: 10.7274, lng: 106.7218,
    type: 'PARKING_LOT', carSlots: 400, bikeSlots: 800,
    pricePerHour: 25000, openTime: '08:00', closeTime: '22:00',
    phone: '028 3776 6888', isPremium: true, status: 'ACTIVE'
  },

  // === BÌNH THẠNH ===
  {
    name: 'Pearl Plaza - Bãi xe hầm',
    address: '561A Điện Biên Phủ, P. 25, Bình Thạnh, TP.HCM',
    description: 'Bãi xe hầm tòa nhà Pearl Plaza. An ninh, camera 24/24.',
    lat: 10.8010, lng: 106.7153,
    type: 'PARKING_LOT', carSlots: 150, bikeSlots: 300,
    pricePerHour: 30000, openTime: '06:00', closeTime: '22:00',
    phone: '028 3512 1688', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Bãi xe 279 Nơ Trang Long',
    address: '279 Nơ Trang Long, P. 13, Bình Thạnh, TP.HCM',
    description: 'Bãi giữ xe ô tô 24/24, có mái che, an ninh tốt.',
    lat: 10.8055, lng: 106.6935,
    type: 'PARKING_LOT', carSlots: 40, bikeSlots: 100,
    pricePerHour: 15000, openTime: '00:00', closeTime: '23:59',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Bãi xe Lê Trân - Phạm Văn Đồng',
    address: '461 Phạm Văn Đồng, P. 13, Bình Thạnh, TP.HCM',
    description: 'Bãi giữ xe ô tô rộng trên đường Phạm Văn Đồng.',
    lat: 10.8218, lng: 106.7125,
    type: 'PARKING_LOT', carSlots: 50, bikeSlots: 150,
    pricePerHour: 15000, openTime: '06:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },

  // === PHÚ NHUẬN ===
  {
    name: 'Bãi xe 94 Phan Đăng Lưu',
    address: '94 Phan Đăng Lưu, P. 3, Phú Nhuận, TP.HCM',
    description: 'Bãi giữ xe gần ngã tư Thích Quảng Đức. Giá hợp lý.',
    lat: 10.7985, lng: 106.6843,
    type: 'PARKING_LOT', carSlots: 30, bikeSlots: 100,
    pricePerHour: 20000, openTime: '06:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Bãi xe 82-84 Cù Lao',
    address: '82-84 Cù Lao, P. 2, Phú Nhuận, TP.HCM',
    description: 'Bãi giữ xe có chỗ trong nhà và ngoài trời. Liên hệ trước để đặt chỗ.',
    lat: 10.7958, lng: 106.6870,
    type: 'PARKING_LOT', carSlots: 25, bikeSlots: 80,
    pricePerHour: 25000, openTime: '06:00', closeTime: '23:00',
    phone: '0937 998 676', isPremium: false, status: 'ACTIVE'
  },

  // === TÂN BÌNH ===
  {
    name: 'PAC Parking - Sân bay Tân Sơn Nhất',
    address: '18 Trường Sơn, P. 2, Tân Bình, TP.HCM',
    description: 'Bãi giữ xe gần sân bay TSN. Có xe đưa đón, gửi ngắn/dài ngày. An ninh cao.',
    lat: 10.8158, lng: 106.6590,
    type: 'PARKING_LOT', carSlots: 200, bikeSlots: 100,
    pricePerHour: 30000, openTime: '00:00', closeTime: '23:59',
    phone: '028 3547 5599', isPremium: true, status: 'ACTIVE'
  },
  {
    name: 'Lotte Mart Tân Bình - Bãi xe',
    address: '382 Cộng Hòa, P. 13, Tân Bình, TP.HCM',
    description: 'Bãi xe hầm hiện đại tại Lotte Mart. Miễn phí 2 giờ đầu khi mua sắm.',
    lat: 10.8012, lng: 106.6497,
    type: 'PARKING_LOT', carSlots: 200, bikeSlots: 500,
    pricePerHour: 15000, openTime: '08:00', closeTime: '22:00',
    phone: '028 3810 6777', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Bãi xe 116 Hồng Hà',
    address: '116 Hồng Hà, P. 2, Tân Bình, TP.HCM',
    description: 'Bãi giữ xe gần sân bay Tân Sơn Nhất. Gửi theo giờ và theo tháng.',
    lat: 10.8135, lng: 106.6615,
    type: 'PARKING_LOT', carSlots: 40, bikeSlots: 50,
    pricePerHour: 20000, openTime: '06:00', closeTime: '22:00',
    phone: '0905 413 838', isPremium: false, status: 'ACTIVE'
  },

  // === QUẬN 10 ===
  {
    name: 'Vạn Hạnh Mall - Bãi xe hầm',
    address: '11 Sư Vạn Hạnh, P. 12, Quận 10, TP.HCM',
    description: 'Bãi xe hầm TTTM Vạn Hạnh Mall. Hiện đại, rộng rãi, an ninh tốt.',
    lat: 10.7716, lng: 106.6690,
    type: 'PARKING_LOT', carSlots: 300, bikeSlots: 800,
    pricePerHour: 25000, openTime: '08:00', closeTime: '22:00',
    phone: '028 3863 8888', isPremium: true, status: 'ACTIVE'
  },

  // === THỦ ĐỨC (TP. Thủ Đức) ===
  {
    name: 'Gigamall Thủ Đức - Bãi xe',
    address: '240-242 Phạm Văn Đồng, P. Hiệp Bình Chánh, TP. Thủ Đức, TP.HCM',
    description: 'Bãi xe hầm TTTM Gigamall. Rộng, hiện đại.',
    lat: 10.8350, lng: 106.7210,
    type: 'PARKING_LOT', carSlots: 400, bikeSlots: 1000,
    pricePerHour: 20000, openTime: '08:00', closeTime: '22:00',
    phone: '028 3720 1234', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'AEON Mall Bình Tân - Bãi xe',
    address: '1 Đường số 17A, P. Bình Trị Đông B, Bình Tân, TP.HCM',
    description: 'Bãi xe khổng lồ tại AEON Mall Bình Tân. Miễn phí khi mua sắm.',
    lat: 10.7421, lng: 106.6090,
    type: 'PARKING_LOT', carSlots: 600, bikeSlots: 2000,
    pricePerHour: 10000, openTime: '08:00', closeTime: '22:00',
    phone: '028 6288 7711', isPremium: false, status: 'ACTIVE'
  },

  // === ĐỖ XE VEN ĐƯỜNG (Quận 1) ===
  {
    name: 'Đỗ xe lòng đường - Lê Lai',
    address: 'Đường Lê Lai, P. Bến Thành, Quận 1, TP.HCM',
    description: 'Đỗ xe ven đường có thu phí (VETC/QR code). Gần chợ Bến Thành và Công viên 23/9.',
    lat: 10.7685, lng: 106.6925,
    type: 'PARKING_LOT', carSlots: 20, bikeSlots: 0,
    pricePerHour: 20000, openTime: '06:00', closeTime: '21:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Đỗ xe lòng đường - Hai Bà Trưng',
    address: 'Đường Hai Bà Trưng (đoạn gần Lê Văn Tám), Quận 1, TP.HCM',
    description: 'Tuyến đỗ xe ven đường có thu phí. Thanh toán qua app VETC hoặc quét QR.',
    lat: 10.7865, lng: 106.6975,
    type: 'PARKING_LOT', carSlots: 15, bikeSlots: 0,
    pricePerHour: 25000, openTime: '06:00', closeTime: '21:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
];

async function main() {
  console.log(`Adding ${realParkingSpots.length} real parking spots...`);
  
  for (const spot of realParkingSpots) {
    const existing = await prisma.parkingSpot.findFirst({
      where: { name: spot.name }
    });
    
    if (existing) {
      console.log(`⏩ Skip (already exists): ${spot.name}`);
      continue;
    }
    
    await prisma.parkingSpot.create({ data: spot });
    console.log(`✅ Added: ${spot.name}`);
  }
  
  const total = await prisma.parkingSpot.count();
  console.log(`\\n🅿️ Total parking spots in database: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
