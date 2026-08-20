/**
 * MAPGO SEO ENGINE - BASE SCHEMAS (WEBSITE, ORG, BREADCRUMB)
 */

import { SchemaNode } from './graph';

export function buildWebSiteSchema(baseUrl = 'https://mapgo.vn'): SchemaNode {
  return {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: `${baseUrl}/`,
    name: 'MapGo - Bản đồ Tiện ích Giao thông & Đô thị Thời Gian Thực',
    description: 'Tìm kiếm bãi đỗ xe, trạm sạc xe điện, cây xăng, gara sửa xe và nhà vệ sinh công cộng gần bạn tại Việt Nam.',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationSchema(baseUrl = 'https://mapgo.vn'): SchemaNode {
  return {
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'MapGo Vietnam',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
      caption: 'MapGo - Mobility Search Engine',
    },
    sameAs: [
      'https://www.facebook.com/mapgo.vn',
      'https://zalo.me/mapgo',
    ],
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[], baseUrl = 'https://mapgo.vn'): SchemaNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${items[items.length - 1]?.url || baseUrl}/#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}
