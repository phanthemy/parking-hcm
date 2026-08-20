const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const artifactsDir = path.join(__dirname, '../public/test-artifacts');
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  // 1. Desktop
  const deskContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const deskPage = await deskContext.newPage();
  await deskPage.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(3000);
  await deskPage.screenshot({ path: path.join(artifactsDir, 'homepage-clean-desktop.png') });

  // 2. Mobile (375x812)
  const mobContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobPage = await mobContext.newPage();
  await mobPage.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
  await mobPage.waitForTimeout(3000);
  await mobPage.screenshot({ path: path.join(artifactsDir, 'homepage-clean-mobile.png') });

  // 3. Mobile with selected spot / route
  const chipBtn = await mobPage.$('button[title*="Bãi xe"], button:has-text("🅿️")');
  if (chipBtn) {
    await chipBtn.click();
    await mobPage.waitForTimeout(2000);
    await mobPage.screenshot({ path: path.join(artifactsDir, 'homepage-clean-mobile-route.png') });
  }

  console.log('✅ Clean UI screenshots captured successfully!');
  await browser.close();
}

capture();
