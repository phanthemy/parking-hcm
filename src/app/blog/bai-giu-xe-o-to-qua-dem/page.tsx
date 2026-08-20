import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Bãi Giữ Xe Ô Tô Qua Đêm TP.HCM 2026 – An Toàn, Uy Tín, Giá Rẻ',
  description: 'Tìm bãi giữ xe ô tô qua đêm 24/24 an toàn, uy tín với chi phí hợp lý tại TP.HCM.',
  keywords: 'bãi giữ xe ô tô qua đêm, gửi xe ô tô qua đêm TPHCM',
  alternates: {
    canonical: `https://mapgo.vn/blog/bai-giu-xe-o-to-qua-dem`
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Bãi Giữ Xe Ô Tô Qua Đêm TP.HCM 2026 – An Toàn, Uy Tín, Giá Rẻ",
  "image": ["https://mapgo.vn/logo.png"],
  "datePublished": "2026-08-16T00:00:00+07:00",
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
  "description": "Tổng hợp các bãi giữ xe ô tô qua đêm tại TP.HCM an ninh 24/7, có mái che, giá hợp lý."
};

export default async function Page() {
  const spots = await prisma.parkingSpot.findMany({ 
    where: { 
      status: { in: ['active', 'ACTIVE'] }, 
      closeTime: { in: ['23:30', '23:59', '24:00', '00:00'] } 
    } 
  });

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '20px', lineHeight: '1.4' }}>
        Bãi Giữ Xe Ô Tô Qua Đêm TP.HCM 2026 – An Toàn, Uy Tín, Giá Rẻ
      </h1>

      <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #2a2a2a' }}>
        <h2 style={{ fontSize: '18px', color: '#fff', marginTop: 0, marginBottom: '15px' }}>Mục lục</h2>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
          <li><a href="#gioi-thieu" style={{ color: '#4a9eff', textDecoration: 'none' }}>1. Tầm quan trọng của bãi giữ xe qua đêm an toàn</a></li>
          <li><a href="#danh-sach" style={{ color: '#4a9eff', textDecoration: 'none' }}>2. Danh sách bãi giữ xe ô tô qua đêm tại TP.HCM</a></li>
          <li><a href="#kinh-nghiem" style={{ color: '#4a9eff', textDecoration: 'none' }}>3. Kinh nghiệm khi gửi xe qua đêm</a></li>
          <li><a href="#faq" style={{ color: '#4a9eff', textDecoration: 'none' }}>4. Câu hỏi thường gặp</a></li>
        </ul>
      </div>

      <section id="gioi-thieu" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>1. Tầm quan trọng của bãi giữ xe qua đêm an toàn</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>
          Với sự gia tăng mạnh mẽ của phương tiện cá nhân, đặc biệt là ô tô tại TP.HCM, nhu cầu tìm kiếm <strong>bãi giữ xe ô tô qua đêm</strong> an toàn và uy tín đang trở nên cấp thiết hơn bao giờ hết. Rất nhiều chủ xe gặp khó khăn khi tìm chỗ đậu xe an toàn qua đêm do diện tích nhà không đủ rộng hoặc khi phải đi công tác, du lịch. Việc để xe ngoài đường tiềm ẩn nhiều rủi ro về mất cắp, phá hoại hoặc vi phạm luật giao thông. Vì vậy, gửi xe tại các bãi đỗ xe có người trông coi 24/24, trang bị hệ thống camera giám sát và PCCC đạt chuẩn là giải pháp tối ưu.
        </p>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>
          Trong bài viết này, MapGo.vn sẽ cung cấp cho bạn danh sách các bãi gửi xe ô tô qua đêm TPHCM được đánh giá cao, với thông tin minh bạch về giá cả, vị trí và tiện ích đi kèm, giúp bạn dễ dàng lựa chọn địa điểm phù hợp.
        </p>
      </section>

      <section id="danh-sach" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>2. Danh sách bãi giữ xe ô tô qua đêm tại TP.HCM</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {spots.map((spot: any) => (
            <div key={spot.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', padding: '15px', borderRadius: '8px' }}>
              <h3 style={{ color: '#4a9eff', margin: '0 0 10px 0', fontSize: '18px' }}>
                <Link href={`/bai-xe/${spot.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{spot.name}</Link>
              </h3>
              <p style={{ margin: '5px 0' }}><strong>Địa chỉ:</strong> {spot.address}</p>
              <p style={{ margin: '5px 0' }}><strong>Giá tham khảo:</strong> {spot.pricePerHour?.toLocaleString('vi-VN')} VND/giờ</p>
              <p style={{ margin: '5px 0' }}><strong>Giờ mở cửa:</strong> 24/24 hoặc đến khuya ({spot.openTime} - {spot.closeTime})</p>
            </div>
          ))}
          {spots.length === 0 && <p style={{ color: '#aaa' }}>Đang cập nhật danh sách bãi giữ xe qua đêm...</p>}
        </div>
      </section>

      <section id="kinh-nghiem" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>3. Kinh nghiệm khi gửi xe qua đêm</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>
          Khi gửi xe ô tô qua đêm, bạn nên lưu ý một số điểm sau để đảm bảo an toàn cho tài sản:
          <br/>- <strong>Kiểm tra an ninh:</strong> Ưu tiên chọn các bãi xe có bảo vệ trực 24/7 và hệ thống camera giám sát rõ nét.
          <br/>- <strong>Xác nhận giá cả:</strong> Hỏi kỹ về mức giá gửi qua đêm, tránh trường hợp bị thu phí cao hơn so với niêm yết.
          <br/>- <strong>Biên nhận rõ ràng:</strong> Luôn yêu cầu vé xe hoặc biên nhận rõ ràng có ghi biển số xe và thời gian gửi.
          <br/>- <strong>Kiểm tra xe trước và sau khi gửi:</strong> Hãy chắc chắn không để lại đồ vật có giá trị trong xe và kiểm tra tình trạng xe trước khi rời đi.
        </p>
      </section>

      <section id="faq" style={{ marginBottom: '30px', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '20px' }}>4. Câu hỏi thường gặp</h2>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Giá gửi xe ô tô qua đêm thường là bao nhiêu?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Mức giá dao động từ 100.000 đến 250.000 VNĐ/đêm tùy thuộc vào vị trí quận trung tâm hay ngoại thành và cơ sở vật chất của bãi xe.</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Các bãi xe này có nhận giữ xe theo tháng không?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Hầu hết các bãi đỗ xe lớn đều có dịch vụ giữ xe theo tháng với mức giá ưu đãi hơn so với gửi theo ngày.</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>Có cần phải đặt chỗ trước khi gửi qua đêm không?</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>Vào dịp cuối tuần hoặc lễ Tết, bạn nên liên hệ đặt chỗ trước để đảm bảo còn chỗ trống, đặc biệt tại khu vực trung tâm.</p>
        </div>
      </section>
    </article>
  );
}
