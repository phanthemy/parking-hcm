import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const DISTRICT_SLUGS = [
  'quan-1', 'quan-3', 'quan-4', 'quan-5', 'quan-6', 'quan-7', 'quan-8',
  'quan-10', 'quan-11', 'quan-12',
  'binh-thanh', 'phu-nhuan', 'tan-binh', 'tan-phu', 'go-vap',
  'thu-duc', 'binh-tan',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mapgo.vn';
  const now = new Date();

  let spots: { id: string; slug: string | null; updatedAt: Date }[] = [];
  try {
    spots = await prisma.parkingSpot.findMany({
      where: { status: { in: ['active', 'ACTIVE'] } },
      select: { id: true, slug: true, updatedAt: true },
    });
  } catch (e) {
    console.error('Sitemap DB query error:', e);
  }

  const spotUrls = spots.map((spot) => ({
    url: `${baseUrl}/bai-xe/${spot.slug || spot.id}`,
    lastModified: spot.updatedAt || now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Landing pages theo Quận
  const districtUrls = DISTRICT_SLUGS.map((slug) => ({
    url: `${baseUrl}/bai-do-xe/${slug}`,
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

  const additionalUrls = [
    { url: `${baseUrl}/bai-do-xe-tphcm`, priority: 0.95 },
    { url: `${baseUrl}/blog`, priority: 0.7 },
    { url: `${baseUrl}/blog/bai-do-xe-tphcm`, priority: 0.85 },
    { url: `${baseUrl}/blog/bai-giu-xe-o-to-qua-dem`, priority: 0.85 },
    { url: `${baseUrl}/blog/gia-gui-xe-o-to-tphcm`, priority: 0.85 },
    { url: `${baseUrl}/blog/nha-ve-sinh-cong-cong-tphcm`, priority: 0.85 },
    { url: `${baseUrl}/blog/quan-an-co-bai-do-xe`, priority: 0.85 },
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
    ...additionalUrls,
    ...districtUrls,
    ...categoryUrls,
    // Individual spot pages
    ...spotUrls,
  ];
}
