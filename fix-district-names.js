const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

function getCorrectDistrict(lat, lng, name, address) {
  const text = `${name} ${address}`.toUpperCase();

  // Explicit landmark check
  if (text.includes('BẾN THÀNH') || text.includes('NGUYỄN HUỆ') || text.includes('LÊ LAI') || text.includes('LÊ DUẨN') || text.includes('PASTEUR') || text.includes('ĐỒNG KHỞI') || text.includes('PHẠM NGỌC THẠCH') || text.includes('ĐINH TIÊN HOÀNG') || text.includes('VIMCOM CENTER ĐỒNG KHỞI') || text.includes('BA SON')) {
    return 'Quận 1';
  }
  if (text.includes('SƯ VẠN HẠNH') || text.includes('LÊ HỒNG PHONG') || text.includes('HÒA HƯNG') || text.includes('3 THÁNG 2')) {
    return 'Quận 10';
  }
  if (text.includes('PHẠM ĐÌNH HỔ') || text.includes('THÁP MƯỜI') || text.includes('BÌNH TÂY')) {
    return 'Quận 6';
  }
  if (text.includes('HOÀNG MINH GIÁM') || text.includes('ĐẶNG VĂN SÂM') || text.includes('HOÀNG VĂN THỤ') || text.includes('BẠCH ĐẰNG') || text.includes('HẠNH THÔNG') || text.includes('A75')) {
    return 'Quận Phú Nhuận';
  }
  if (text.includes('CÁCH MẠNG THÁNG 8') || text.includes('VÕ THỊ SÁU') || text.includes('ĐIỆN BIÊN PHỦ')) {
    if (lat < 10.790 && lng < 106.698) return 'Quận 3';
  }
  if (text.includes('TRƯỜNG SA') || text.includes('LANDMARK 81')) {
    return 'Quận Bình Thạnh';
  }

  // Coordinate bounding boxes
  // Quận 1: 10.762 - 10.792, 106.687 - 106.711
  if (lat >= 10.762 && lat <= 10.792 && lng >= 106.687 && lng <= 106.711) {
    return 'Quận 1';
  }
  // Quận 3: 10.770 - 10.795, 106.672 - 106.695
  if (lat >= 10.770 && lat <= 10.795 && lng >= 106.672 && lng < 106.687) {
    return 'Quận 3';
  }
  // Quận 10: 10.760 - 10.782, 106.658 - 106.675
  if (lat >= 10.760 && lat <= 10.782 && lng >= 106.658 && lng < 106.675) {
    return 'Quận 10';
  }
  // Quận 7: 10.710 - 10.745, 106.700 - 106.740
  if (lat >= 10.710 && lat <= 10.745 && lng >= 106.700 && lng <= 106.740) {
    return 'Quận 7';
  }
  // TP Thủ Đức (Q2, Q9, Thủ Đức): lng > 106.720 & lat > 10.770
  if (lng >= 106.720 && lat >= 10.770) {
    return 'TP Thủ Đức';
  }

  return null;
}

(async () => {
  const spots = await p.parkingSpot.findMany();
  console.log(`Processing ${spots.length} spots for district corrections...`);

  let updatedCount = 0;

  for (const s of spots) {
    const correctDistrict = getCorrectDistrict(s.lat, s.lng, s.name, s.address);

    if (correctDistrict) {
      let newName = s.name;
      let newAddress = s.address;

      // Replace ", Thủ Đức" or "Thủ Đức" in name and address if it belongs to Q1, Q3, Q10, etc.
      if (correctDistrict !== 'TP Thủ Đức') {
        newName = newName.replace(/,\s*Thủ Đức/gi, `, ${correctDistrict}`).replace(/\s+Thủ Đức$/gi, ` ${correctDistrict}`);
        newAddress = newAddress.replace(/,\s*Thủ Đức/gi, `, ${correctDistrict}`).replace(/\s+Thủ Đức$/gi, ` ${correctDistrict}`);

        // If address ends in "Thành phố Hồ Chí Minh" without explicit district, insert correctDistrict
        if (!newAddress.includes(correctDistrict)) {
          newAddress = newAddress.replace(/,?\s*Thành phố Hồ Chí Minh/gi, `, ${correctDistrict}, TP.HCM`);
        }
      }

      if (newName !== s.name || newAddress !== s.address) {
        console.log(`✏️ [FIX] ID ${s.id}`);
        console.log(`   OLD Name: "${s.name}" | Addr: "${s.address}"`);
        console.log(`   NEW Name: "${newName}" | Addr: "${newAddress}"\n`);

        await p.parkingSpot.update({
          where: { id: s.id },
          data: { name: newName, address: newAddress }
        });
        updatedCount++;
      }
    }
  }

  console.log(`✅ Successfully updated ${updatedCount} spots with correct district names!`);
  await p.$disconnect();
})();
