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
  // Catch all Vietnamese phone number patterns
  const allPhones = text.match(/0\d[\d\s.\-]{7,12}/g) || [];
  for (const raw of allPhones) {
    const clean = raw.replace(/[\s.\-]/g, '');
    if (clean.length === 10 || clean.length === 11) {
      info.phone = clean;
      break;
    }
  }

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
  // Extract ALL price patterns: "10.000 VNĐ/đêm", "150.000 VNĐ/tháng", "1tr5/tháng", etc.
  const pricePatterns = [
    // "xxx VNĐ/tháng" or "xxx đ/tháng" or "xxx/tháng"
    /([\d.,]+)\s*(?:VNĐ|vnđ|đồng|đ|d)?\s*\/\s*tháng/gi,
    // "giá xxx" with unit
    /giá\s*(?:thuê|gửi|xe|ô tô|xe máy)?\s*:?\s*([\d.,]+)\s*(?:VNĐ|vnđ|đồng|đ|k|ngàn|triệu|tr)/gi,
    // "xxxk/tháng" or "xxxtr/tháng"
    /([\d.,]+)\s*(?:k|tr|triệu)\s*\/\s*tháng/gi,
  ];

  let monthlyPrices: number[] = [];
  for (const pattern of pricePatterns) {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      let raw = m[1].replace(/\./g, '').replace(/,/g, '');
      let val = parseInt(raw);
      const ctx = m[0].toLowerCase();
      if (ctx.includes('triệu') || ctx.includes('tr')) val *= 1000000;
      else if (ctx.includes('k') || ctx.includes('ngàn')) val *= 1000;
      if (val > 0 && val < 100000000) monthlyPrices.push(val);
    }
  }

  if (monthlyPrices.length > 0) {
    // Use the smallest price as "starting from"
    const minPrice = Math.min(...monthlyPrices);
    info.priceMonthly = minPrice.toLocaleString('vi-VN') + ' đ/tháng';
    // Auto-calculate hourly: monthly / 30 / 12h (rough estimate)
    info.pricePerHour = Math.round(minPrice / 30 / 12);
  }

  // Hourly price (explicit)
  const hourlyMatch = text.match(/([\d.,]+)\s*(?:VNĐ|vnđ|đồng|đ|k)?\s*\/\s*(?:giờ|h|hour)/i);
  if (hourlyMatch) {
    let val = parseInt(hourlyMatch[1].replace(/[.,]/g, ''));
    if (hourlyMatch[0].toLowerCase().includes('k')) val *= 1000;
    info.pricePerHour = val;
  }

  // Daily/nightly price
  const dailyMatch = text.match(/([\d.,]+)\s*(?:VNĐ|vnđ|đồng|đ)?\s*\/\s*(?:đêm|ngày|đ|dem|ngay)/i);
  if (dailyMatch && !info.pricePerHour) {
    let val = parseInt(dailyMatch[1].replace(/[.,]/g, ''));
    info.pricePerHour = Math.round(val / 12); // rough hourly from daily
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

  // Get original post content for building description
  let description = '';
  let postContent = '';
  if (postId) {
    const post = await prisma.facebookPost.findUnique({ where: { id: postId } });
    postContent = post?.content || '';
  }

  // Build structured description from content
  if (postContent) {
    description = buildDescription(postContent);
  }

  // Create new parking spot
  const spot = await prisma.parkingSpot.create({
    data: {
      name: name || 'Bãi xe mới',
      address: address || '',
      description: description || null,
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

// Build structured description with price table from raw FB post text
function buildDescription(text: string): string {
  const parts: string[] = [];

  // Extract ALL price entries: "Xe máy: 150.000 VNĐ/tháng", etc.
  const priceLines: string[] = [];
  const priceRegex = /((?:xe\s*(?:máy|hơi|tải|khách|ô tô|3 gác|ba gác)(?:\s*\d+\w*)?(?:\s*\(.*?\))?)\s*:?\s*[\d.,]+\s*(?:VNĐ|vnđ|đồng|đ|k|triệu|tr)\s*\/\s*(?:đêm|ngày|tháng|giờ))/gi;
  let match;
  while ((match = priceRegex.exec(text)) !== null) {
    priceLines.push(match[1].trim());
  }

  // Also try pattern: "10.000 VNĐ/đêm" standalone
  const standalonePrice = /(\d[\d.,]*)\s*(VNĐ|vnđ|đồng|đ)\s*\/\s*(đêm|ngày|tháng|giờ)/gi;
  while ((match = standalonePrice.exec(text)) !== null) {
    const ctx = text.substring(Math.max(0, match.index - 50), match.index + match[0].length);
    const vehicleMatch = ctx.match(/(xe\s*(?:máy|hơi|tải|khách|ô tô)[^:]*)/i);
    if (vehicleMatch && !priceLines.some(l => l.includes(match![0]))) {
      priceLines.push(`${vehicleMatch[1].trim()}: ${match[0]}`);
    }
  }

  if (priceLines.length > 0) {
    parts.push('📋 BẢNG GIÁ:');
    priceLines.forEach(line => {
      parts.push(`• ${line}`);
    });
  }

  // Extract contact info
  const phoneMatch = text.match(/(?:liên hệ|lh|hotline|zalo|sdt)\s*:?\s*(0[\d\s.\-]{8,14}(?:\s*\([^)]*\))?)/i);
  if (phoneMatch) {
    parts.push(`\n📞 Liên hệ: ${phoneMatch[1].trim()}`);
  }

  // Extract address
  const addrMatch = text.match(/(?:địa chỉ|đ\/c|📍)\s*:?\s*([^\n]{10,150})/i);
  if (addrMatch) {
    parts.push(`📍 ${addrMatch[1].trim()}`);
  }

  // Features
  const features: string[] = [];
  if (/mái che/i.test(text)) features.push('Mái che');
  if (/camera/i.test(text)) features.push('Camera giám sát');
  if (/bảo vệ/i.test(text)) features.push('Bảo vệ 24/7');
  if (/24\s*\/?\s*7|24h/i.test(text)) features.push('Mở cửa 24/7');
  if (/rộng|thoáng/i.test(text)) features.push('Bãi rộng rãi');
  if (/cho thuê đất/i.test(text)) features.push('Cho thuê đất');

  if (features.length > 0) {
    parts.push(`\n✨ Tiện ích: ${features.join(', ')}`);
  }

  return parts.join('\n');
}
