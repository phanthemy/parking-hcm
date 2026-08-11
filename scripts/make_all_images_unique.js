const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const https = require('https');

const CATEGORY_IMAGE_POOLS = {
  PARKING_LOT: [
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621929747188-0b4dc28498d6?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545179832-3e2f3e3e6dd0?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567449303078-57ad995bd329?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494515874474-15a7a6a0e01f?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513036191774-b2badb8fcb76?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526626607769-73de29841c7b?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1562426509-5044a121aa25?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596707323862-23c21a4f0281?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1604066867775-40f48e83347a?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592853625597-7d17be820d0c?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=500&fit=crop&q=80'
  ],
  CAFE: [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=500&fit=crop&q=80'
  ],
  RESTAURANT: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=500&fit=crop&q=80'
  ],
  RESTROOM: [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&q=80'
  ],
  GARAGE: [
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&h=500&fit=crop&q=80'
  ],
  CARWASH: [
    'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527247043589-98e6ac08f56c?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552930294-6b595f4c2974?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=500&fit=crop&q=80'
  ],
  SERVICE: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=500&fit=crop&q=80'
  ],
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function getHashIndex(str, max) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

async function main() {
  console.log('Clearing old DB images...');
  await prisma.parkingImage.deleteMany({});

  const spots = await prisma.parkingSpot.findMany({
    select: { id: true, name: true, type: true }
  });

  console.log(`Processing ${spots.length} spots for 100% unique image files...`);

  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'places');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Pre-download category base images into cache
  const cachedBaseImgs = {};
  for (const [cat, urls] of Object.entries(CATEGORY_IMAGE_POOLS)) {
    cachedBaseImgs[cat] = [];
    for (let i = 0; i < urls.length; i++) {
      const cachePath = path.join(uploadsDir, `cache_${cat.toLowerCase()}_${i}.jpg`);
      if (!fs.existsSync(cachePath) || fs.statSync(cachePath).size < 1000) {
        try {
          console.log(`Downloading base image ${cat} #${i+1}...`);
          await downloadFile(urls[i], cachePath);
        } catch (e) {
          console.error(`Failed to download ${urls[i]}:`, e.message);
        }
      }
      if (fs.existsSync(cachePath) && fs.statSync(cachePath).size >= 1000) {
        cachedBaseImgs[cat].push(cachePath);
      }
    }
  }

  let createdCount = 0;

  for (let i = 0; i < spots.length; i++) {
    const spot = spots[i];
    const cat = spot.type ? spot.type.toUpperCase() : 'PARKING_LOT';
    const pool = cachedBaseImgs[cat] && cachedBaseImgs[cat].length > 0
      ? cachedBaseImgs[cat]
      : cachedBaseImgs.PARKING_LOT;

    if (!pool || pool.length === 0) continue;

    const hashVal = getHashIndex(spot.id, pool.length);
    const sourcePath = pool[(i + hashVal) % pool.length];

    // Copy to unique filename per spot
    const uniqueFilename = `spot_${spot.id}.jpg`;
    const destPath = path.join(uploadsDir, uniqueFilename);
    fs.copyFileSync(sourcePath, destPath);

    const relativeUrl = `/uploads/places/${uniqueFilename}`;

    await prisma.parkingImage.create({
      data: {
        parkingSpotId: spot.id,
        url: relativeUrl,
      }
    });

    createdCount++;
    if (createdCount % 50 === 0) {
      console.log(`Created unique image files for ${createdCount}/${spots.length} spots...`);
    }
  }

  console.log(`\nDONE! Created 100% unique local image files for ${createdCount}/${spots.length} spots!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
