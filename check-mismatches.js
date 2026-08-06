const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

(async () => {
  const spots = await p.parkingSpot.findMany({
    select: { id: true, name: true, address: true, lat: true, lng: true, type: true }
  });

  console.log(`Checking ${spots.length} spots for coordinate & address mismatches...`);

  // Approx bounding boxes for HCMC districts
  // Q1: lat ~ 10.765 to 10.790, lng ~ 106.690 to 106.710
  // Thu Duc: lat ~ 10.800 to 10.880, lng ~ 106.730 to 106.850

  const mismatches = [];

  spots.forEach(s => {
    const isQ1Coord = (s.lat >= 10.765 && s.lat <= 10.792 && s.lng >= 106.685 && s.lng <= 106.712);
    const isThuDucCoord = (s.lat >= 10.800 && s.lat <= 10.880 && s.lng >= 106.730 && s.lng <= 106.850);
    const addrUpper = (s.address || '').toUpperCase();
    const nameUpper = (s.name || '').toUpperCase();

    const mentionsThuDuc = addrUpper.includes('THỦ ĐỨC') || addrUpper.includes('THU DUC') || nameUpper.includes('THỦ ĐỨC') || nameUpper.includes('THU DUC');
    const mentionsQ1 = addrUpper.includes('QUẬN 1') || addrUpper.includes('QUAN 1') || nameUpper.includes('QUẬN 1') || nameUpper.includes('QUAN 1');

    if (isQ1Coord && mentionsThuDuc) {
      mismatches.push({ reason: 'Q1 coordinates but address says Thu Duc', spot: s });
    }
    if (isThuDucCoord && mentionsQ1) {
      mismatches.push({ reason: 'Thu Duc coordinates but address says Q1', spot: s });
    }
  });

  console.log(`Found ${mismatches.length} obvious Q1 / Thu Duc mismatches:`);
  mismatches.forEach(m => {
    console.log(`❌ [${m.reason}] ID: ${m.spot.id} | Name: "${m.spot.name}" | Addr: "${m.spot.address}" | Lat/Lng: ${m.spot.lat}, ${m.spot.lng}`);
  });

  // Also print all spots that mention Thu Duc with their coords
  console.log('\n--- All spots mentioning Thu Duc ---');
  spots.filter(s => (s.address || '').toUpperCase().includes('THỦ ĐỨC') || (s.name || '').toUpperCase().includes('THỦ ĐỨC')).forEach(s => {
    console.log(`  ${s.type} | "${s.name}" | "${s.address}" | (${s.lat}, ${s.lng})`);
  });

  await p.$disconnect();
})();
