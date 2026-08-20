import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Quán Ăn Có Bãi Đỗ Xe Ô Tô TP.HCM 2026 – Danh Sách Đầy Đủ Theo Quận',
  description: 'Review các quán ăn, nhà hàng ngon tại TP.HCM có bãi đỗ xe ô tô rộng rãi, miễn phí.',
  keywords: 'quán ăn có bãi đỗ xe, nhà hàng có chỗ đậu xe',
  alternates: {
    canonical: `https://mapgo.vn/blog/quan-an-co-bai-do-xe`
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Quán Ăn Có Bãi Đỗ Xe Ô Tô TP.HCM 2026 – Danh Sách Đầy Đủ Theo Quận",
  "image": ["https://mapgo.vn/logo.png"],
  "datePublished": "2026-08-13T00:00:00+07:00",
  "dateModified": "2026-08-18T00:00:00+07:00",
  "author": {
    "@type": "Organization",
    "name": "MapGo.vn",
    "url": "https://mapgo.vn"
  },
  "publisher": {
    "@type": "Organization",
    "name": "MapGo.vn",
    "logo": {
      "@type": "ImageObject",
      "url": "https://mapgo.vn/logo.png"
    }
  },
  "description": "Danh sách quán ăn, nhà hàng có bãi đậu xe ô tô rộng rãi, bảo vệ trông coi tại các quận TP.HCM."
};

export default async function Page() {
  const spots = await prisma.parkingSpot.findMany({ 
    where: { 
      status: { in: ['active', 'ACTIVE'] }, 
      type: 'RESTAURANT', 
      carSlots: { gt: 0 } 
    } 
  });

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '20px', lineHeight: '1.4' }}>
        Quán Ăn Có Bãi Đỗ Xe Ô Tô TP.HCM 2026 – Danh Sách Đầy Đủ Theo Quận
      </h1>

      <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #2a2a2a' }}>
        <h2 style={{ fontSize: '18px', color: '#fff', marginTop: 0, marginBottom: '15px' }}>Mục lục</h2>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
          <li><a href="#gioi-thieu" style={{ color: '#4a9eff', textDecoration: 'none' }}>1. Vì sao nên chọn quán ăn có bãi đỗ xe</a></li>
          <li><a href="#danh-sach" style={{ color: '#4a9eff', textDecoration: 'none' }}>2. Danh sách nhà hàng có chỗ đậu xe</a></li>
          <li><a href="#kinh-nghiem" style={{ color: '#4a9eff', textDecoration: 'none' }}>3. Kinh nghiệm đặt bàn</a></li>
          <li><a href="#faq" style={{ color: '#4a9eff', textDecoration: 'none' }}>4. Câu hỏi thường gặp</a></li>
        </ul>
      </div>

      <section id="gioi-thieu" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>1. Vì sao nên chọn quán ăn có bãi đỗ xe</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>
          Với nhiều gia đình và dân văn phòng di chuyển bằng ô tô, việc chọn một <strong>quán ăn có bãi đỗ xe</strong> hoặc <strong>nhà hàng có chỗ đậu xe</strong> thuận tiện là yếu tố tiên quyết. Không còn nỗi lo bị phạt vì dừng đỗ sai quy định hay phải đi bộ một quãng đường xa để từ bãi xe đến nhà hàng, những địa điểm ẩm thực có tích hợp sẵn chỗ đậu xe luôn được ưu ái hàng đầu tại TP.HCM.
        </p>
      </section>

      <section id="danh-sach" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>2. Danh sách nhà hàng có chỗ đậu xe</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
          {spots.map((spot: any) => (
            <div key={spot.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', padding: '15px', borderRadius: '8px' }}>
              <h3 style={{ color: '#4a9eff', margin: '0 0 10px 0', fontSize: '18px' }}>
                <Link href={`/bai-xe/${spot.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{spot.name}</Link>
              </h3>
              <p style={{ margin: '5px 0' }}><strong>Địa chỉ:</strong> {spot.address}</p>
              <p style={{ margin: '5px 0' }}><strong>Chỗ đậu xe ô tô:</strong> ~{spot.carSlots} chỗ</p>
              <p style={{ margin: '5px 0' }}><strong>Giờ phục vụ:</strong> {spot.openTime} - {spot.closeTime}</p>
            </div>
          ))}
          {spots.length === 0 && <p style={{ color: '#aaa' }}>Đang cập nhật danh sách quán ăn có chỗ đỗ ô tô...</p>}
        </div>
      </section>

      <section id="kinh-nghiem" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>3. Kinh nghiệm đặt bàn</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>
          Dù quán có bãi đậu xe, nhưng vào những giờ cao điểm hoặc dịp lễ, lượng khách đổ về rất đông khiến chỗ đậu xe nhanh chóng hết. Lời khuyên cho bạn là hãy luôn gọi điện đặt bàn trước và thông báo rằng bạn sẽ đi bằng ô tô để nhân viên nhà hàng có thể sắp xếp hoặc giữ chỗ đậu xe cho bạn.
        </p>
      </section>

      <section id="faq" style={{ marginBottom: '30px', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '20px' }}>4. Câu hỏi thường gặp</h2>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Quán ăn có tính phí giữ xe ô tô không?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Đa số các nhà hàng lớn đều miễn phí gửi xe cho thực khách. Tuy nhiên, một số quán có bãi đậu xe thuê ngoài có thể thu phí từ 20.000 - 50.000 VNĐ.</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Nhà hàng có bảo vệ trông xe không?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Có. Tất cả các địa điểm được liệt kê trên hệ thống của chúng tôi đều có nhân viên bảo vệ trông coi xe, hỗ trợ điều phối và lùi/đỗ xe an toàn.</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Tôi có thể tìm quán nhậu có chỗ đậu xe ô tô không?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Chắc chắn rồi. Bạn có thể sử dụng bộ lọc danh mục trên MapGo để tìm các quán nhậu bình dân hoặc sân vườn có chỗ đậu xe rộng rãi.</p>
        </div>
      </section>
    </article>
  );
}
