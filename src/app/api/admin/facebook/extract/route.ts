import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Extract structured info from FB post text using regex patterns
function extractSpotInfo(text: string) {
  const info: {
    name: string;
    address: string;
    phone: string;
    pricePerHour: number;
    priceMonthly: string;
    type: string;
    features: string[];
  } = {
    name: '',
    address: '',
    phone: '',
    pricePerHour: 0,
    priceMonthly: '',
    type: 'PARKING_LOT',
    features: []
  };

  // === PHONE ===
  const phoneMatch = text.match(/(?:lh|liên hệ|sdt|hotline|zalo|call|gọi|☎|📞|📱)?\s*:?\s*(0\d{8,9})/i)
    || text.match(/(0\d{2}[\s.-]?\d{3}[\s.-]?\d{3,4})/);
  if (phoneMatch) info.phone = phoneMatch[1].replace(/[\s.-]/g, '');

  // === ADDRESS ===
  // Pattern 1: Explicit "Địa chỉ: ..." or "Đ/C: ..."
  const addrMatch = text.match(/(?:địa chỉ|đ\/c|📍|location)\s*:?\s*([^\n.]{10,120})/i);
  if (addrMatch) {
    info.address = addrMatch[1].trim().replace(/[,.]$/, '');
  } else {
    // Pattern 2: Look for street number + street name patterns
    const streetMatch = text.match(/(\d{1,5}[\/\-]?\d{0,5}\s+(?:đường|phố|ngõ|hẻm|kiệt)?\s*[A-ZÀ-Ỹ][a-zà-ỹ]+(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]+){0,5}(?:,\s*(?:phường|quận|q\.|p\.|tp|quận \d+|q\d+)[^,\n]{0,50})?)/i);
    if (streetMatch) info.address = streetMatch[1].trim();
    
    // Pattern 3: Number + name with district
    const streetMatch2 = text.match(/(\d{1,5}[\/\-]?\d{0,5}\s+[^\n,]{5,60}(?:quận|q\.|bình thạnh|gò vấp|thủ đức|tân phú|tân bình|phú nhuận|bình tân)[^,\n]{0,30})/i);
    if (!info.address && streetMatch2) info.address = streetMatch2[1].trim();
  }

  // === PRICE ===
  // Monthly price
  const monthlyMatch = text.match(/(\d[\d.,]*)\s*(?:k|ngàn|nghìn|triệu|tr)?\s*(?:\/\s*tháng|\/tháng|đồng\/tháng|vnđ\/tháng)/i)
    || text.match(/giá\s*(?:thuê|gửi)?\s*:?\s*(\d[\d.,]*)\s*(?:k|ngàn|nghìn|triệu|tr|vnđ|đ)/i);
  if (monthlyMatch) {
    let val = monthlyMatch[1].replace(/[.,]/g, '');
    const numVal = parseInt(val);
    const unit = monthlyMatch[0].toLowerCase();
    if (unit.includes('triệu') || unit.includes('tr')) {
      info.priceMonthly = (numVal * 1000000).toLocaleString('vi-VN') + ' đ/tháng';
    } else if (unit.includes('k') || unit.includes('ngàn') || unit.includes('nghìn')) {
      info.priceMonthly = (numVal * 1000).toLocaleString('vi-VN') + ' đ/tháng';
    } else if (numVal > 100000) {
      info.priceMonthly = numVal.toLocaleString('vi-VN') + ' đ/tháng';
    }
  }

  // Hourly price
  const hourlyMatch = text.match(/(\d[\d.,]*)\s*(?:k|ngàn|nghìn)?\s*(?:\/\s*giờ|\/giờ|đồng\/giờ)/i);
  if (hourlyMatch) {
    let val = parseInt(hourlyMatch[1].replace(/[.,]/g, ''));
    if (hourlyMatch[0].toLowerCase().includes('k') || hourlyMatch[0].toLowerCase().includes('ngàn')) val *= 1000;
    info.pricePerHour = val;
  }

  // === NAME ===
  // Try to extract from first line or bold text
  const lines = text.split('\n').filter(l => l.trim().length > 5);
  
  // Check for explicit parking lot name patterns
  const nameMatch = text.match(/(?:bãi giữ xe|bãi đậu|bãi xe|nhận giữ xe)\s+([^\n.!?]{5,60})/i)
    || text.match(/^([^\n]{5,80})/);
  
  if (nameMatch) {
    let name = nameMatch[1].trim();
    // Clean up
    name = name.replace(/[🚗🚙🅿️📍🔥✅💥⭐🏆☎📞\*]/g, '').trim();
    if (name.length > 60) name = name.substring(0, 60);
    info.name = name;
  }
  
  // If no good name, create from address
  if (!info.name && info.address) {
    info.name = 'Bãi xe ' + info.address.substring(0, 40);
  }

  // === FEATURES ===
  const featurePatterns: [RegExp, string][] = [
    [/mái che/i, 'Có mái che'],
    [/camera/i, 'Camera giám sát'],
    [/bảo vệ|an ninh/i, 'Bảo vệ 24/7'],
    [/24\/24|24\/7/i, 'Mở cửa 24/7'],
    [/rộng rãi/i, 'Bãi rộng rãi'],
    [/sạch sẽ/i, 'Sạch sẽ'],
    [/giờ tự do/i, 'Giờ ra vào tự do'],
    [/có chìa khóa|đem chìa/i, 'Giữ chìa khóa'],
    [/hầm/i, 'Bãi hầm'],
  ];
  
  for (const [pattern, label] of featurePatterns) {
    if (pattern.test(text)) info.features.push(label);
  }

  // === TYPE ===
  if (/xe tải|xe 3 gác|xe lớn/i.test(text)) info.type = 'PARKING_LOT';
  if (/rửa xe/i.test(text)) info.type = 'CARWASH';
  if (/sửa xe|garage/i.test(text)) info.type = 'GARAGE';

  return info;
}

