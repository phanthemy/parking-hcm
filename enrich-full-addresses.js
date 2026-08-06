const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

// Helper to delay requests to respect rate limits
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchReverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MapGo.vn Address Enricher/1.0 (software@rtrobotics.com)'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    return null;
  }
}

function formatFullAddress(data, defaultLat, defaultLng) {
  if (!data || !data.address) return null;
  const a = data.address;

  const houseNumber = a.house_number || a.building || '';
  const road = a.road || a.pedestrian || a.suburb || a.neighbourhood || '';
  const quarter = a.quarter || a.suburb || a.village || '';
  const district = a.city_district || a.district || a.county || '';

  const parts = [];
  if (houseNumber && road) {
    parts.push(`${houseNumber} ${road}`);
  } else if (road) {
    parts.push(road);
  }

  if (quarter && quarter !== road) {
    parts.push(quarter.startsWith('Phường') || quarter.startsWith('P.') ? quarter : `Phường ${quarter}`);
  }

  if (district) {
    parts.push(district.startsWith('Quận') || district.startsWith('Q.') || district.includes('Thủ Đức') ? district : `Quận ${district}`);
  }

  parts.push('TP.HCM');

  if (parts.length < 2) return null;
  return parts.join(', ');
}

(async () => {
  const spots = await p.parkingSpot.findMany();
  console.log(`Checking and enriching full street addresses for all ${spots.length} spots...\n`);

  let updatedCount = 0;

  for (let i = 0; i < spots.length; i++) {
    const s = spots[i];
    const addr = (s.address || '').trim();

    // Check if address is incomplete (lacks street details, starts with comma, or is generic)
    const isShort = addr.length < 22 || addr.startsWith(',') || addr === 'Thành phố Hồ Chí Minh' || /^Quận\s*\d+,\s*TP\.HCM$/i.test(addr) || !/\d+|\s+(Đường|Phố|Đại lộ|Phường|Đô Thành|Lê|Nguyễn|Trần|Phạm|Huỳnh|Võ|Pasteur|Bến|Tôn)/i.test(addr);

    if (isShort) {
      console.log(`[${i + 1}/${spots.length}] Fetching full address for ID ${s.id} ("${s.name}") at (${s.lat}, ${s.lng})...`);
      const geo = await fetchReverseGeocode(s.lat, s.lng);
      await sleep(1100); // 1.1s delay for Nominatim rate limit

      let newAddress = formatFullAddress(geo, s.lat, s.lng);

      if (newAddress && newAddress.length >= 15) {
        // Clean up district formatting
        newAddress = newAddress.replace(/,?\s*Thành phố Hồ Chí Minh/gi, '').trim();
        if (!newAddress.endsWith('TP.HCM')) newAddress += ', TP.HCM';

        let newName = s.name;
        // If name is generic (like "Trạm xăng" or "Quán Cafe"), add street name
        if (s.name === 'Trạm xăng' || s.name === 'Quán Cafe' || s.name === 'Nhà hàng') {
          const streetMatch = newAddress.match(/([^,]+)/);
          if (streetMatch) {
            newName = `${s.name} - ${streetMatch[1].trim()}`;
          }
        }

        console.log(`  ✨ [UPDATED] Name: "${newName}"`);
        console.log(`               Addr: "${newAddress}"\n`);

        await p.parkingSpot.update({
          where: { id: s.id },
          data: { name: newName, address: newAddress }
        });

        updatedCount++;
      } else {
        console.log(`  ⚠️ Could not fetch better address for ID ${s.id}\n`);
      }
    }
  }

  console.log(`\n🎉 Completed! Successfully enriched ${updatedCount} spots with full detailed street addresses.`);
  await p.$disconnect();
})();
