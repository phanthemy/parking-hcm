import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nextapp.vn' },
    update: {},
    create: {
      email: 'admin@nextapp.vn',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      name: 'Nguyen Van A',
      password: hashedPassword,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      name: 'Tran Thi B',
      password: hashedPassword,
      role: 'USER',
    },
  });

  // Parking spots data
  const spotsData = [
    {
      name: 'Bãi xe Lê Lợi Q1',
      address: 'Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Bãi đỗ xe trung tâm, gần phố đi bộ.',
      lat: 10.7731,
      lng: 106.6990,
      type: 'PARKING_LOT',
      carSlots: 50,
      bikeSlots: 200,
      pricePerHour: 20000,
      openTime: '06:00',
      closeTime: '23:00',
      isPremium: false,
    },
    {
      name: 'Bãi xe Nguyễn Huệ Q1',
      address: 'Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Bãi đỗ xe ngay phố đi bộ Nguyễn Huệ.',
      lat: 10.7745,
      lng: 106.7032,
      type: 'PARKING_LOT',
      carSlots: 30,
      bikeSlots: 150,
      pricePerHour: 30000,
      openTime: '07:00',
      closeTime: '24:00',
      isPremium: true,
    },
    {
      name: 'Bãi xe công viên Tao Đàn',
      address: 'Đường Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP.HCM',
      description: 'Bãi đỗ xe trong công viên Tao Đàn.',
      lat: 10.7758,
      lng: 106.6923,
      type: 'PARKING_LOT',
      carSlots: 100,
      bikeSlots: 500,
      pricePerHour: 10000,
      openTime: '05:00',
      closeTime: '22:00',
      isPremium: false,
    },
    {
      name: 'Nhà hàng Wrap & Roll Đồng Khởi',
      address: 'Đồng Khởi, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Nhà hàng có bãi đỗ xe miễn phí cho khách.',
      lat: 10.7761,
      lng: 106.7027,
      type: 'RESTAURANT',
      carSlots: 5,
      bikeSlots: 20,
      pricePerHour: 0,
      openTime: '10:00',
      closeTime: '22:00',
      isPremium: false,
    },
    {
      name: 'Cộng Cà Phê Hai Bà Trưng',
      address: 'Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Quán cà phê view đẹp, có chỗ để xe.',
      lat: 10.7788,
      lng: 106.6991,
      type: 'CAFE',
      carSlots: 0,
      bikeSlots: 50,
      pricePerHour: 5000,
      openTime: '07:00',
      closeTime: '23:30',
      isPremium: false,
    },
    {
      name: 'Chợ Bến Thành Parking',
      address: 'Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
      description: 'Bãi đỗ xe lớn gần chợ Bến Thành.',
      lat: 10.7725,
      lng: 106.6980,
      type: 'PARKING_LOT',
      carSlots: 20,
      bikeSlots: 300,
      pricePerHour: 20000,
      openTime: '04:00',
      closeTime: '19:00',
      isPremium: false,
    },
    {
      name: 'Vincom Center Đồng Khởi',
      address: '72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Bãi đỗ xe dưới tầng hầm Vincom.',
      lat: 10.7781,
      lng: 106.7021,
      type: 'PARKING_LOT',
      carSlots: 500,
      bikeSlots: 2000,
      pricePerHour: 40000,
      openTime: '08:00',
      closeTime: '23:00',
      isPremium: true,
    },
    {
      name: 'Bitexco Financial Tower Parking',
      address: '2 Hải Triều, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Bãi đỗ xe tòa nhà Bitexco.',
      lat: 10.7716,
      lng: 106.7044,
      type: 'PARKING_LOT',
      carSlots: 300,
      bikeSlots: 1000,
      pricePerHour: 50000,
      openTime: '06:00',
      closeTime: '23:00',
      isPremium: true,
    },
    {
      name: 'Saigon Centre (Takashimaya)',
      address: '65 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Hầm gửi xe Saigon Centre.',
      lat: 10.7733,
      lng: 106.7011,
      type: 'PARKING_LOT',
      carSlots: 400,
      bikeSlots: 1500,
      pricePerHour: 30000,
      openTime: '09:00',
      closeTime: '22:00',
      isPremium: true,
    },
    {
      name: 'Diamond Plaza Parking',
      address: '34 Lê Duẩn, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Hầm gửi xe Diamond Plaza.',
      lat: 10.7801,
      lng: 106.6987,
      type: 'PARKING_LOT',
      carSlots: 200,
      bikeSlots: 800,
      pricePerHour: 30000,
      openTime: '08:30',
      closeTime: '22:30',
      isPremium: true,
    },
    {
      name: 'Bãi xe Dinh Độc Lập',
      address: '135 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1, TP.HCM',
      description: 'Bãi đỗ xe cho khách tham quan Dinh Độc Lập.',
      lat: 10.7771,
      lng: 106.6953,
      type: 'PARKING_LOT',
      carSlots: 50,
      bikeSlots: 200,
      pricePerHour: 15000,
      openTime: '07:30',
      closeTime: '17:00',
      isPremium: false,
    },
    {
      name: 'Bãi xe Thảo Cầm Viên',
      address: '2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Bãi đỗ xe sở thú.',
      lat: 10.7876,
      lng: 106.7051,
      type: 'PARKING_LOT',
      carSlots: 100,
      bikeSlots: 1000,
      pricePerHour: 10000,
      openTime: '07:00',
      closeTime: '18:00',
      isPremium: false,
    },
    {
      name: 'Bệnh viện Từ Dũ Parking',
      address: '284 Cống Quỳnh, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
      description: 'Bãi giữ xe bệnh viện.',
      lat: 10.7675,
      lng: 106.6853,
      type: 'PARKING_LOT',
      carSlots: 20,
      bikeSlots: 500,
      pricePerHour: 10000,
      openTime: '00:00',
      closeTime: '23:59',
      isPremium: false,
    },
    {
      name: 'Bãi đỗ xe Bùi Viện',
      address: 'Bùi Viện, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
      description: 'Bãi đỗ xe cho khách dạo phố Tây.',
      lat: 10.7674,
      lng: 106.6938,
      type: 'PARKING_LOT',
      carSlots: 10,
      bikeSlots: 200,
      pricePerHour: 30000,
      openTime: '17:00',
      closeTime: '04:00',
      isPremium: false,
    },
    {
      name: 'The Coffee House Pasteur',
      address: 'Pasteur, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Quán cà phê có hỗ trợ giữ xe.',
      lat: 10.7766,
      lng: 106.6985,
      type: 'CAFE',
      carSlots: 2,
      bikeSlots: 30,
      pricePerHour: 0,
      openTime: '07:00',
      closeTime: '22:30',
      isPremium: false,
    },
    {
      name: 'Pizza 4Ps Lê Thánh Tôn',
      address: 'Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Nhà hàng Pizza, có nhân viên giữ xe.',
      lat: 10.7793,
      lng: 106.7057,
      type: 'RESTAURANT',
      carSlots: 0,
      bikeSlots: 40,
      pricePerHour: 10000,
      openTime: '11:00',
      closeTime: '23:00',
      isPremium: true,
    },
    {
      name: 'Highlands Coffee Nhà Hát Lớn',
      address: 'Công Trường Lam Sơn, Phường Bến Nghé, Quận 1, TP.HCM',
      description: 'Khu vực giữ xe cho khách uống cà phê.',
      lat: 10.7766,
      lng: 106.7032,
      type: 'CAFE',
      carSlots: 0,
      bikeSlots: 50,
      pricePerHour: 5000,
      openTime: '07:00',
      closeTime: '23:00',
      isPremium: false,
    }
  ];

  for (const data of spotsData) {
    const spot = await prisma.parkingSpot.create({
      data: {
        ...data,
        ownerId: admin.id,
      },
    });

    // Add some reviews
    await prisma.review.createMany({
      data: [
        {
          rating: 4,
          comment: 'Chỗ để xe rộng rãi.',
          userId: user1.id,
          parkingSpotId: spot.id,
        },
        {
          rating: 5,
          comment: 'Nhân viên nhiệt tình.',
          userId: user2.id,
          parkingSpotId: spot.id,
        }
      ]
    });

    if (data.type === 'RESTAURANT' || data.type === 'CAFE') {
      await prisma.businessProfile.create({
        data: {
          parkingSpotId: spot.id,
          menuDescription: 'Đồ ăn và đồ uống ngon, giá cả hợp lý.',
          specialOffers: 'Giảm giá 10% khi xuất trình vé xe.',
        }
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
