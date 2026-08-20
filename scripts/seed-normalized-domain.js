/**
 * BACKFILL & SEED NORMALIZED DOMAIN TABLES FROM EXISTING SPOTS
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Bắt đầu chuẩn hóa dữ liệu sang mô hình Normalized Domain...');

  const spots = await prisma.parkingSpot.findMany({
    include: {
      parkingDetail: true,
      verification: true,
      pricingList: true,
    },
  });

  console.log(`📍 Tìm thấy tổng cộng ${spots.length} địa điểm.`);

  let parkingCount = 0;
  let pricingCount = 0;
  let verificationCount = 0;

  for (const spot of spots) {
    // 1. Tạo/Cập nhật SpotVerification
    if (!spot.verification) {
      await prisma.spotVerification.create({
        data: {
          spotId: spot.id,
          verified: spot.status === 'ACTIVE',
          verifiedMethod: spot.source === 'MANUAL' ? 'FIELD_VISIT' : 'OFFICIAL_SOURCE',
          verifiedBy: 'MapGo Ops Team',
          confidenceScore: spot.status === 'ACTIVE' ? 85 : 30,
          source: spot.source || 'Hệ thống MapGo',
        },
      });
      verificationCount++;
    }

    // 2. Tạo SpotParkingDetail cho bãi xe
    if (!spot.parkingDetail && (spot.type === 'PARKING_LOT' || spot.type === 'PARKING')) {
      const is247 = spot.openTime === '00:00' && spot.closeTime === '23:59';
      await prisma.spotParkingDetail.create({
        data: {
          spotId: spot.id,
          is247: is247,
          openTime: spot.openTime || '06:00',
          closeTime: spot.closeTime || '22:00',
          heightLimit: 2.1, // Chuẩn chung cho hầm bãi xe đô thị
          totalCarSlots: spot.carSlots || 0,
          totalBikeSlots: spot.bikeSlots || 0,
          hasRealtimeSlots: false,
          hasGuard247: is247,
          hasCCTV: true,
          hasRoof: true,
          hasFireSafety: true,
          hasEvCharging: false,
          chargerCount: 0,
        },
      });
      parkingCount++;
    }

    // 3. Tạo SpotPricing cho các bãi có giá
    if (spot.pricingList.length === 0 && spot.pricePerHour > 0) {
      await prisma.spotPricing.createMany({
        data: [
          {
            spotId: spot.id,
            vehicleType: 'CAR',
            priceType: 'HOUR',
            amount: spot.pricePerHour,
            currency: 'VND',
            note: 'Giá theo giờ',
          },
          {
            spotId: spot.id,
            vehicleType: 'BIKE',
            priceType: 'HOUR',
            amount: 5000,
            currency: 'VND',
            note: 'Giá xe máy',
          },
        ],
      });
      pricingCount += 2;
    }
  }

  console.log(`✅ Hoàn thành chuẩn hóa dữ liệu:`);
  console.log(`   - SpotVerification tạo mới: ${verificationCount}`);
  console.log(`   - SpotParkingDetail tạo mới: ${parkingCount}`);
  console.log(`   - SpotPricing records tạo mới: ${pricingCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
