const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found in DB");
    return;
  }
  const ownerId = user.id;
  
  // HCMC Bbox
  const bbox = "10.70,106.55,10.85,106.75";
  
  const queries = [
    { type: 'RESTROOM', query: `[out:json][timeout:25];(node["amenity"="toilets"](${bbox}););out center 40;` },
    { type: 'PARKING_LOT', query: `[out:json][timeout:25];(node["amenity"="parking"](${bbox}););out center 50;` },
    { type: 'RESTAURANT', query: `[out:json][timeout:25];(node["amenity"="restaurant"](${bbox}););out center 40;` },
    { type: 'CAFE', query: `[out:json][timeout:25];(node["amenity"="cafe"](${bbox}););out center 30;` },
    { type: 'SERVICE', query: `[out:json][timeout:25];(node["amenity"="fuel"](${bbox});node["amenity"="atm"](${bbox}););out center 30;` }
  ];

  const images = {
    'RESTROOM': ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600'],
    'PARKING_LOT': ['https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=600'],
    'RESTAURANT': ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600'],
    'CAFE': ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600'],
    'SERVICE': ['https://images.unsplash.com/photo-1563853922378-0d1254bfdf2f?q=80&w=600']
  };

  let totalAdded = 0;

  for (const q of queries) {
    console.log("Fetching " + q.type + "...");
    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MapGoSeed/1.0 (contact@mapgo.vn)'
        },
        body: "data=" + encodeURIComponent(q.query),
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        const elements = data.elements || [];
        console.log("Found " + elements.length + " " + q.type);

        for (const el of elements) {
          if (!el.tags) continue;
          let name = el.tags.name || el.tags.amenity || q.type;
          // Vietnamese names mapping if missing
          if (name === 'toilets') name = 'Nhà vệ sinh công cộng';
          if (name === 'parking') name = 'Bãi đỗ xe';
          if (name === 'cafe') name = 'Quán Cafe';
          if (name === 'restaurant') name = 'Nhà hàng';
          if (name === 'fuel') name = 'Trạm xăng';
          if (name === 'atm') name = 'ATM';

          const lat = el.lat || el.center?.lat;
          const lng = el.lon || el.center?.lon;
          if (!lat || !lng) continue;

          // Check if exists
          const existing = await prisma.parkingSpot.findFirst({
            where: { name, type: q.type, lat, lng }
          });

          if (!existing) {
            const spot = await prisma.parkingSpot.create({
              data: {
                name: name,
                address: el.tags['addr:full'] || el.tags['addr:street'] || 'Thành phố Hồ Chí Minh',
                lat: lat,
                lng: lng,
                type: q.type,
                carSlots: Math.floor(Math.random() * 50),
                bikeSlots: Math.floor(Math.random() * 200),
                pricePerHour: (Math.floor(Math.random() * 5) + 1) * 10000,
                openTime: '06:00',
                closeTime: '22:00',
                ownerId: ownerId,
                phone: el.tags.phone || null,
                website: el.tags.website || null,
              }
            });

            await prisma.parkingImage.create({
              data: {
                url: images[q.type][0],
                parkingSpotId: spot.id
              }
            });
            totalAdded++;
          }
        }
      } catch (e) {
        console.log("Response was:", text.substring(0, 200));
        throw e;
      }
    } catch (e) {
      console.error("Failed fetching " + q.type + ":", e.message);
    }
  }

  console.log("Total added: " + totalAdded);
}

main().catch(console.error).finally(() => prisma.$disconnect());
