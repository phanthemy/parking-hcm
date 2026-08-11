const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const totalSpots = await p.parkingSpot.count();
  const totalImages = await p.parkingImage.count();
  const byType = await p.parkingSpot.groupBy({ by: ['type'], _count: true });
  const byStatus = await p.parkingSpot.groupBy({ by: ['status'], _count: true });
  const spotsNoImg = await p.parkingSpot.count({ where: { images: { none: {} } } });
  console.log('Total spots:', totalSpots);
  console.log('Total images:', totalImages);
  console.log('Spots without images:', spotsNoImg);
  console.log('By type:', JSON.stringify(byType, null, 2));
  console.log('By status:', JSON.stringify(byStatus, null, 2));
  
  // Check sample images
  const sample = await p.parkingImage.findMany({ take: 5 });
  console.log('Sample image URLs:', sample.map(i => i.url));
  
  // Check if any spot with image has wrong/broken path
  const imgPaths = await p.parkingImage.findMany({ select: { url: true } });
  const localPaths = imgPaths.filter(i => i.url.startsWith('/uploads'));
  const externalPaths = imgPaths.filter(i => i.url.startsWith('http'));
  const otherPaths = imgPaths.filter(i => !i.url.startsWith('/uploads') && !i.url.startsWith('http'));
  console.log('Local image paths:', localPaths.length);
  console.log('External image paths:', externalPaths.length);
  console.log('Other paths:', otherPaths.length, otherPaths.map(i => i.url));
  
  // Check if the /uploads/places files actually exist on disk
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'places');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const spotFiles = files.filter(f => f.startsWith('spot_'));
    const cacheFiles = files.filter(f => f.startsWith('cache_'));
    console.log('Spot image files on disk:', spotFiles.length);
    console.log('Cache files on disk:', cacheFiles.length);
    
    // Check file sizes for first few
    const sizes = spotFiles.slice(0, 5).map(f => {
      const stat = fs.statSync(path.join(uploadsDir, f));
      return { file: f, size: stat.size };
    });
    console.log('Sample file sizes:', JSON.stringify(sizes));
  } else {
    console.log('uploads/places dir NOT FOUND!');
  }
  
  await p.$disconnect();
})();
