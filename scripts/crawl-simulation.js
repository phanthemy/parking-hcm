/**
 * MAPGO MINI SCREAMING FROG & CRAWL SIMULATION ENGINE
 * Crawls and validates status codes, metadata, canonicals, JSON-LD schemas, and internal links
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.MAPGO_HOST || 'http://localhost:3003';

function fetchPage(urlPath) {
  return new Promise((resolve) => {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
    const startTime = Date.now();

    http.get(fullUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url: fullUrl,
          path: urlPath,
          statusCode: res.statusCode,
          durationMs: Date.now() - startTime,
          body: data,
          headers: res.headers,
        });
      });
    }).on('error', (err) => {
      resolve({
        url: fullUrl,
        path: urlPath,
        statusCode: 0,
        error: err.message,
        durationMs: Date.now() - startTime,
        body: '',
      });
    });
  });
}

function extractMetadata(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)
    || html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
  const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

  const jsonLds = [];
  for (const scriptTag of jsonLdMatches) {
    const jsonText = scriptTag.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
    try {
      jsonLds.push(JSON.parse(jsonText));
    } catch (e) {
      jsonLds.push({ parseError: true, raw: jsonText });
    }
  }

  // Extract internal links
  const hrefMatches = html.match(/href=["'](\/[^"']*)["']/g) || [];
  const internalLinks = hrefMatches
    .map(h => h.replace(/^href=["']/, '').replace(/["']$/, ''))
    .filter(h => !h.startsWith('/_next') && !h.startsWith('/api') && !h.startsWith('/favicon'));

  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : null,
    canonical: canonicalMatch ? canonicalMatch[1].trim() : null,
    jsonLds: jsonLds,
    internalLinksCount: internalLinks.length,
    sampleLinks: [...new Set(internalLinks)].slice(0, 5),
  };
}

async function runCrawlSimulation() {
  console.log(`🚀 Bắt đầu Crawl Simulation trên ${BASE_URL}...`);

  const urlsToTest = [
    { type: 'ROBOTS', path: '/robots.txt' },
    { type: 'SITEMAP', path: '/sitemap.xml' },
    { type: 'HOMEPAGE', path: '/' },
    { type: 'CATEGORY_HUB', path: '/bai-do-xe-tphcm' },
    { type: 'CATEGORY_HUB', path: '/nha-ve-sinh/gan-day' },
    { type: 'DISTRICT_HUB', path: '/bai-do-xe/quan-1' },
    { type: 'DISTRICT_HUB', path: '/bai-do-xe/quan-7' },
    { type: 'DISTRICT_HUB', path: '/bai-do-xe/binh-thanh' },
    { type: 'BLOG_GUIDE', path: '/blog/gia-gui-xe-o-to-tphcm' },
    { type: 'BLOG_GUIDE', path: '/blog/bai-giu-xe-o-to-qua-dem' },
  ];

  const results = [];
  let passedCount = 0;

  for (const item of urlsToTest) {
    const page = await fetchPage(item.path);
    const meta = item.type === 'ROBOTS' || item.type === 'SITEMAP'
      ? { isRaw: true }
      : extractMetadata(page.body);

    const isOk = page.statusCode === 200;
    if (isOk) passedCount++;

    const result = {
      path: item.path,
      type: item.type,
      statusCode: page.statusCode,
      durationMs: page.durationMs,
      title: meta.title,
      descriptionLength: meta.description ? meta.description.length : 0,
      canonical: meta.canonical,
      jsonLdCount: meta.jsonLds ? meta.jsonLds.length : 0,
      hasValidJsonLd: meta.jsonLds ? meta.jsonLds.some(j => j['@context'] || j['@graph']) : false,
      internalLinksCount: meta.internalLinksCount || 0,
      status: isOk ? 'PASS' : 'FAIL',
    };

    results.push(result);
    console.log(`[${result.status}] ${item.path} (HTTP ${result.statusCode}, ${result.durationMs}ms) - Title: "${result.title || 'N/A'}"`);
  }

  const summary = {
    crawlDate: new Date().toISOString(),
    targetHost: BASE_URL,
    totalPagesCrawled: urlsToTest.length,
    pagesPassed: passedCount,
    successRate: `${Math.round((passedCount / urlsToTest.length) * 100)}%`,
    results: results,
  };

  const outputDir = path.join(__dirname, '..', 'evidence', 'sprint-03');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const reportPath = path.join(outputDir, 'crawl-simulation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`\n✅ Báo cáo Crawl Simulation đã được lưu tại: ${reportPath}`);
  console.log(`📊 Tỷ lệ thành công: ${summary.successRate} (${passedCount}/${urlsToTest.length} URLs)`);

  return summary;
}

runCrawlSimulation().catch(console.error);
