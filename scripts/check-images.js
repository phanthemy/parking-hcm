const{PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
const fs = require('fs');
const path = require('path');

(async()=>{
  // Find Tao Dan spot
  const spot = await p.parkingSpot.findFirst({ 
    where: { name: { contains: 'Tao' } }, 
    include: { images: true } 
  });
  if(spot) { 
    console.log('Spot:', spot.name);
    spot.images.forEach(i => {
      const fp = path.join(__dirname, '..', 'public', i.url);
      const size = fs.existsSync(fp) ? fs.statSync(fp).size : 'MISSING';
      console.log(`  ${i.url} → ${size} bytes`);
    });
  }
  
  // Check how images were generated - sample some "real_" files
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'places');
  const files = fs.readdirSync(uploadsDir).slice(0, 10);
  console.log('\nSample files on disk:');
  files.forEach(f => {
    const size = fs.statSync(path.join(uploadsDir, f)).size;
    console.log(`  ${f} → ${(size/1024).toFixed(1)} KB`);
  });
  
  await p.$disconnect();
})();
