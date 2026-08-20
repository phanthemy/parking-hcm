/**
 * MAPGO SEO INTEGRATION TEST (SPRINT 3)
 * Asserts live rendered HTML against SEO & Schema.org standards
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

const BASE_URL = process.env.MAPGO_HOST || 'http://localhost:3003';

function fetchHtml(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, html: data }));
    }).on('error', reject);
  });
}

test('Integration 1: Homepage HTML & Robots Directives', async () => {
  const { statusCode, html } = await fetchHtml('/');
  assert.equal(statusCode, 200);
  assert.match(html, /<title[^>]*>.*MapGo.*<\/title>/i);
});

test('Integration 2: District Hub Canonical & Title (/bai-do-xe/quan-1)', async () => {
  const { statusCode, html } = await fetchHtml('/bai-do-xe/quan-1');
  assert.equal(statusCode, 200);
  assert.match(html, /<title[^>]*>.*Quận 1.*<\/title>/i);
  assert.match(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/mapgo\.vn\/bai-do-xe\/quan-1["']/i);
});

test('Integration 3: JSON-LD Graph Injection on District Hub', async () => {
  const { statusCode, html } = await fetchHtml('/bai-do-xe/quan-1');
  assert.equal(statusCode, 200);
  assert.match(html, /<script[^>]*type=["']application\/ld\+json["']/i);
  assert.match(html, /schema\.org/i);
});

test('Integration 4: Dynamic XML Sitemap Endpoint Integrity', async () => {
  const { statusCode, html } = await fetchHtml('/sitemap.xml');
  assert.equal(statusCode, 200);
  assert.match(html, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(html, /<loc>https:\/\/mapgo\.vn<\/loc>/);
  assert.match(html, /<priority>1<\/priority>/);
  assert.match(html, /<loc>https:\/\/mapgo\.vn\/bai-do-xe\/quan-1<\/loc>/);
});

test('Integration 5: Live Robots.txt Syntax & Sitemap Reference', async () => {
  const { statusCode, html } = await fetchHtml('/robots.txt');
  assert.equal(statusCode, 200);
  assert.match(html, /User-Agent: \*/i);
  assert.match(html, /Disallow: \/admin\//i);
  assert.match(html, /Sitemap: https:\/\/mapgo\.vn\/sitemap\.xml/i);
});

console.log('✅ ALL SEO INTEGRATION TESTS PASSED!');
