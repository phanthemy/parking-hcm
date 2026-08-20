const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = process.env.JWT_SECRET || 'parking-hcm-secret-prod-2026';
const token = jwt.sign({ id: 1, email: 'admin@mapgo.vn', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });

// Test 1: Stats
http.get({
  hostname: '127.0.0.1',
  port: 3003,
  path: '/api/admin/stats',
  headers: { 'Authorization': 'Bearer ' + token }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('✅ STATS RESPONSE:', JSON.parse(body));
  });
});

// Test 2: Spots list
http.get({
  hostname: '127.0.0.1',
  port: 3003,
  path: '/api/admin/spots?limit=5',
  headers: { 'Authorization': 'Bearer ' + token }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const data = JSON.parse(body);
    console.log('✅ SPOTS LIST RESPONSE: Total:', data.total, 'Count:', (data.spots || []).length);
    if (data.spots && data.spots.length > 0) {
      console.log('Sample Spot:', data.spots[0].name, data.spots[0].category, data.spots[0].address);
    }
  });
});
