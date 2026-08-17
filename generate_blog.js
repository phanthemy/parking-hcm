const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app', 'blog');

function ensureDir(targetPath) {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
}

ensureDir(dir);

const layoutContent = `import Link from 'next/link';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#0f0f0f', color: '#e0e0e0', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <nav style={{ marginBottom: '20px', fontSize: '14px' }}>
          <Link href="/" style={{ color: '#4a9eff', textDecoration: 'none' }}>Trang chủ</Link>
          <span style={{ margin: '0 10px', color: '#666' }}>/</span>
          <Link href="/blog" style={{ color: '#4a9eff', textDecoration: 'none' }}>Blog</Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(dir, 'layout.tsx'), layoutContent);

const indexContent = `import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog Bãi Đỗ Xe & Tiện Ích TP.HCM | MapGo.vn',
  description: 'Tin tức, hướng dẫn, và danh sách bãi đỗ xe ô tô, nhà vệ sinh công cộng, bãi gửi xe qua đêm tại TP.HCM 2026.',
};

const articles = [
  {
    title: 'Top 50+ Bãi Đỗ Xe Ô Tô TP.HCM 2026 – Địa Chỉ, Giá, Bản Đồ GPS',
    desc: 'Danh sách các bãi đỗ xe ô tô hàng đầu tại các quận TP.HCM, cập nhật giá và địa chỉ chi tiết.',
    slug: 'bai-do-xe-tphcm',
    date: '2026-08-17',
  },
  {
    title: 'Bãi Giữ Xe Ô Tô Qua Đêm TP.HCM 2026 – An Toàn, Uy Tín, Giá Rẻ',
    desc: 'Tìm bãi giữ xe ô tô qua đêm 24/24 an toàn, uy tín với chi phí hợp lý tại TP.HCM.',
    slug: 'bai-giu-xe-o-to-qua-dem',
    date: '2026-08-16',
  },
  {
    title: 'Bảng Giá Gửi Xe Ô Tô TP.HCM 2026 – Cập Nhật Mới Nhất Theo Quận',
    desc: 'Bảng giá dịch vụ gửi xe ô tô theo giờ, qua đêm, theo tháng cập nhật năm 2026.',
    slug: 'gia-gui-xe-o-to-tphcm',
    date: '2026-08-15',
  },
  {
    title: 'Nhà Vệ Sinh Công Cộng TP.HCM 2026 – Bản Đồ WC Gần Đây Nhất',
    desc: 'Danh sách và bản đồ vị trí nhà vệ sinh công cộng sạch sẽ, tiện lợi khắp TP.HCM.',
    slug: 'nha-ve-sinh-cong-cong-tphcm',
    date: '2026-08-14',
  },
  {
    title: 'Quán Ăn Có Bãi Đỗ Xe Ô Tô TP.HCM 2026 – Danh Sách Đầy Đủ Theo Quận',
    desc: 'Review các quán ăn, nhà hàng ngon tại TP.HCM có bãi đỗ xe ô tô rộng rãi, miễn phí.',
    slug: 'quan-an-co-bai-do-xe',
    date: '2026-08-13',
  },
];

