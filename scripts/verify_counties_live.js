async function checkLive() {
  const counties = ['binh-chanh', 'hoc-mon', 'cu-chi', 'nha-be', 'can-gio'];

  for (const c of counties) {
    const url = `https://mapgo.vn/bai-do-xe/${c}`;
    const res = await fetch(url);
    const html = await res.text();
    const isUpdating = html.includes('Đang cập nhật thêm bãi giữ xe');
    const spotMatches = html.match(/🅿️ [^<]+/g) || [];

    console.log(`\nURL: ${url}`);
    console.log(`- Status: ${res.status}`);
    console.log(`- Is Updating Placeholder: ${isUpdating}`);
    console.log(`- Spot count on page: ${spotMatches.length}`);
    spotMatches.forEach(s => console.log(`  * ${s}`));
  }
}

checkLive();
