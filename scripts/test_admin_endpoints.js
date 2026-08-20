/**
 * Automated Verification Script for Admin Data Operations Endpoints
 */

async function runTests() {
  const BASE_URL = 'http://localhost:3003';
  console.log('🧪 [TEST] Starting Admin Data Operations API tests...\n');

  // Test 1: GET /api/admin/stats
  try {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    const data = await res.json();
    console.log('✅ 1. GET /api/admin/stats:');
    console.log(`   - Status: ${res.status}`);
    console.log(`   - Total spots: ${data.totalSpots}`);
    console.log(`   - Active spots: ${data.activeSpots}`);
    console.log(`   - Data Health Score: ${data.dataHealthScore}/100`);
    console.log(`   - Missing phone: ${data.quality?.missingPhone}`);
    console.log(`   - Raw address: ${data.quality?.rawAddress}`);
    console.log(`   - Verified: ${data.quality?.verified}`);
  } catch (err) {
    console.error('❌ 1. GET /api/admin/stats FAILED:', err.message);
  }

  // Test 2: GET /api/admin/spots (with filters)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/spots?limit=5&category=PARKING`);
    const data = await res.json();
    console.log('\n✅ 2. GET /api/admin/spots (category=PARKING, limit=5):');
    console.log(`   - Status: ${res.status}`);
    console.log(`   - Total spots in category: ${data.total}`);
    console.log(`   - Returned count: ${data.spots?.length}`);
    if (data.spots?.[0]) {
      console.log(`   - Sample spot: [ID ${data.spots[0].id}] ${data.spots[0].name} | ${data.spots[0].category}`);
    }
  } catch (err) {
    console.error('❌ 2. GET /api/admin/spots FAILED:', err.message);
  }

  // Test 3: GET /api/admin/spots with Quality Filter (missing_phone)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/spots?limit=3&quality_issue=missing_phone`);
    const data = await res.json();
    console.log('\n✅ 3. GET /api/admin/spots (quality_issue=missing_phone):');
    console.log(`   - Total missing phone: ${data.total}`);
    console.log(`   - Sample missing phone: [ID ${data.spots?.[0]?.id}] ${data.spots?.[0]?.name} (Phone: "${data.spots?.[0]?.phone}")`);
  } catch (err) {
    console.error('❌ 3. GET /api/admin/spots quality issue FAILED:', err.message);
  }

  // Test 4: POST /api/admin/reports (Create user report)
  let createdReportId = null;
  try {
    const payload = {
      spotId: 2789,
      spotName: 'Phong Trường Vinh',
      reportType: 'WRONG_PHONE',
      description: 'Số điện thoại hiển thị trên bản đồ không gọi được, cần cập nhật số mới',
      reporterContact: '0908889999'
    };
    const res = await fetch(`${BASE_URL}/api/admin/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('\n✅ 4. POST /api/admin/reports (Create report):');
    console.log(`   - Status: ${res.status}`);
    console.log(`   - Created report ID: ${data.report?.id}`);
    console.log(`   - Type: ${data.report?.report_type} | Spot: ${data.report?.spot_name}`);
    createdReportId = data.report?.id;
  } catch (err) {
    console.error('❌ 4. POST /api/admin/reports FAILED:', err.message);
  }

  // Test 5: PATCH /api/admin/reports (Update report status)
  if (createdReportId) {
    try {
      const payload = {
        id: createdReportId,
        status: 'RESOLVED',
        adminNote: 'Đã kiểm tra thực địa và bổ sung SĐT mới'
      };
      const res = await fetch(`${BASE_URL}/api/admin/reports`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('\n✅ 5. PATCH /api/admin/reports (Resolve report):');
      console.log(`   - Status: ${res.status}`);
      console.log(`   - New status: ${data.report?.status}`);
      console.log(`   - Admin note: ${data.report?.admin_note}`);
    } catch (err) {
      console.error('❌ 5. PATCH /api/admin/reports FAILED:', err.message);
    }
  }

  // Test 6: PATCH /api/admin/spots/:id (Toggle verified and update phone)
  try {
    const spotId = 2789;
    const res = await fetch(`${BASE_URL}/api/admin/spots/${spotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: true, phone: '0908123456' })
    });
    const data = await res.json();
    console.log('\n✅ 6. PATCH /api/admin/spots/2789 (Toggle verified & phone):');
    console.log(`   - Status: ${res.status}`);
    console.log(`   - Spot verified: ${data.spot?.verified}`);
    console.log(`   - Spot phone: ${data.spot?.phone}`);
  } catch (err) {
    console.error('❌ 6. PATCH /api/admin/spots FAILED:', err.message);
  }

  console.log('\n🎉 [TEST COMPLETED] All 6 test suites executed.\n');
}

runTests();
