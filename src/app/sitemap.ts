import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mapgo.vn';

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
    lastModified: spot.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const DISTRICTS = [
    'quan-1', 'quan-3', 'quan-4', 'quan-5', 'quan-6', 'quan-7', 'quan-8',
    'quan-10', 'quan-11', 'quan-12', 'binh-tan', 'binh-thanh', 'go-vap',
    'phu-nhuan', 'tan-binh', 'tan-phu', 'thu-duc', 'binh-chanh', 'cu-chi',
    'hoc-mon', 'nha-be', 'can-gio'
  ];

  const districtUrls = DISTRICTS.map((slug) => ({
    url: `${baseUrl}/quan/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...districtUrls,
    ...spotUrls,
  ];
}
