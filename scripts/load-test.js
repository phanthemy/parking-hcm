/**
 * MAPGO HIGH-CONCURRENCY LOAD TESTING SUITE
 * Emulates k6 / wrk benchmarking: measures P50, P95, P99 latency and throughput under concurrency
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.MAPGO_HOST || 'http://localhost:3003';
const agent = new http.Agent({ keepAlive: true, maxSockets: 500 });

function makeRequest(urlPath) {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const parsedUrl = new URL(urlPath, BASE_URL);

    const req = http.get(parsedUrl, { agent }, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;
        const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
        resolve({ statusCode: res.statusCode, durationMs, success: isSuccess });
      });
    });

    req.on('error', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1e6;
      resolve({ statusCode: 0, durationMs, success: false });
    });
  });
}

async function runConcurrencyBatch(concurrency, totalRequests, urlPath) {
  console.log(`\n⚡ Bắt đầu Load Test: Concurrency = ${concurrency}, Tổng Requests = ${totalRequests} (${urlPath})`);
  const latencies = [];
  let successCount = 0;
  let failCount = 0;

  const startTime = Date.now();
  let completed = 0;

  async function worker() {
    while (completed < totalRequests) {
      completed++;
      const res = await makeRequest(urlPath);
      latencies.push(res.durationMs);
      if (res.success) successCount++;
      else failCount++;
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const totalTimeSeconds = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
  const rps = Math.round(totalRequests / totalTimeSeconds);

  const result = {
    concurrency,
    totalRequests,
    targetUrl: urlPath,
    totalTimeSeconds: Math.round(totalTimeSeconds * 100) / 100,
    requestsPerSecond: rps,
    latencies: {
      minMs: Math.round((latencies[0] || 0) * 100) / 100,
      p50Ms: Math.round(p50 * 100) / 100,
      p95Ms: Math.round(p95 * 100) / 100,
      p99Ms: Math.round(p99 * 100) / 100,
      maxMs: Math.round((latencies[latencies.length - 1] || 0) * 100) / 100,
      avgMs: Math.round(avg * 100) / 100,
    },
    errorRate: `${Math.round((failCount / totalRequests) * 100 * 100) / 100}%`,
    successCount,
    failCount,
  };

  console.log(`📊 Kết quả: ${rps} Req/s | P50: ${result.latencies.p50Ms}ms | P95: ${result.latencies.p95Ms}ms | P99: ${result.latencies.p99Ms}ms | Error: ${result.errorRate}`);
  return result;
}

async function main() {
  console.log('🚀 KHỞI ĐỘNG LOAD TESTING SUITE CHO MAPGO PRODUCTION ENGINE...\n');

  const report = [];

  // Stage 1: 50 concurrent users trên District Hub Page
  report.push(await runConcurrencyBatch(50, 500, '/bai-do-xe/quan-1'));

  // Stage 2: 100 concurrent users trên Dynamic API Spots Search
  report.push(await runConcurrencyBatch(100, 1000, '/api/spots?limit=20'));

  // Stage 3: 200 concurrent users trên Nearby Quick Assist
  report.push(await runConcurrencyBatch(200, 1500, '/api/nearby/quick-assist?lat=10.7769&lng=106.7009&category=PARKING_LOT'));

  const outputDir = path.join(__dirname, '..', 'evidence', 'sprint-05');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const reportPath = path.join(outputDir, 'load-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✅ Báo cáo Load Test chi tiết đã lưu tại: ${reportPath}`);
}

main().catch(console.error);
