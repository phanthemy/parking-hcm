const{PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
const fs = require('fs');
const path = require('path');

(async()=>{
  // Delete ALL "real_" prefixed images - these are Google Image scraper results (unreliable)
  const imgs = await p.parkingImage.findMany({ select: { id: true, url: true } });
  console.log(`Total images: ${imgs.length}`);
  
  const fakeIds = [];
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'places');
  
  for (const img of imgs) {
    const filename = path.basename(img.url);
    // "real_" prefix images are from Google scraper = unreliable content
    if (filename.startsWith('real_')) {
      fakeIds.push(img.id);
      // Also delete file from disk
      const fp = path.join(uploadsDir, filename);
      if (fs.existsSync(fp)) {
        fs.unlinkSync(fp);
      }
    }
  }
  
  console.log(`Fake scraper images to delete: ${fakeIds.length}`);
  
  if (fakeIds.length > 0) {
    const deleted = await p.parkingImage.deleteMany({
      where: { id: { in: fakeIds } }
    });
    console.log(`Deleted ${deleted.count} fake images from DB`);
  }
  
  const remaining = await p.parkingImage.count();
  console.log(`Remaining real images: ${remaining}`);
  
  await p.$disconnect();
})();