export default function BlogIndex() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '30px', color: 'white' }}>Blog Bãi Đỗ Xe & Tiện Ích TP.HCM</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {articles.map((a) => (
          <Link href={\`/blog/\${a.slug}\`} key={a.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #2a2a2a', 
              padding: '20px', 
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}>
              <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '10px' }}>{a.title}</h2>
              <p style={{ color: '#aaa', marginBottom: '10px', fontSize: '15px' }}>{a.desc}</p>
              <div style={{ color: '#666', fontSize: '13px' }}>Đăng ngày: {a.date}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(dir, 'page.tsx'), indexContent);

function generateParagraphs(topic, count) {
  let text = '';
  for(let i = 0; i < count; i++) {
    text += \`<p style={{ marginBottom: '15px', lineHeight: '1.7' }}>\` + 
      \`Trong bối cảnh đô thị hóa ngày càng nhanh tại TP.HCM năm 2026, việc tìm kiếm một \${topic} uy tín, an toàn và có giá cả hợp lý là một trong những mối quan tâm hàng đầu của người dân cũng như du khách. Khi số lượng phương tiện cá nhân, đặc biệt là ô tô tăng vọt, hạ tầng giao thông và các dịch vụ tiện ích đi kèm đôi khi chưa đáp ứng kịp thời, dẫn đến tình trạng ùn tắc hoặc khó khăn trong việc tìm chỗ dừng đỗ. Do đó, việc nắm rõ thông tin về các địa điểm này không chỉ giúp bạn tiết kiệm thời gian, công sức mà còn đảm bảo an toàn cho tài sản cá nhân. Những kinh nghiệm thực tế từ cộng đồng tài xế chia sẻ luôn là nguồn thông tin quý giá. Ngoài ra, các yếu tố như vị trí thuận tiện, hệ thống camera giám sát an ninh 24/7, hệ thống phòng cháy chữa cháy đạt chuẩn, nhân viên bảo vệ chuyên nghiệp nhiệt tình, và đặc biệt là mức giá niêm yết rõ ràng minh bạch cũng là những tiêu chí quan trọng cần xem xét. Việc chuẩn bị sẵn thông tin sẽ giúp chuyến đi của bạn thêm phần trọn vẹn và an tâm hơn rất nhiều. Hơn nữa, việc sử dụng các ứng dụng bản đồ, dịch vụ định vị GPS kết hợp với những bài viết đánh giá chi tiết như thế này đang trở thành xu hướng tất yếu của những người lái xe thông minh trong thời đại công nghệ số. \` + 
    \`</p>\n\`;
  }
  return text;
}

const articles = [
  {
    slug: 'bai-do-xe-tphcm',
    title: 'Top 50+ Bãi Đỗ Xe Ô Tô TP.HCM 2026 – Địa Chỉ, Giá, Bản Đồ GPS',
    kw: 'bãi đỗ xe, bãi đỗ xe TP.HCM, bãi đỗ xe ô tô',
    query: "prisma.parkingSpot.findMany({ where: { status: { in: ['active', 'ACTIVE'] }, type: 'PARKING_LOT' } })",
    process: `
      const grouped = spots.reduce((acc, spot) => {
        const districtMatch = spot.address?.match(/Quận [\\w\\d]+|Q\\.[\\w\\d]+|Bình Thạnh|Thủ Đức|Gò Vấp|Tân Bình|Tân Phú|Phú Nhuận|Bình Tân/i);
        const district = districtMatch ? districtMatch[0] : 'Khác';
        if (!acc[district]) acc[district] = [];
        acc[district].push(spot);
        return acc;
      }, {});
    `,
    renderList: `
      {Object.entries(grouped).map(([district, districtSpots]: [string, any]) => (
        <div key={district} style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '15px' }} id={\`quan-\${district.replace(/\\s/g, '-')}\`}>Bãi đỗ xe tại {district}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {districtSpots.map((spot: any) => (
              <div key={spot.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: '#4a9eff', margin: '0 0 10px 0' }}>
                  <Link href={\`/bai-xe/\${spot.slug}\`} style={{ textDecoration: 'none', color: 'inherit' }}>{spot.name}</Link>
                </h4>
                <p style={{ margin: '5px 0' }}><strong>Địa chỉ:</strong> {spot.address}</p>
                <p style={{ margin: '5px 0' }}><strong>Giá:</strong> {spot.pricePerHour?.toLocaleString('vi-VN')} VND/giờ</p>
                <p style={{ margin: '5px 0' }}><strong>Giờ hoạt động:</strong> {spot.openTime} - {spot.closeTime}</p>
                <p style={{ margin: '5px 0' }}><strong>Sức chứa:</strong> Ô tô: {spot.carSlots || 0} | Xe máy: {spot.bikeSlots || 0}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    `,
    topic: 'bãi đỗ xe ô tô'
  },
  {
    slug: 'bai-giu-xe-o-to-qua-dem',
    title: 'Bãi Giữ Xe Ô Tô Qua Đêm TP.HCM 2026 – An Toàn, Uy Tín, Giá Rẻ',
    kw: 'bãi giữ xe ô tô qua đêm, gửi xe ô tô qua đêm TPHCM',
    query: "prisma.parkingSpot.findMany({ where: { status: { in: ['active', 'ACTIVE'] }, closeTime: { in: ['23:30', '23:59', '24:00', '00:00'] } } })",
    process: ``,
    renderList: `
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
        {spots.map((spot: any) => (
          <div key={spot.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ color: '#4a9eff', margin: '0 0 10px 0', fontSize: '18px' }}>
              <Link href={\`/bai-xe/\${spot.slug}\`} style={{ textDecoration: 'none', color: 'inherit' }}>{spot.name}</Link>
            </h3>
            <p style={{ margin: '5px 0' }}><strong>Địa chỉ:</strong> {spot.address}</p>
            <p style={{ margin: '5px 0' }}><strong>Giá tham khảo:</strong> {spot.pricePerHour?.toLocaleString('vi-VN')} VND/giờ</p>
            <p style={{ margin: '5px 0' }}><strong>Giờ mở cửa:</strong> 24/24 hoặc đến khuya ({spot.openTime} - {spot.closeTime})</p>
          </div>
        ))}
      </div>
    `,
    topic: 'bãi giữ xe qua đêm'
  },
  {
    slug: 'gia-gui-xe-o-to-tphcm',
    title: 'Bảng Giá Gửi Xe Ô Tô TP.HCM 2026 – Cập Nhật Mới Nhất Theo Quận',
    kw: 'giá gửi xe ô tô, bảng giá bãi đỗ xe TPHCM',
    query: "prisma.parkingSpot.findMany({ where: { status: { in: ['active', 'ACTIVE'] } }, orderBy: { pricePerHour: 'asc' } })",
    process: `
      const validSpots = spots.filter(s => s.pricePerHour > 0);
    `,
    renderList: `
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', backgroundColor: '#1a1a1a' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #2a2a2a', padding: '10px', textAlign: 'left', color: '#fff' }}>Tên bãi / Địa điểm</th>
            <th style={{ border: '1px solid #2a2a2a', padding: '10px', textAlign: 'left', color: '#fff' }}>Địa chỉ</th>
            <th style={{ border: '1px solid #2a2a2a', padding: '10px', textAlign: 'right', color: '#fff' }}>Mức giá (VNĐ/giờ)</th>
          </tr>
        </thead>
        <tbody>
          {validSpots.map((spot: any) => (
            <tr key={spot.id}>
              <td style={{ border: '1px solid #2a2a2a', padding: '10px' }}>
                <Link href={\`/bai-xe/\${spot.slug}\`} style={{ color: '#4a9eff', textDecoration: 'none' }}>{spot.name}</Link>
              </td>
              <td style={{ border: '1px solid #2a2a2a', padding: '10px' }}>{spot.address}</td>
              <td style={{ border: '1px solid #2a2a2a', padding: '10px', textAlign: 'right' }}>{spot.pricePerHour.toLocaleString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    `,
    topic: 'giá gửi xe'
  },
  {
    slug: 'nha-ve-sinh-cong-cong-tphcm',
    title: 'Nhà Vệ Sinh Công Cộng TP.HCM 2026 – Bản Đồ WC Gần Đây Nhất',
    kw: 'nhà vệ sinh công cộng, WC công cộng TPHCM, nhà vệ sinh gần đây',
    query: "prisma.parkingSpot.findMany({ where: { status: { in: ['active', 'ACTIVE'] }, type: 'RESTROOM' } })",
    process: ``,
    renderList: `
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        {spots.map((spot: any) => (
          <div key={spot.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ color: '#4a9eff', margin: '0 0 10px 0', fontSize: '18px' }}>
              <Link href={\`/bai-xe/\${spot.slug}\`} style={{ textDecoration: 'none', color: 'inherit' }}>{spot.name}</Link>
            </h3>
            <p style={{ margin: '5px 0' }}><strong>Địa chỉ:</strong> {spot.address}</p>
            <p style={{ margin: '5px 0' }}><strong>Giờ mở cửa:</strong> {spot.openTime} - {spot.closeTime}</p>
          </div>
        ))}
      </div>
    `,
    topic: 'nhà vệ sinh công cộng'
  },
  {
    slug: 'quan-an-co-bai-do-xe',
    title: 'Quán Ăn Có Bãi Đỗ Xe Ô Tô TP.HCM 2026 – Danh Sách Đầy Đủ Theo Quận',
    kw: 'quán ăn có bãi đỗ xe, nhà hàng có chỗ đậu xe',
    query: "prisma.parkingSpot.findMany({ where: { status: { in: ['active', 'ACTIVE'] }, type: 'RESTAURANT', carSlots: { gt: 0 } } })",
    process: ``,
    renderList: `
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
        {spots.map((spot: any) => (
          <div key={spot.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ color: '#4a9eff', margin: '0 0 10px 0', fontSize: '18px' }}>
              <Link href={\`/bai-xe/\${spot.slug}\`} style={{ textDecoration: 'none', color: 'inherit' }}>{spot.name}</Link>
            </h3>
            <p style={{ margin: '5px 0' }}><strong>Địa chỉ:</strong> {spot.address}</p>
            <p style={{ margin: '5px 0' }}><strong>Chỗ đậu xe ô tô:</strong> ~{spot.carSlots} chỗ</p>
            <p style={{ margin: '5px 0' }}><strong>Giờ phục vụ:</strong> {spot.openTime} - {spot.closeTime}</p>
          </div>
        ))}
      </div>
    `,
    topic: 'quán ăn có bãi đỗ xe'
  }
];

articles.forEach(art => {
  ensureDir(path.join(dir, art.slug));
  
  const content = `import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: '${art.title}',
  description: 'Khám phá thông tin chi tiết về ${art.topic} tại TP.HCM. Cập nhật mới nhất năm 2026.',
  keywords: '${art.kw}',
  alternates: {
    canonical: \`https://mapgo.vn/blog/${art.slug}\`
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${art.title}",
  "datePublished": "2026-08-17T00:00:00+07:00",
  "author": {
    "@type": "Organization",
    "name": "MapGo.vn"
  }
};

export default async function Page() {
  const spots = await ${art.query};
  ${art.process}

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '20px', lineHeight: '1.4' }}>
        ${art.title}
      </h1>

      <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #2a2a2a' }}>
        <h2 style={{ fontSize: '18px', color: '#fff', marginTop: 0, marginBottom: '15px' }}>Mục lục</h2>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
          <li><a href="#gioi-thieu" style={{ color: '#4a9eff', textDecoration: 'none' }}>1. Giới thiệu tổng quan</a></li>
          <li><a href="#danh-sach" style={{ color: '#4a9eff', textDecoration: 'none' }}>2. Danh sách chi tiết</a></li>
          <li><a href="#kinh-nghiem" style={{ color: '#4a9eff', textDecoration: 'none' }}>3. Kinh nghiệm hữu ích</a></li>
          <li><a href="#faq" style={{ color: '#4a9eff', textDecoration: 'none' }}>4. Câu hỏi thường gặp (FAQ)</a></li>
        </ul>
      </div>

      <section id="gioi-thieu" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>1. Giới thiệu tổng quan</h2>
        ${generateParagraphs(art.topic, 5)}
      </section>

      <section id="danh-sach" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>2. Danh sách chi tiết</h2>
        <p style={{ marginBottom: '20px', lineHeight: '1.7' }}>
          Dưới đây là dữ liệu được tổng hợp trực tiếp từ hệ thống MapGo.vn, cập nhật liên tục để mang đến thông tin chính xác nhất.
        </p>
        ${art.renderList}
      </section>

      <section id="kinh-nghiem" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>3. Kinh nghiệm hữu ích</h2>
        ${generateParagraphs(art.topic, 4)}
      </section>

      <section id="faq" style={{ marginBottom: '30px', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '20px' }}>4. Câu hỏi thường gặp (FAQ)</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Làm sao để tìm được địa điểm phù hợp nhất?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Bạn có thể sử dụng công cụ tìm kiếm trên MapGo.vn, lọc theo quận huyện hoặc bán kính xung quanh vị trí hiện tại của bạn. Chúng tôi cung cấp hình ảnh thực tế và đánh giá từ người dùng để bạn dễ dàng lựa chọn.</p>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Thông tin trên hệ thống có được cập nhật thường xuyên không?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Có. Đội ngũ của MapGo và cộng đồng người dùng luôn liên tục cập nhật trạng thái đóng/mở cửa, giá vé, cũng như thêm mới các địa điểm để dữ liệu luôn chính xác với thực tế tại thời điểm 2026.</p>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Tôi có thể báo cáo thông tin sai lệch không?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Hoàn toàn có thể. Mỗi địa điểm trên bản đồ đều có tính năng báo lỗi/cập nhật thông tin. Sự đóng góp của bạn giúp cộng đồng có được dữ liệu chất lượng hơn.</p>
        </div>
      </section>
      
      <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #2a2a2a', textAlign: 'center' }}>
        <p style={{ color: '#aaa' }}>© 2026 MapGo.vn - Nền tảng bản đồ tiện ích thông minh hàng đầu Việt Nam.</p>
      </div>
    </article>
  );
}
`;
  
  fs.writeFileSync(path.join(dir, art.slug, 'page.tsx'), content);
});

console.log('Blog pages generated successfully.');
