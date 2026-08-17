const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const garages = [
  { name: 'Cứu Hộ Ô Tô Sài Gòn 24/7', address: '45 Phan Đăng Lưu, Phú Nhuận', lat: 10.7981, lng: 106.6852 },
  { name: 'Garage An Phát Auto', address: '123 Quang Trung, Gò Vấp', lat: 10.8285, lng: 106.6710 },
  { name: 'Cứu hộ xe Phước Thịnh', address: '89 Đinh Tiên Hoàng, Bình Thạnh', lat: 10.7942, lng: 106.6975 },
  { name: 'Garage ô tô Vui', address: '1 Lý Thái Tổ, Quận 10', lat: 10.7674, lng: 106.6749 },
  { name: 'Garage Thành Đạt', address: '500 Cộng Hòa, Tân Bình', lat: 10.8033, lng: 106.6438 },
  { name: 'Cứu Hộ Giao Thông HCM', address: '102 Nguyễn Trãi, Quận 5', lat: 10.7584, lng: 106.6748 },
  { name: 'Garage Việt Hùng', address: '85 Nguyễn Văn Linh, Quận 7', lat: 10.7251, lng: 106.7119 },
  { name: 'Garage Auto Sài Gòn', address: '235 Nguyễn Hữu Cảnh, Bình Thạnh', lat: 10.7937, lng: 106.7198 },
  { name: 'Garage Ô Tô Quê Hương', address: '50 Phạm Văn Đồng, Thủ Đức', lat: 10.8268, lng: 106.7214 },
  { name: 'Cứu hộ Zura Auto', address: '78 Trường Chinh, Tân Bình', lat: 10.8049, lng: 106.6343 },
  { name: 'Garage Khang Điền', address: '456 Võ Văn Kiệt, Quận 1', lat: 10.7616, lng: 106.6922 },
  { name: 'Garage Đạt Phú', address: '12 Lũy Bán Bích, Tân Phú', lat: 10.7686, lng: 106.6267 },
  { name: 'Cứu hộ 24h Quận 2', address: '90 Trần Não, Quận 2', lat: 10.7915, lng: 106.7289 },
  { name: 'Garage Hưng Phát', address: '34 Lê Văn Việt, Quận 9', lat: 10.8465, lng: 106.7936 },
  { name: 'Garage Ô tô 3S', address: '110 Kinh Dương Vương, Bình Tân', lat: 10.7412, lng: 106.6190 },
  { name: 'Garage Nam Sài Gòn', address: '66 Huỳnh Tấn Phát, Quận 7', lat: 10.7381, lng: 106.7323 },
  { name: 'Cứu Hộ Minh Chánh', address: '44 Nguyễn Thị Minh Khai, Quận 3', lat: 10.7816, lng: 106.6908 },
  { name: 'Garage Bảo Thái', address: '22 Nguyễn Xí, Bình Thạnh', lat: 10.8118, lng: 106.7032 },
  { name: 'Garage Auto Vina', address: '99 Hoàng Diệu, Quận 4', lat: 10.7628, lng: 106.7056 },
  { name: 'Cứu hộ Tân Bình 247', address: '55 Âu Cơ, Tân Bình', lat: 10.7801, lng: 106.6493 }
];

const carwashes = [
  { name: 'Rửa Xe Sonax', address: '56 Trần Cao Vân, Quận 3', lat: 10.7850, lng: 106.6953 },
  { name: 'Rửa Xe VietWash 1', address: '100 Nguyễn Đình Chiểu, Quận 1', lat: 10.7865, lng: 106.6989 },
  { name: 'Car Wash Center', address: '80 Võ Thị Sáu, Quận 1', lat: 10.7906, lng: 106.6961 },
  { name: 'Rửa xe 5S', address: '44 Đường 3/2, Quận 10', lat: 10.7725, lng: 106.6784 },
  { name: 'VietWash Cộng Hòa', address: '150 Cộng Hòa, Tân Bình', lat: 10.8016, lng: 106.6534 },
  { name: 'Rửa xe bọt tuyết Hoàng Gia', address: '33 Phạm Hùng, Bình Chánh', lat: 10.7291, lng: 106.6787 },
  { name: 'Auto Wash Lê Văn Việt', address: '89 Lê Văn Việt, Quận 9', lat: 10.8462, lng: 106.7932 },
  { name: 'VietWash Nguyễn Trãi', address: '200 Nguyễn Trãi, Quận 5', lat: 10.7554, lng: 106.6710 },
  { name: 'Rửa xe 123', address: '123 Phan Văn Trị, Gò Vấp', lat: 10.8260, lng: 106.6853 },
  { name: 'Clean Car Thủ Đức', address: '55 Kha Vạn Cân, Thủ Đức', lat: 10.8322, lng: 106.7490 },
  { name: 'Rửa Xe Pro', address: '90 Tôn Đản, Quận 4', lat: 10.7602, lng: 106.7051 },
  { name: 'VietWash Trần Não', address: '66 Trần Não, Quận 2', lat: 10.7924, lng: 106.7301 },
  { name: 'Rửa Xe Minh Anh', address: '100 Đinh Tiên Hoàng, Bình Thạnh', lat: 10.7951, lng: 106.6978 },
  { name: 'Rửa xe Không chạm', address: '45 Nguyễn Hữu Thọ, Quận 7', lat: 10.7423, lng: 106.7011 },
  { name: 'Auto Wash 365', address: '80 Tân Sơn Nhì, Tân Phú', lat: 10.8038, lng: 106.6344 }
];

async function main() {
  console.log('Bắt đầu seed dữ liệu Garage và Carwash...');

  const processSpots = async (spots, type) => {
    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (const spot of spots) {
      try {
        const { name, address, lat, lng } = spot;
        const offset = 0.0003;
        
        // Kiểm tra duplicate (khoảng ±0.0003 độ ~ 33m)
        const existing = await prisma.parkingSpot.findFirst({
          where: {
            lat: { gte: lat - offset, lte: lat + offset },
            lng: { gte: lng - offset, lte: lng + offset },
            type: type
          }
        });

        if (existing) {
          console.log(`[SKIP] Đã tồn tại (duplicate): ${name} tại ${address}`);
          skipped++;
          continue;
        }

        await prisma.parkingSpot.create({
          data: {
            name,
            address,
            description: type === 'GARAGE' ? 'Dịch vụ cứu hộ, sửa chữa ô tô' : 'Dịch vụ rửa xe, chăm sóc xe',
            lat,
            lng,
            type: type,
            carSlots: 5,
            bikeSlots: 0,
            pricePerHour: 0,
            openTime: '06:00',
            closeTime: '22:00',
            phone: '0901234567',
            status: 'ACTIVE',
          }
        });
        
        console.log(`[SUCCESS] Đã tạo: ${name}`);
        success++;
      } catch (err) {
        console.error(`[ERROR] Không thể tạo ${spot.name}:`, err.message);
        failed++;
      }
    }
    
    console.log(`=== Hoàn thành seed ${type}: Thành công: ${success}, Skip: ${skipped}, Lỗi: ${failed} ===`);
  };

  await processSpots(garages, 'GARAGE');
  await processSpots(carwashes, 'CARWASH');

  console.log('Đã chạy xong seed script.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
