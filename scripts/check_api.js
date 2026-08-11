const http = require('http');

http.get('http://localhost:3000/api/spots?limit=1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const j = JSON.parse(data);
    console.log('API pagination:', JSON.stringify(j.pagination));
    console.log('First spot status:', j.spots[0]?.status);
  });
});
