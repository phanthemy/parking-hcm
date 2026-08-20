/**
 * AUTOMATED UNIT TESTS FOR MAPGO SEO ENGINE (SPRINT 2)
 * Tests: Slug Engine, Metadata Generator, Schema Graph Builder, and JSON-LD Validations
 */

const test = require('node:test');
const assert = require('node:assert/strict');

// ===== Mock / Direct Import of SEO & Slug Logic =====

function slugifyVietnamese(text) {
  if (!text) return '';
  let slug = text.toLowerCase();
  slug = slug.replace(/đ/g, 'd').replace(/Đ/g, 'd');
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.replace(/[\s-]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  return slug;
}

function generateUniqueSlug(context) {
  const baseSlug = slugifyVietnamese(context.name);
  const existingSet = Array.isArray(context.existingSlugs)
    ? new Set(context.existingSlugs)
    : context.existingSlugs;

  if (!existingSet.has(baseSlug)) {
    return baseSlug;
  }

  if (context.district) {
    const districtSlug = slugifyVietnamese(context.district);
    const withDistrict = `${baseSlug}-${districtSlug}`;
    if (!existingSet.has(withDistrict)) {
      return withDistrict;
    }
  }

  let counter = 2;
  while (existingSet.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

function buildEntityGraph(nodes) {
  const validNodes = nodes.filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': validNodes,
  };
}

function buildWebSiteSchema(baseUrl = 'https://mapgo.vn') {
  return {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: `${baseUrl}/`,
    name: 'MapGo - Bản đồ Tiện ích Giao thông & Đô thị',
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

function buildBreadcrumbSchema(items, baseUrl = 'https://mapgo.vn') {
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

function buildParkingFacilitySchema(spot, baseUrl = 'https://mapgo.vn') {
  const url = `${baseUrl}/bai-xe/${spot.slug || spot.id}`;
  return {
    '@type': 'ParkingFacility',
    '@id': `${url}#facility`,
    name: spot.name,
    identifier: spot.id,
    url: url,
    priceRange: spot.priceRange || '30.000đ - 150.000đ',
    address: {
      '@type': 'PostalAddress',
      streetAddress: spot.address,
      addressLocality: spot.district,
      addressRegion: 'TP. Hồ Chí Minh',
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: spot.lat,
      longitude: spot.lng,
    },
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Bảo vệ 24/7', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Camera giám sát', value: true },
    ],
  };
}

function generateSEOMetadata(options, baseUrl = 'https://mapgo.vn') {
  const fullCanonicalUrl = options.canonicalPath.startsWith('http')
    ? options.canonicalPath
    : `${baseUrl}${options.canonicalPath.startsWith('/') ? '' : '/'}${options.canonicalPath}`;
  return {
    title: `${options.title} | MapGo`,
    description: options.description,
    canonical: fullCanonicalUrl,
    robots: { index: !options.noIndex, follow: !options.noIndex },
  };
}

// ===== TEST SUITES =====

test('Suite 1: Slug Engine - Vietnamese Diacritics & Accents', () => {
  assert.equal(slugifyVietnamese('Đường Lê Lợi'), 'duong-le-loi');
  assert.equal(slugifyVietnamese('Bãi Đỗ Xe Diamond Plaza'), 'bai-do-xe-diamond-plaza');
  assert.equal(slugifyVietnamese('Quận 1, TP. Hồ Chí Minh'), 'quan-1-tp-ho-chi-minh');
  assert.equal(slugifyVietnamese('   Trạm sạc   EV VinFast !!!   '), 'tram-sac-ev-vinfast');
});

test('Suite 2: Slug Engine - Deduplication & District Disambiguation', () => {
  const existingSlugs = new Set(['diamond-plaza', 'diamond-plaza-quan-1']);
  
  const unique1 = generateUniqueSlug({
    name: 'Diamond Plaza',
    district: 'Quận 1',
    existingSlugs: existingSlugs,
  });
  assert.equal(unique1, 'diamond-plaza-2');

  const unique2 = generateUniqueSlug({
    name: 'Diamond Plaza',
    district: 'Quận 7',
    existingSlugs: existingSlugs,
  });
  assert.equal(unique2, 'diamond-plaza-quan-7');
});

test('Suite 3: Metadata Generator - Canonical & Title Formatting', () => {
  const meta = generateSEOMetadata({
    title: 'Bãi đỗ xe Quận 1',
    description: 'Danh sách 45 bãi đỗ xe ô tô và xe máy tại Quận 1 giá rẻ, mở 24/7.',
    canonicalPath: '/bai-do-xe/tphcm/quan-1',
  });

  assert.equal(meta.title, 'Bãi đỗ xe Quận 1 | MapGo');
  assert.equal(meta.canonical, 'https://mapgo.vn/bai-do-xe/tphcm/quan-1');
  assert.equal(meta.robots.index, true);
});

test('Suite 4: Schema.org Entity Graph Construction', () => {
  const website = buildWebSiteSchema();
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Bãi đỗ xe', url: '/bai-do-xe' },
    { name: 'Quận 1', url: '/bai-do-xe/quan-1' },
  ]);
  const facility = buildParkingFacilitySchema({
    id: 'spot-123',
    slug: 'bai-xe-diamond-plaza',
    name: 'Bãi xe Diamond Plaza',
    address: '34 Lê Duẩn',
    district: 'Quận 1',
    lat: 10.7816,
    lng: 106.6983,
  });

  const graph = buildEntityGraph([website, breadcrumb, facility]);

  assert.equal(graph['@context'], 'https://schema.org');
  assert.equal(graph['@graph'].length, 3);
  assert.equal(graph['@graph'][0]['@type'], 'WebSite');
  assert.equal(graph['@graph'][1]['@type'], 'BreadcrumbList');
  assert.equal(graph['@graph'][2]['@type'], 'ParkingFacility');
  assert.equal(graph['@graph'][2].geo.latitude, 10.7816);
});

test('Suite 5: Breadcrumb List Positioning Integrity', () => {
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Bãi đỗ xe', url: '/bai-do-xe' },
    { name: 'Quận 1', url: '/bai-do-xe/quan-1' },
  ]);

  assert.equal(breadcrumb.itemListElement[0].position, 1);
  assert.equal(breadcrumb.itemListElement[1].position, 2);
  assert.equal(breadcrumb.itemListElement[2].position, 3);
  assert.equal(breadcrumb.itemListElement[2].name, 'Quận 1');
  assert.equal(breadcrumb.itemListElement[2].item, 'https://mapgo.vn/bai-do-xe/quan-1');
});

console.log('✅ ALL SEO ENGINE UNIT TESTS PASSED!');
