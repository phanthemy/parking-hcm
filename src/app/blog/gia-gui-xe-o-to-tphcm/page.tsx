import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Bảng Giá Gửi Xe Ô Tô TP.HCM 2026 – Cập Nhật Mới Nhất Theo Quận',
  description: 'Bảng giá dịch vụ gửi xe ô tô theo giờ, qua đêm, theo tháng cập nhật năm 2026.',
  keywords: 'giá gửi xe ô tô, bảng giá bãi đỗ xe TPHCM',
  alternates: {
    canonical: `https://mapgo.vn/blog/gia-gui-xe-o-to-tphcm`
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Bảng Giá Gửi Xe Ô Tô TP.HCM 2026 – Cập Nhật Mới Nhất Theo Quận",
  "image": ["https://mapgo.vn/logo.png"],
  "datePublished": "2026-08-15T00:00:00+07:00",
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
  "description": "Chi tiết bảng giá gửi xe ô tô tại TP.HCM theo giờ, theo ngày, qua đêm và theo tháng tại các quận trung tâm."
};

export default async function Page() {
  const spots = await prisma.parkingSpot.findMany({ 
    where: { status: { in: ['active', 'ACTIVE'] } },
    select: { id: true, slug: true, name: true, address: true, carSlots: true, bikeSlots: true, type: true, pricePerHour: true, openTime: true, closeTime: true, phone: true },
    orderBy: { pricePerHour: 'asc' }
  });

  const validSpots = spots.filter(s => (s.pricePerHour || 0) > 0);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '20px', lineHeight: '1.4' }}>
        Bảng Giá Gửi Xe Ô Tô TP.HCM 2026 – Cập Nhật Mới Nhất Theo Quận
      </h1>

      <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #2a2a2a' }}>
        <h2 style={{ fontSize: '18px', color: '#fff', marginTop: 0, marginBottom: '15px' }}>Mục lục</h2>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
          <li><a href="#tong-quan" style={{ color: '#4a9eff', textDecoration: 'none' }}>1. Tổng quan thị trường giá gửi xe ô tô</a></li>
          <li><a href="#bang-gia" style={{ color: '#4a9eff', textDecoration: 'none' }}>2. Bảng giá chi tiết</a></li>
          <li><a href="#luu-y" style={{ color: '#4a9eff', textDecoration: 'none' }}>3. Lưu ý về giá gửi xe</a></li>
          <li><a href="#faq" style={{ color: '#4a9eff', textDecoration: 'none' }}>4. Câu hỏi thường gặp</a></li>
        </ul>
      </div>

      <section id="tong-quan" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>1. Tổng quan thị trường giá gửi xe ô tô</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>
          Năm 2026, <strong>giá gửi xe ô tô</strong> tại TP.HCM tiếp tục có sự phân hóa rõ rệt giữa các khu vực. Tại khu vực trung tâm như Quận 1, Quận 3, mức giá thường cao hơn đáng kể do chi phí mặt bằng đắt đỏ và nhu cầu quá tải. Trong khi đó, ở các quận ven và khu vực ngoại thành, <strong>bảng giá bãi đỗ xe TPHCM</strong> nhìn chung duy trì ở mức ổn định và hợp lý hơn. Việc nắm rõ biểu giá chung giúp tài xế chủ động hơn trong việc tính toán chi phí di chuyển.
        </p>
      </section>

      <section id="bang-gia" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>2. Bảng giá chi tiết</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', backgroundColor: '#1a1a1a', minWidth: '600px' }}>
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
                    <Link href={`/bai-xe/${spot.slug}`} style={{ color: '#4a9eff', textDecoration: 'none' }}>{spot.name}</Link>
                  </td>
                  <td style={{ border: '1px solid #2a2a2a', padding: '10px' }}>{spot.address}</td>
                  <td style={{ border: '1px solid #2a2a2a', padding: '10px', textAlign: 'right' }}>{spot.pricePerHour?.toLocaleString('vi-VN')}</td>
                </tr>
              ))}
              {validSpots.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ border: '1px solid #2a2a2a', padding: '10px', textAlign: 'center', color: '#aaa' }}>Chưa có dữ liệu giá.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="luu-y" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>3. Lưu ý về giá gửi xe</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>
          Mức giá trên thường được áp dụng trong giờ hành chính. Đối với việc gửi xe vào ban đêm, cuối tuần hoặc các dịp Lễ, Tết, các bãi xe có thể áp dụng mức phụ thu. Hãy hỏi rõ người quản lý về cách tính phí (theo giờ, theo block 2 giờ hay tính nguyên buổi) trước khi quyết định gửi xe.
        </p>
      </section>

      <section id="faq" style={{ marginBottom: '30px', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '20px' }}>4. Câu hỏi thường gặp</h2>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Giá giữ xe ô tô ở Quận 1 là bao nhiêu?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Ở Quận 1, giá gửi xe thường dao động từ 30.000 đến 50.000 VNĐ/giờ tùy thuộc vào vị trí tòa nhà hoặc tầng hầm.</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Gửi xe ô tô theo tháng giá thế nào?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Gửi theo tháng thường dao động từ 1.500.000 đến 3.500.000 VNĐ/tháng, và bạn cần đăng ký trước vì số lượng chỗ trống có hạn.</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Các bãi xe có thu thêm phí dịch vụ rửa xe không?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Nhiều bãi xe kết hợp dịch vụ rửa xe, chăm sóc xe, phí này sẽ được tính riêng nếu bạn có nhu cầu sử dụng.</p>
        </div>
      </section>
    </article>
  );
}
