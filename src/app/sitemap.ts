import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const DISTRICT_SLUGS = [
  'quan-1', 'quan-3', 'quan-5', 'quan-7', 'quan-10',
  'binh-thanh', 'phu-nhuan', 'tan-binh', 'thu-duc', 'binh-tan',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mapgo.vn';
  const now = new Date();

  let spots: { id: string; updatedAt: Date }[] = [];
  try {
    spots = await prisma.parkingSpot.findMany({
      where: { status: { in: ['active', 'ACTIVE'] } },
      select: { id: true, updatedAt: true },
    });
  } catch (e) {
    console.error('Sitemap DB query error:', e);
  }

  const spotUrls = spots.map((spot) => ({
    url: `${baseUrl}/spot/${spot.id}`,
    lastModified: spot.updatedAt || now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Landing pages theo Quận
  const districtUrls = DISTRICT_SLUGS.map((slug) => ({
    url: `${baseUrl}/bai-xe/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Category landing pages
  const categoryUrls = [
    { url: `${baseUrl}/quan-an/co-bai-xe`, priority: 0.9 },
    { url: `${baseUrl}/cafe/co-bai-xe`, priority: 0.9 },
    { url: `${baseUrl}/nha-ve-sinh/gan-day`, priority: 0.9 },
  ].map((p) => ({
    ...p,
    lastModified: now,
    changeFrequency: 'weekly' as const,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Auth pages — low priority
    { url: `${baseUrl}/auth/login`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/auth/register`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 },
    // SEO Landing pages — high priority
    ...districtUrls,
    ...categoryUrls,
    // Individual spot pages
    ...spotUrls,
  ];
}
