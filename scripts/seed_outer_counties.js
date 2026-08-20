const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const REAL_COUNTY_SPOTS = [
  // ===== CỦ CHI =====
  {
    name: 'Bãi đỗ xe Khu Di Tích Địa Đạo Củ Chi (Bến Dược)',
    slug: 'bai-do-xe-dia-dao-cu-chi-ben-duoc',
    address: 'Ấp Phú Hiệp, Xã Phú Mỹ Hưng, Huyện Củ Chi, TP.HCM',
    description: 'Bãi đỗ xe rộng rãi phục vụ khách tham quan Địa đạo Bến Dược, có chỗ đỗ cho xe 45 chỗ, xe con và bãi gửi xe máy.',
    lat: 11.1444,
    lng: 106.4632,
    type: 'PARKING_LOT',
    carSlots: 100,
    bikeSlots: 300,
    pricePerHour: 20000,
    openTime: '07:00',
    closeTime: '17:00',
    phone: '02838920441',
    isPremium: false,
    status: 'ACTIVE'
  },
  {
    name: 'Bãi đỗ xe Co.opmart Củ Chi',
    slug: 'bai-do-xe-coopmart-cu-chi',
    address: '357 Quốc lộ 22, Khu phố 5, Thị trấn Củ Chi, Huyện Củ Chi, TP.HCM',
    description: 'Bãi đỗ xe siêu thị Co.opmart Củ Chi có mái che, bảo vệ trông coi, thuận tiện mua sắm và gửi xe ô tô tại trung tâm thị trấn.',
    lat: 10.9754,
    lng: 106.4952,
    type: 'PARKING_LOT',
    carSlots: 30,
    bikeSlots: 200,
    pricePerHour: 15000,
    openTime: '07:30',
    closeTime: '22:00',
    phone: '02837907500',
    isPremium: false,
    status: 'ACTIVE'
  },
  {
    name: 'Bãi đỗ xe Bệnh Viện Đa Khoa Khu Vực Củ Chi',
    slug: 'bai-do-xe-benh-vien-da-khoa-cu-chi',
    address: '9A Nguyễn Văn Hoài, Ấp Bàu Tre 2, Xã Tân An Hội, Huyện Củ Chi, TP.HCM',
    description: 'Bãi giữ xe bệnh viện đa khoa Củ Chi hoạt động 24/24, phục vụ bệnh nhân và người nhà khám chữa bệnh an toàn.',
    lat: 10.9682,
    lng: 106.4867,
    type: 'PARKING_LOT',
    carSlots: 40,
    bikeSlots: 250,
    pricePerHour: 10000,
    openTime: '00:00',
    closeTime: '23:59',
    phone: '02838920583',
    isPremium: false,
    status: 'ACTIVE'
  },
  {
    name: 'Bãi đỗ xe Khu Di Tích Địa Đạo Bến Đình',
    slug: 'bai-do-xe-dia-dao-ben-dinh-cu-chi',
    address: 'Ấp Bến Đình, Xã Nhuận Đức, Huyện Củ Chi, TP.HCM',
    description: 'Bãi xe ô tô du lịch và xe khách tham quan địa đạo Bến Đình râm mát dưới tán rừng cao su.',
    lat: 11.0558,
    lng: 106.5165,
    type: 'PARKING_LOT',
    carSlots: 60,
    bikeSlots: 150,
    pricePerHour: 20000,
    openTime: '07:30',
    closeTime: '17:00',
    phone: '02837948830',
    isPremium: false,
    status: 'ACTIVE'
  },

  // ===== HÓC MÔN (BỔ SUNG) =====
  {
    name: 'Bãi đỗ xe Chợ Đầu Mối Nông Sản Hóc Môn',
    slug: 'bai-do-xe-cho-dau-moi-hoc-mon',
    address: '14/7A Nguyễn Thị Sóc, Xã Xuân Thới Đông, Huyện Hóc Môn, TP.HCM',
    description: 'Bãi đỗ xe tải, xe tải nhỏ và ô tô con giao thương nông sản tại Chợ đầu mối Hóc Môn hoạt động 24/7.',
    lat: 10.8652,
    lng: 106.5935,
    type: 'PARKING_LOT',
    carSlots: 120,
    bikeSlots: 500,
    pricePerHour: 20000,
    openTime: '00:00',
    closeTime: '23:59',
    phone: '02837180479',
    isPremium: false,
    status: 'ACTIVE'
  },
  {
    name: 'Bãi đỗ xe Bệnh Viện Đa Khoa Khu Vực Hóc Môn',
    slug: 'bai-do-xe-benh-vien-hoc-mon',
    address: '65/2B Bà Triệu, Thị trấn Hóc Môn, Huyện Hóc Môn, TP.HCM',
    description: 'Bãi đỗ xe bệnh viện Hóc Môn mới xây dựng khang trang, có khuôn viên để ô tô và nhà xe máy hiện đại.',
    lat: 10.8872,
    lng: 106.5898,
    type: 'PARKING_LOT',
    carSlots: 35,
    bikeSlots: 200,
    pricePerHour: 10000,
    openTime: '00:00',
    closeTime: '23:59',
    phone: '02838914208',
    isPremium: false,
    status: 'ACTIVE'
  },

  // ===== NHÀ BÈ =====
  {
    name: 'Bãi đỗ xe Khu Đô Thị & Cảng Hiệp Phước',
    slug: 'bai-do-xe-cang-hiep-phuoc-nha-be',
    address: 'Đường số 6, Khu công nghiệp Hiệp Phước, Xã Hiệp Phước, Huyện Nhà Bè, TP.HCM',
    description: 'Bãi đỗ xe ô tô và xe container quy mô lớn phục vụ chuyên gia, công nhân và đối tác làm việc tại cụm Cảng Hiệp Phước.',
    lat: 10.6395,
    lng: 106.7468,
    type: 'PARKING_LOT',
    carSlots: 80,
    bikeSlots: 300,
    pricePerHour: 15000,
    openTime: '00:00',
    closeTime: '23:59',
    phone: '02838734567',
    isPremium: false,
    status: 'ACTIVE'
  },
  {
    name: 'Bãi đỗ xe Bến Phà Bình Khánh (Bờ Nhà Bè)',
    slug: 'bai-do-xe-pha-binh-khanh-nha-be',
    address: 'Đường Huỳnh Tấn Phát, Xã Phú Xuân, Huyện Nhà Bè, TP.HCM',
    description: 'Bãi giữ xe chờ phà Bình Khánh sang Cần Giờ, có nhận gửi ô tô, xe máy qua đêm cho khách đi biển.',
    lat: 10.6725,
    lng: 106.7582,
    type: 'PARKING_LOT',
    carSlots: 50,
    bikeSlots: 300,
    pricePerHour: 20000,
    openTime: '00:00',
    closeTime: '23:59',
    phone: '02837828282',
    isPremium: false,
    status: 'ACTIVE'
  },
  {
    name: 'Bãi đỗ xe Co.opmart Nguyễn Bình Nhà Bè',
    slug: 'bai-do-xe-coopmart-nguyen-binh-nha-be',
    address: 'Đường Nguyễn Bình, Xã Phú Xuân, Huyện Nhà Bè, TP.HCM',
    description: 'Bãi xe siêu thị Co.opmart Nhà Bè mặt tiền đường Nguyễn Bình, chỗ đậu xe ô tô thuận tiện, an toàn.',
    lat: 10.6798,
    lng: 106.7265,
    type: 'PARKING_LOT',
    carSlots: 25,
    bikeSlots: 150,
    pricePerHour: 10000,
    openTime: '08:00',
    closeTime: '22:00',
    phone: '02837810011',
    isPremium: false,
    status: 'ACTIVE'
  },

  // ===== CẦN GIỜ =====
  {
    name: 'Bãi đỗ xe Bãi Biển 30/4 Cần Giờ',
    slug: 'bai-do-xe-bai-bien-30-4-can-gio',
    address: 'Đường Duyên Hải, Xã Long Hòa, Huyện Cần Giờ, TP.HCM',
    description: 'Bãi đỗ xe bãi tắm biển 30/4 Cần Giờ rất rộng rãi, sức chứa hàng trăm ô tô gia đình và xe đoàn du lịch cuối tuần.',
    lat: 10.4072,
    lng: 106.8925,
    type: 'PARKING_LOT',
    carSlots: 100,
    bikeSlots: 400,
    pricePerHour: 25000,
    openTime: '06:00',
    closeTime: '21:00',
    phone: '02838743333',
    isPremium: false,
    status: 'ACTIVE'
  },
  {
    name: 'Bãi đỗ xe Chợ Hải Sản Hàng Dương Cần Giờ',
    slug: 'bai-do-xe-cho-hang-duong-can-gio',
    address: 'Đường Thạnh Thới, Xã Long Hòa, Huyện Cần Giờ, TP.HCM',
    description: 'Bãi giữ xe ô tô, xe máy phục vụ du khách ghé mua sắm và thưởng thức hải sản tươi sống tại Chợ Hàng Dương.',
    lat: 10.4055,
    lng: 106.8978,
    type: 'PARKING_LOT',
    carSlots: 50,
    bikeSlots: 200,
    pricePerHour: 20000,
    openTime: '06:00',
    closeTime: '19:00',
    phone: '02838740123',
    isPremium: false,
    status: 'ACTIVE'
  },
  {
    name: 'Bãi đỗ xe Khu Du Lịch Sinh Thái Vàm Sát',
    slug: 'bai-do-xe-kdl-vam-sat-can-gio',
    address: 'Xã Lý Nhơn, Huyện Cần Giờ, TP.HCM',
    description: 'Bãi đỗ xe trung tâm đón tiếp du khách tham quan khu du lịch sinh thái rừng ngập mặn Vàm Sát Cần Giờ.',
    lat: 10.4785,
    lng: 106.8612,
    type: 'PARKING_LOT',
    carSlots: 40,
    bikeSlots: 100,
    pricePerHour: 20000,
    openTime: '07:30',
    closeTime: '17:30',
    phone: '02839876155',
    isPremium: false,
    status: 'ACTIVE'
  },
  {
    name: 'Bãi đỗ xe Khu Du Lịch Đảo Khỉ (Lâm Viên Cần Giờ)',
    slug: 'bai-do-xe-dao-khi-can-gio',
    address: 'Đường Rừng Sác, Xã Long Hòa, Huyện Cần Giờ, TP.HCM',
    description: 'Bãi giữ xe tham quan Đảo Khỉ và Chiến khu Rừng Sác, bãi xe có bóng cây râm mát, bảo vệ trực ban.',
    lat: 10.4682,
    lng: 106.8875,
    type: 'PARKING_LOT',
    carSlots: 60,
    bikeSlots: 150,
    pricePerHour: 20000,
    openTime: '07:00',
    closeTime: '17:00',
    phone: '02838743013',
    isPremium: false,
    status: 'ACTIVE'
  }
];

async function seed() {
  console.log('Seeding real parking spots for outer counties...');
  for (const s of REAL_COUNTY_SPOTS) {
    const existing = await prisma.parkingSpot.findFirst({
      where: {
        OR: [
          { slug: s.slug },
          { name: s.name }
        ]
      }
    });

    if (!existing) {
      const created = await prisma.parkingSpot.create({
        data: s
      });
      console.log(`+ Created: ${created.name} (${created.address})`);
    } else {
      console.log(`~ Already exists: ${s.name}`);
    }
  }
  console.log('Done seeding outer counties!');
}

seed();
