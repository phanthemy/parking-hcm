const { chromium } = require('playwright');

(async () => {
  console.log('🎬 Đang khởi tạo trình duyệt...');
  
  const browser = await chromium.launch({ headless: true });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    recordVideo: {
      dir: 'C:/Users/editor02/Desktop/',
      size: { width: 390, height: 844 }
    },
    geolocation: { latitude: 10.7769, longitude: 106.7009 },
    permissions: ['geolocation'],
  });

  const page = await context.newPage();
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  try {
    // === CẢNH 1: Mở app ===
    console.log('📍 Cảnh 1: Mở trang chủ...');
    await page.goto('https://baidoxe.nextapp.vn', { waitUntil: 'networkidle', timeout: 30000 });
    await wait(3000);

    // === CẢNH 2: Bấm filter chips ===
    console.log('🏷️ Cảnh 2: Bấm filter chips...');
    const chips = page.locator('.floating-chip');
    const chipCount = await chips.count();
    if (chipCount > 1) {
      await chips.nth(1).click();
      await wait(1500);
      await chips.nth(2).click();
      await wait(1500);
      await chips.nth(0).click();
      await wait(1000);
    }

    // === CẢNH 3: Tìm kiếm ===
    console.log('🔍 Cảnh 3: Tìm kiếm...');
    const searchField = page.locator('.search-field');
    await searchField.click();
    await wait(300);
    await searchField.fill('');
    await page.keyboard.type('Binh Tan', { delay: 120 });
    await wait(500);
    await page.locator('.filter-btn').click();
    await wait(2500);

    // === CẢNH 4: Vuốt bottom sheet ===
    console.log('📋 Cảnh 4: Vuốt xem kết quả...');
    await page.mouse.move(195, 780);
    await page.mouse.down();
    for (let y = 780; y > 350; y -= 20) {
      await page.mouse.move(195, y, { steps: 2 });
      await wait(15);
    }
    await page.mouse.up();
    await wait(2000);

    // Cuộn xem kết quả
    await page.mouse.move(195, 600);
    await page.mouse.wheel(0, 200);
    await wait(1500);
    await page.mouse.wheel(0, -200);
    await wait(1000);

    // === CẢNH 5: Bấm FAB đăng tin ===
    console.log('➕ Cảnh 5: Mở form đăng tin...');
    // Vuốt bottom sheet xuống trước
    await page.mouse.move(195, 350);
    await page.mouse.down();
    for (let y = 350; y < 750; y += 20) {
      await page.mouse.move(195, y, { steps: 2 });
      await wait(15);
    }
    await page.mouse.up();
    await wait(1000);
    
    const fabBtn = page.locator('.fab-post');
    if (await fabBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await fabBtn.click();
      await wait(2000);
      // Cuộn form
      await page.mouse.wheel(0, 400);
      await wait(1500);
      await page.mouse.wheel(0, 400);
      await wait(1500);
    }

    // === CẢNH 6: Quay lại bản đồ ===
    console.log('🏠 Cảnh 6: Quay lại bản đồ...');
    await page.goBack();
    await wait(2500);

    // Xóa search, zoom out
    const sf2 = page.locator('.search-field');
    if (await sf2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sf2.fill('');
      await page.locator('.filter-btn').click();
      await wait(2000);
    }

    // Zoom out
    const zoomOut = page.locator('.leaflet-control-zoom-out');
    for (let i = 0; i < 3; i++) {
      if (await zoomOut.isVisible({ timeout: 1000 }).catch(() => false)) {
        await zoomOut.click();
        await wait(600);
      }
    }
    await wait(2000);

    console.log('✅ Quay xong!');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  }

  await context.close();
  await browser.close();
  console.log('🎬 Video đã lưu tại Desktop!');
})();
