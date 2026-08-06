const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

(async () => {
  const spots = await p.parkingSpot.findMany();
  console.log(`Cleaning district strings for ${spots.length} spots...`);

  let count = 0;

  for (const s of spots) {
    let name = s.name;
    let addr = s.address;

    // Clean up duplicate district tokens like "Quận 10, Quận 7" or ", , "
    name = name.replace(/,\s*Quận\s*\d+/gi, '').replace(/,\s*TP Thủ Đức/gi, '');
    
    // Fix name if it ended with ", Quận X"
    name = name.trim();

    // Standardize address format
    // Remove duplicate district mentions
    addr = addr.replace(/Quận\s*\d+,\s*Quận\s*\d+/gi, (m) => m.split(',')[0].trim());
    addr = addr.replace(/Quận\s*Bình Thạnh,\s*Quận\s*\d+/gi, 'Quận Bình Thạnh');
    addr = addr.replace(/Quận\s*Phú Nhuận,\s*Quận\s*\d+/gi, 'Quận Phú Nhuận');
    addr = addr.replace(/Quận\s*4,\s*Quận\s*\d+/gi, 'Quận 4');
    addr = addr.replace(/Quận\s*10,\s*Quận\s*\d+/gi, 'Quận 10');
    addr = addr.replace(/Thủ Đức,\s*Quận\s*\d+/gi, 'Thủ Đức');

    // Replace erroneous "Thủ Đức" in Q1 / Q3 / Q10 / Q5 / Q6 addresses
    if (s.lat >= 10.760 && s.lat <= 10.793 && s.lng >= 106.685 && s.lng <= 106.712) {
      // District 1
      addr = addr.replace(/,\s*Thủ Đức/gi, ', Quận 1').replace(/Thủ Đức/gi, 'Quận 1');
      name = name.replace(/,\s*Thủ Đức/gi, '').replace(/\s+Thủ Đức$/gi, '');
    } else if (s.lat >= 10.770 && s.lat <= 10.795 && s.lng >= 106.670 && s.lng < 106.685) {
      // District 3
      addr = addr.replace(/,\s*Thủ Đức/gi, ', Quận 3').replace(/Thủ Đức/gi, 'Quận 3');
      name = name.replace(/,\s*Thủ Đức/gi, '').replace(/\s+Thủ Đức$/gi, '');
    } else if (s.lat >= 10.760 && s.lat <= 10.785 && s.lng >= 106.658 && s.lng < 106.672) {
      // District 10
      addr = addr.replace(/,\s*Thủ Đức/gi, ', Quận 10').replace(/Thủ Đức/gi, 'Quận 10');
      name = name.replace(/,\s*Thủ Đức/gi, '').replace(/\s+Thủ Đức$/gi, '');
    } else if (s.lat >= 10.740 && s.lat <= 10.760 && s.lng >= 106.635 && s.lng < 106.660) {
      // District 6
      addr = addr.replace(/,\s*Thủ Đức/gi, ', Quận 6').replace(/Thủ Đức/gi, 'Quận 6');
      name = name.replace(/,\s*Thủ Đức/gi, '').replace(/\s+Thủ Đức$/gi, '');
    } else if (s.lat >= 10.800 && s.lat <= 10.840 && s.lng >= 106.655 && s.lng < 106.690) {
      // Go Vap / Phu Nhuan
      addr = addr.replace(/,\s*Thủ Đức/gi, ', Gò Vấp').replace(/Thủ Đức/gi, 'Gò Vấp');
      name = name.replace(/,\s*Thủ Đức/gi, '').replace(/\s+Thủ Đức$/gi, '');
    }

    // Clean up empty leading commas
    addr = addr.replace(/^,\s*/, '').trim();

    if (name !== s.name || addr !== s.address) {
      await p.parkingSpot.update({
        where: { id: s.id },
        data: { name, address: addr }
      });
      count++;
    }
  }

  console.log(`✅ Cleaned ${count} spot names and addresses!`);
  await p.$disconnect();
})();
