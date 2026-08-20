/**
 * DATABASE AUDIT SCRIPT - SHOW RAW RECORDS
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const spotCounts = await prisma.parkingSpot.count();
  const parkingDetailCounts = await prisma.spotParkingDetail.count();
  const pricingCounts = await prisma.spotPricing.count();
  const verificationCounts = await prisma.spotVerification.count();

  console.log('=== DATABASE AUDIT EVIDENCE ===');
  console.log(`TOTAL SPOTS: ${spotCounts}`);
  console.log(`TOTAL PARKING DETAILS: ${parkingDetailCounts}`);
  console.log(`TOTAL PRICING RECORDS: ${pricingCounts}`);
  console.log(`TOTAL VERIFICATION RECORDS: ${verificationCounts}`);

  console.log('\n--- SAMPLE 1: SPOT WITH PARKING DETAIL & PRICING ---');
  const sampleParking = await prisma.parkingSpot.findFirst({
    where: { parkingDetail: { isNot: null } },
    include: {
      parkingDetail: true,
      pricingList: true,
      verification: true,
    },
  });
  console.log(JSON.stringify(sampleParking, null, 2));

  console.log('\n--- SAMPLE 2: SPOT VERIFICATION RECORDS ---');
  const sampleVerifications = await prisma.spotVerification.findMany({
    take: 3,
  });
  console.log(JSON.stringify(sampleVerifications, null, 2));
}

main()
  .catch((e) => {
    console.error('DB Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
