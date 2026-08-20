async function check() {
  const urls = [
    'https://mapgo.vn/',
    'https://mapgo.vn/blog/bai-do-xe-tphcm',
    'https://mapgo.vn/bai-xe/bai-xe-coopmart-binh-chanh-hcm',
    'https://mapgo.vn/bai-do-xe/binh-chanh'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const hasLdJson = text.includes('application/ld+json');
      const hasLocalBusiness = text.includes('LocalBusiness');
      const hasArticle = text.includes('Article');
      const hasParking = text.includes('ParkingFacility');
      const hasItemList = text.includes('ItemList');
      const hasFAQ = text.includes('FAQPage');

      console.log(`\nURL: ${url}`);
      console.log(`- Status: ${res.status}`);
      console.log(`- application/ld+json: ${hasLdJson}`);
      console.log(`- Types detected in raw HTML:`, {
        LocalBusiness: hasLocalBusiness,
        Article: hasArticle,
        ParkingFacility: hasParking,
        ItemList: hasItemList,
        FAQPage: hasFAQ
      });
    } catch (e) {
      console.error(`Error fetching ${url}:`, e.message);
    }
  }
}

check();
