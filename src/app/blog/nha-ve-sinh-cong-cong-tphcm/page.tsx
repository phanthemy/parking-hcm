import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Nhà Vệ Sinh Công Cộng TP.HCM 2026 – Bản Đồ WC Gần Đây Nhất',
  description: 'Danh sách và bản đồ vị trí nhà vệ sinh công cộng sạch sẽ, tiện lợi khắp TP.HCM.',
  keywords: 'nhà vệ sinh công cộng, WC công cộng TPHCM, nhà vệ sinh gần đây',
  alternates: {
    canonical: `https://mapgo.vn/blog/nha-ve-sinh-cong-cong-tphcm`
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Bản Đồ Nhà Vệ Sinh Công Cộng TP.HCM – Sạch Sẽ, Miễn Phí Gần Nhất",
  "image": ["https://mapgo.vn/logo.png"],
  "datePublished": "2026-08-14T00:00:00+07:00",
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
  "description": "Tìm nhà vệ sinh công cộng sạch sẽ, miễn phí tại trung tâm TP.HCM và các quận lân cận qua bản đồ GPS."
};

export default async function Page() {
  const spots = await prisma.parkingSpot.findMany({ 
    where: { status: { in: ['active', 'ACTIVE'] }, type: 'RESTROOM' } 
  });

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '20px', lineHeight: '1.4' }}>
        Nhà Vệ Sinh Công Cộng TP.HCM 2026 – Bản Đồ WC Gần Đây Nhất
      </h1>

      <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #2a2a2a' }}>
        <h2 style={{ fontSize: '18px', color: '#fff', marginTop: 0, marginBottom: '15px' }}>Mục lục</h2>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
          <li><a href="#tong-quan" style={{ color: '#4a9eff', textDecoration: 'none' }}>1. Hiện trạng nhà vệ sinh công cộng</a></li>
          <li><a href="#danh-sach" style={{ color: '#4a9eff', textDecoration: 'none' }}>2. Bản đồ & danh sách nhà vệ sinh</a></li>
          <li><a href="#luu-y" style={{ color: '#4a9eff', textDecoration: 'none' }}>3. Lưu ý khi sử dụng</a></li>
          <li><a href="#faq" style={{ color: '#4a9eff', textDecoration: 'none' }}>4. Câu hỏi thường gặp</a></li>
        </ul>
      </div>

      <section id="tong-quan" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>1. Hiện trạng nhà vệ sinh công cộng</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>
          Tìm kiếm một <strong>nhà vệ sinh công cộng</strong> sạch sẽ, tiện nghi khi di chuyển trên đường phố đông đúc của TP.HCM luôn là nhu cầu thiết yếu của người dân và khách du lịch. Những năm gần đây, thành phố đã nỗ lực nâng cấp hệ thống <strong>WC công cộng TPHCM</strong>, với nhiều buồng vệ sinh tự động và các điểm miễn phí được duy trì sạch sẽ. Bài viết này tổng hợp danh sách các <strong>nhà vệ sinh gần đây</strong>, giúp bạn dễ dàng tra cứu ngay trên điện thoại khi cần thiết.
        </p>
      </section>

      <section id="danh-sach" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>2. Bản đồ & danh sách nhà vệ sinh</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          {spots.map((spot: any) => (
            <div key={spot.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', padding: '15px', borderRadius: '8px' }}>
              <h3 style={{ color: '#4a9eff', margin: '0 0 10px 0', fontSize: '18px' }}>
                <Link href={`/bai-xe/${spot.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{spot.name}</Link>
              </h3>
              <p style={{ margin: '5px 0' }}><strong>Địa chỉ:</strong> {spot.address}</p>
              <p style={{ margin: '5px 0' }}><strong>Giờ mở cửa:</strong> {spot.openTime} - {spot.closeTime}</p>
            </div>
          ))}
          {spots.length === 0 && <p style={{ color: '#aaa' }}>Đang cập nhật vị trí các nhà vệ sinh công cộng...</p>}
        </div>
      </section>

      <section id="luu-y" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>3. Lưu ý khi sử dụng</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>
          Để duy trì một môi trường công cộng xanh, sạch, đẹp, mỗi cá nhân khi sử dụng nhà vệ sinh công cộng cần giữ gìn vệ sinh chung, xả nước cẩn thận sau khi dùng và vứt rác đúng nơi quy định. Đối với các nhà vệ sinh thông minh, hãy tuân thủ hướng dẫn sử dụng trên bảng điện tử.
        </p>
      </section>

      <section id="faq" style={{ marginBottom: '30px', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '20px' }}>4. Câu hỏi thường gặp</h2>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Nhà vệ sinh công cộng có miễn phí không?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Đa số các nhà vệ sinh công cộng do thành phố quản lý ở khu vực trung tâm hiện nay đều miễn phí phục vụ người dân.</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Giờ mở cửa của các WC công cộng như thế nào?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Phần lớn hoạt động từ 6h00 sáng đến 22h00 đêm, một số trạm tại các tuyến phố đi bộ mở cửa 24/24.</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Làm sao để tìm nhà vệ sinh gần tôi nhất?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Bạn chỉ cần mở MapGo.vn, bật định vị GPS và chọn bộ lọc "Nhà vệ sinh", hệ thống sẽ gợi ý địa điểm gần bạn nhất kèm đường đi.</p>
        </div>
      </section>
    </article>
  );
}
