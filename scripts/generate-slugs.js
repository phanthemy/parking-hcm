// Script to generate SEO-friendly slugs for all existing ParkingSpots
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function toSlug(name, address) {
  // Vietnamese character map
  const map = {
    'à':'a','á':'a','ạ':'a','ả':'a','ã':'a','â':'a','ầ':'a','ấ':'a','ậ':'a','ẩ':'a','ẫ':'a',
    'ă':'a','ằ':'a','ắ':'a','ặ':'a','ẳ':'a','ẵ':'a',
    'è':'e','é':'e','ẹ':'e','ẻ':'e','ẽ':'e','ê':'e','ề':'e','ế':'e','ệ':'e','ể':'e','ễ':'e',
    'ì':'i','í':'i','ị':'i','ỉ':'i','ĩ':'i',
    'ò':'o','ó':'o','ọ':'o','ỏ':'o','õ':'o','ô':'o','ồ':'o','ố':'o','ộ':'o','ổ':'o','ỗ':'o',
    'ơ':'o','ờ':'o','ớ':'o','ợ':'o','ở':'o','ỡ':'o',
    'ù':'u','ú':'u','ụ':'u','ủ':'u','ũ':'u','ư':'u','ừ':'u','ứ':'u','ự':'u','ử':'u','ữ':'u',
    'ỳ':'y','ý':'y','ỵ':'y','ỷ':'y','ỹ':'y',
    'đ':'d','Đ':'d',
  };

  let text = name.toLowerCase();
  // Replace Vietnamese chars
  text = text.split('').map(c => map[c] || c).join('');
  // Remove emojis & special chars
  text = text.replace(/[^\w\s-]/g, '').trim();
  // Replace spaces with hyphens
  text = text.replace(/[\s_]+/g, '-');
  // Remove multiple hyphens
  text = text.replace(/-+/g, '-');
  // Remove leading/trailing hyphens
  text = text.replace(/^-|-$/g, '');

  // Add district from address for uniqueness
  if (address) {
    const addrLow = address.toLowerCase();
    const districts = [
      ['quận 1', 'quan-1'], ['quận 2', 'quan-2'], ['quận 3', 'quan-3'],
      ['quận 4', 'quan-4'], ['quận 5', 'quan-5'], ['quận 6', 'quan-6'],
      ['quận 7', 'quan-7'], ['quận 8', 'quan-8'], ['quận 9', 'quan-9'],
      ['quận 10', 'quan-10'], ['quận 11', 'quan-11'], ['quận 12', 'quan-12'],
      ['bình thạnh', 'binh-thanh'], ['phú nhuận', 'phu-nhuan'],
      ['tân bình', 'tan-binh'], ['tân phú', 'tan-phu'],
      ['gò vấp', 'go-vap'], ['thủ đức', 'thu-duc'], ['bình tân', 'binh-tan'],
      ['hóc môn', 'hoc-mon'], ['củ chi', 'cu-chi'], ['nhà bè', 'nha-be'],
      ['cần giờ', 'can-gio'], ['bình chánh', 'binh-chanh'],
      ['tp.hcm', 'hcm'], ['tp hcm', 'hcm'],
    ];
    const addrNorm = addrLow.split('').map(c => map[c] || c).join('');
    for (const [vi, slug] of districts) {
      const viNorm = vi.split('').map(c => map[c] || c).join('');
      if (addrNorm.includes(viNorm) && !text.includes(slug)) {
        text += '-' + slug;
        break;
      }
    }
  }

  return text.substring(0, 100); // Max 100 chars
}

async function main() {
  const spots = await prisma.parkingSpot.findMany({
    select: { id: true, name: true, address: true, slug: true }
  });

  console.log(`Found ${spots.length} spots to process`);

  const usedSlugs = new Set();
  let updated = 0;

  for (const spot of spots) {
    let slug = toSlug(spot.name, spot.address);
    
    // Ensure uniqueness
    let finalSlug = slug;
    let counter = 1;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    usedSlugs.add(finalSlug);

    try {
      await prisma.parkingSpot.update({
        where: { id: spot.id },
        data: { slug: finalSlug }
      });
      updated++;
      if (updated % 50 === 0) console.log(`  Updated ${updated}/${spots.length}...`);
    } catch (e) {
      console.error(`Failed to update ${spot.id} (${spot.name}):`, e.message);
    }
  }

  console.log(`\nDone! Updated ${updated}/${spots.length} spots with SEO slugs.`);
  
  // Show some examples
  const examples = await prisma.parkingSpot.findMany({
    select: { name: true, slug: true },
    take: 10
  });
  console.log('\nExample slugs:');
  examples.forEach(s => console.log(`  ${s.name} → /bai-xe/${s.slug}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
