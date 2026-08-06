const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

// Unsplash images - free, high quality, hotlinkable
const IMGS = {
  'PARKING_LOT': [
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621929747188-0b4dc28498d6?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545179832-3e2f3e3e6dd0?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567449303078-57ad995bd329?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494515874474-15a7a6a0e01f?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513036191774-b2badb8fcb76?w=600&h=400&fit=crop&q=80',
  ],
  'CAFE': [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&h=400&fit=crop&q=80',
  ],
  'RESTAURANT': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop&q=80',
  ],
  'RESTROOM': [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop&q=80',
  ],
  'SERVICE': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&q=80',
  ],
};

(async () => {
  const spots = await p.parkingSpot.findMany({
    select: { id: true, name: true, type: true, images: { select: { id: true } } },
    orderBy: { name: 'asc' }
  });

  let updated = 0;

  for (let i = 0; i < spots.length; i++) {
    const s = spots[i];

    if (s.images && s.images.length > 0) {
      console.log(`[${i+1}/${spots.length}] SKIP ${s.name} (has ${s.images.length} images)`);
      continue;
    }

    const pool = IMGS[s.type] || IMGS['PARKING_LOT'];
    const url = pool[i % pool.length];

    await p.parkingImage.create({
      data: {
        url: url,
        parkingSpotId: s.id,
      }
    });

    updated++;
    console.log(`[${i+1}/${spots.length}] ✅ ${s.name} → image added`);
  }

  console.log(`\nDone! Added images to ${updated}/${spots.length} spots.`);
  await p.$disconnect();
})();