// POST: Extract info from post content
export async function POST(request: NextRequest) {
  const { postId } = await request.json();
  
  const post = await prisma.facebookPost.findUnique({
    where: { id: postId },
    include: { images: true }
  });
  
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const extracted = extractSpotInfo(post.content || '');
  
  // Search for similar existing spots
  const existingSpots = [];
  if (extracted.address) {
    const keywords = extracted.address.split(/[\s,]+/).filter(w => w.length > 3).slice(0, 3);
    for (const kw of keywords) {
      const spots = await prisma.parkingSpot.findMany({
        where: { address: { contains: kw } },
        select: { id: true, name: true, address: true },
        take: 3
      });
      existingSpots.push(...spots);
    }
  }
  
  // Deduplicate
  const uniqueSpots = Array.from(new Map(existingSpots.map(s => [s.id, s])).values());

  return NextResponse.json({
    extracted,
    existingSpots: uniqueSpots.slice(0, 5),
    postImages: post.images.map(img => img.url),
    postContent: post.content
  });
}

// PUT: Create new spot from extracted data & link post
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { postId, name, address, phone, type, pricePerHour, images, lat, lng } = body;

  // Create new parking spot
  const spot = await prisma.parkingSpot.create({
    data: {
      name: name || 'Bãi xe mới',
      address: address || '',
      phone: phone || null,
      type: type || 'PARKING_LOT',
      pricePerHour: pricePerHour || 0,
      lat: lat || 10.78,
      lng: lng || 106.69,
      openTime: '00:00',
      closeTime: '23:59',
      status: 'ACTIVE',
      images: images?.length ? {
        create: images.map((url: string) => ({ url }))
      } : undefined
    }
  });

  // Update FB post status
  if (postId) {
    await prisma.facebookPost.update({
      where: { id: postId },
      data: { status: 'approved', matchedSpotId: spot.id }
    });
  }

  return NextResponse.json({ spot });
}
