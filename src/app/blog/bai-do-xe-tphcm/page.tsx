import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Top 50+ Bãi Đỗ Xe Ô Tô TP.HCM 2026 – Địa Chỉ, Giá, Bản Đồ GPS',
  description: 'Khám phá thông tin chi tiết về bãi đỗ xe ô tô tại TP.HCM. Cập nhật mới nhất năm 2026.',
  keywords: 'bãi đỗ xe, bãi đỗ xe TP.HCM, bãi đỗ xe ô tô',
  alternates: {
    canonical: `https://mapgo.vn/blog/bai-do-xe-tphcm`
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Top 50+ Bãi Đỗ Xe Ô Tô TP.HCM 2026 – Địa Chỉ, Giá, Bản Đồ GPS",
  "datePublished": "2026-08-17T00:00:00+07:00",
  "author": {
    "@type": "Organization",
    "name": "MapGo.vn"
  }
};

export default async function Page() {
  const spots = await prisma.parkingSpot.findMany({ where: { status: { in: ['active', 'ACTIVE'] }, type: 'PARKING_LOT' } });
  
      const grouped = spots.reduce((acc, spot) => {
        const districtMatch = spot.address?.match(/Quận [\w\d]+|Q\.[\w\d]+|Bình Thạnh|Thủ Đức|Gò Vấp|Tân Bình|Tân Phú|Phú Nhuận|Bình Tân/i);
        const district = districtMatch ? districtMatch[0] : 'Khác';
        if (!acc[district]) acc[district] = [];
        acc[district].push(spot);
        return acc;
      }, {} as Record<string, any[]>);
    

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '20px', lineHeight: '1.4' }}>
        Top 50+ Bãi Đỗ Xe Ô Tô TP.HCM 2026 – Địa Chỉ, Giá, Bản Đồ GPS
      </h1>

      <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #2a2a2a' }}>
        <h2 style={{ fontSize: '18px', color: '#fff', marginTop: 0, marginBottom: '15px' }}>Mục lục</h2>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
          <li><a href="#gioi-thieu" style={{ color: '#4a9eff', textDecoration: 'none' }}>1. Giới thiệu tổng quan</a></li>
          <li><a href="#danh-sach" style={{ color: '#4a9eff', textDecoration: 'none' }}>2. Danh sách chi tiết theo quận</a></li>
          <li><a href="#kinh-nghiem" style={{ color: '#4a9eff', textDecoration: 'none' }}>3. Kinh nghiệm hữu ích</a></li>
          <li><a href="#faq" style={{ color: '#4a9eff', textDecoration: 'none' }}>4. Câu hỏi thường gặp (FAQ)</a></li>
        </ul>
      </div>

      <section id="gioi-thieu" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>1. Giới thiệu tổng quan</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>Trong bối cảnh đô thị hóa ngày càng nhanh tại TP.HCM năm 2026, việc tìm kiếm một bãi đỗ xe ô tô uy tín, an toàn và có giá cả hợp lý là một trong những mối quan tâm hàng đầu của người dân cũng như du khách. Khi số lượng phương tiện cá nhân, đặc biệt là ô tô tăng vọt, hạ tầng giao thông và các dịch vụ tiện ích đi kèm đôi khi chưa đáp ứng kịp thời, dẫn đến tình trạng ùn tắc hoặc khó khăn trong việc tìm chỗ dừng đỗ. Do đó, việc nắm rõ thông tin về các địa điểm này không chỉ giúp bạn tiết kiệm thời gian, công sức mà còn đảm bảo an toàn cho tài sản cá nhân. Những kinh nghiệm thực tế từ cộng đồng tài xế chia sẻ luôn là nguồn thông tin quý giá. Ngoài ra, các yếu tố như vị trí thuận tiện, hệ thống camera giám sát an ninh 24/7, hệ thống phòng cháy chữa cháy đạt chuẩn, nhân viên bảo vệ chuyên nghiệp nhiệt tình, và đặc biệt là mức giá niêm yết rõ ràng minh bạch cũng là những tiêu chí quan trọng cần xem xét. Việc chuẩn bị sẵn thông tin sẽ giúp chuyến đi của bạn thêm phần trọn vẹn và an tâm hơn rất nhiều. Hơn nữa, việc sử dụng các ứng dụng bản đồ, dịch vụ định vị GPS kết hợp với những bài viết đánh giá chi tiết như thế này đang trở thành xu hướng tất yếu của những người lái xe thông minh trong thời đại công nghệ số. </p>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>Trong bối cảnh đô thị hóa ngày càng nhanh tại TP.HCM năm 2026, việc tìm kiếm một bãi đỗ xe ô tô uy tín, an toàn và có giá cả hợp lý là một trong những mối quan tâm hàng đầu của người dân cũng như du khách. Khi số lượng phương tiện cá nhân, đặc biệt là ô tô tăng vọt, hạ tầng giao thông và các dịch vụ tiện ích đi kèm đôi khi chưa đáp ứng kịp thời, dẫn đến tình trạng ùn tắc hoặc khó khăn trong việc tìm chỗ dừng đỗ. Do đó, việc nắm rõ thông tin về các địa điểm này không chỉ giúp bạn tiết kiệm thời gian, công sức mà còn đảm bảo an toàn cho tài sản cá nhân. Những kinh nghiệm thực tế từ cộng đồng tài xế chia sẻ luôn là nguồn thông tin quý giá. Ngoài ra, các yếu tố như vị trí thuận tiện, hệ thống camera giám sát an ninh 24/7, hệ thống phòng cháy chữa cháy đạt chuẩn, nhân viên bảo vệ chuyên nghiệp nhiệt tình, và đặc biệt là mức giá niêm yết rõ ràng minh bạch cũng là những tiêu chí quan trọng cần xem xét. Việc chuẩn bị sẵn thông tin sẽ giúp chuyến đi của bạn thêm phần trọn vẹn và an tâm hơn rất nhiều. Hơn nữa, việc sử dụng các ứng dụng bản đồ, dịch vụ định vị GPS kết hợp với những bài viết đánh giá chi tiết như thế này đang trở thành xu hướng tất yếu của những người lái xe thông minh trong thời đại công nghệ số. </p>
      </section>

      <section id="danh-sach" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>2. Danh sách chi tiết</h2>
        <p style={{ marginBottom: '20px', lineHeight: '1.7' }}>
          Dưới đây là dữ liệu được tổng hợp trực tiếp từ hệ thống MapGo.vn, cập nhật liên tục để mang đến thông tin chính xác nhất.
        </p>
        
      {Object.entries(grouped).map(([district, districtSpots]: [string, any]) => (
        <div key={district} style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '15px' }} id={`quan-${district.replace(/\s/g, '-')}`}>Bãi đỗ xe tại {district}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {districtSpots.map((spot: any) => (
              <div key={spot.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: '#4a9eff', margin: '0 0 10px 0' }}>
                  <Link href={`/bai-xe/${spot.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{spot.name}</Link>
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
    
      </section>

      <section id="kinh-nghiem" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '15px', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px' }}>3. Kinh nghiệm hữu ích</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>Trong bối cảnh đô thị hóa ngày càng nhanh tại TP.HCM năm 2026, việc tìm kiếm một bãi đỗ xe ô tô uy tín, an toàn và có giá cả hợp lý là một trong những mối quan tâm hàng đầu của người dân cũng như du khách. Khi số lượng phương tiện cá nhân, đặc biệt là ô tô tăng vọt, hạ tầng giao thông và các dịch vụ tiện ích đi kèm đôi khi chưa đáp ứng kịp thời, dẫn đến tình trạng ùn tắc hoặc khó khăn trong việc tìm chỗ dừng đỗ. Do đó, việc nắm rõ thông tin về các địa điểm này không chỉ giúp bạn tiết kiệm thời gian, công sức mà còn đảm bảo an toàn cho tài sản cá nhân. Những kinh nghiệm thực tế từ cộng đồng tài xế chia sẻ luôn là nguồn thông tin quý giá. Ngoài ra, các yếu tố như vị trí thuận tiện, hệ thống camera giám sát an ninh 24/7, hệ thống phòng cháy chữa cháy đạt chuẩn, nhân viên bảo vệ chuyên nghiệp nhiệt tình, và đặc biệt là mức giá niêm yết rõ ràng minh bạch cũng là những tiêu chí quan trọng cần xem xét. Việc chuẩn bị sẵn thông tin sẽ giúp chuyến đi của bạn thêm phần trọn vẹn và an tâm hơn rất nhiều. Hơn nữa, việc sử dụng các ứng dụng bản đồ, dịch vụ định vị GPS kết hợp với những bài viết đánh giá chi tiết như thế này đang trở thành xu hướng tất yếu của những người lái xe thông minh trong thời đại công nghệ số. </p>
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
