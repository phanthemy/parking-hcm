/**
 * MAPGO SEO ENGINE - DYNAMIC METADATA GENERATOR
 * Generates Next.js App Router compatible Metadata objects with canonical, OpenGraph, Twitter, and Robots
 */

import { Metadata } from 'next';

export interface MetadataOptions {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
}

export function generateSEOMetadata(options: MetadataOptions, baseUrl = 'https://mapgo.vn'): Metadata {
  const fullCanonicalUrl = options.canonicalPath.startsWith('http')
    ? options.canonicalPath
    : `${baseUrl}${options.canonicalPath.startsWith('/') ? '' : '/'}${options.canonicalPath}`;

  const defaultOgImage = `${baseUrl}/og-image.png`;
  const image = options.ogImage || defaultOgImage;

  return {
    title: `${options.title} | MapGo`,
    description: options.description,
    alternates: {
      canonical: fullCanonicalUrl,
    },
    robots: options.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      title: `${options.title} | MapGo`,
      description: options.description,
      url: fullCanonicalUrl,
      siteName: 'MapGo Vietnam',
      locale: 'vi_VN',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${options.title} | MapGo`,
      description: options.description,
      images: [image],
      creator: '@mapgovn',
    },
    keywords: options.keywords || [
      'bãi đỗ xe',
      'bãi giữ xe gần đây',
      'trạm sạc xe điện',
      'gara ô tô',
      'nhà vệ sinh công cộng',
      'MapGo',
    ],
  };
}
