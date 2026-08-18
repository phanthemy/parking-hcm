import prisma from '@/lib/prisma';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bãi Đỗ Xe TP.HCM – 408+ Bãi Giữ Xe Ô Tô Xe Máy Gần Đây | MapGo.vn',
  description: 'Danh sách 408+ bãi đỗ xe TP.HCM cập nhật 2026. Tìm bãi giữ xe ô tô xe máy theo quận — giá, địa chỉ, giờ mở cửa. Chỉ đường GPS miễn phí.',
  keywords: ['bãi đỗ xe', 'bãi đỗ xe TP.HCM', 'bãi giữ xe ô tô', 'bãi đỗ xe ô tô gần đây', 'chỗ đậu xe TP.HCM'],
  alternates: {
    canonical: 'https://mapgo.vn/bai-do-xe-tphcm',
  },
};

import { getDistrictFromAddress } from '@/lib/district';

const createSlug = (text: string) => {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\s+/g, '-');
};

export default async function BaiDoXeTpHcm() {
  const spots = await prisma.parkingSpot.findMany({
    where: { status: { in: ['active', 'ACTIVE'] } },
    select: { id: true, slug: true, name: true, address: true, type: true, carSlots: true, bikeSlots: true, pricePerHour: true, openTime: true, closeTime: true },
    orderBy: { name: 'asc' }
  });

  const districts: Record<string, typeof spots> = {};
  let totalCarSlots = 0;
  let totalBikeSlots = 0;
  let totalPrice = 0;
  let spotsWithPrice = 0;

  spots.forEach(spot => {
    const district = getDistrictFromAddress(spot.address);
    if (!districts[district]) districts[district] = [];
    districts[district].push(spot);

    if (spot.carSlots) totalCarSlots += spot.carSlots;
    if (spot.bikeSlots) totalBikeSlots += spot.bikeSlots;
    if (spot.pricePerHour) {
      totalPrice += spot.pricePerHour;
      spotsWithPrice++;
    }
  });

  const sortedDistricts = Object.keys(districts).sort();
  const avgPrice = spotsWithPrice > 0 ? Math.round(totalPrice / spotsWithPrice) : 0;

  const itemListElement = spots.map((spot, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `https://mapgo.vn/bai-xe/${spot.slug || spot.id}`,
    name: spot.name
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement
  };

  return (
    <div style={{ backgroundColor: '#0f0f0f', color: '#e0e0e0', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1.2 }}>
          Bãi Đỗ Xe TP.HCM – Danh Sách 408+ Bãi Giữ Xe Ô Tô, Xe Máy
        </h1>
        
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '30px' }}>
          Tìm kiếm <strong>bãi đỗ xe TP.HCM</strong> luôn là một trong những nỗi lo lớn của người dân cũng như du khách khi di chuyển trong nội ô thành phố, đặc biệt là tại các quận trung tâm như Quận 1, Quận 3 hay các khu vực sầm uất như Bình Thạnh, Gò Vấp. Với lượng phương tiện cá nhân ngày càng gia tăng, việc tìm một <strong>chỗ đậu xe ô tô gần đây</strong> hay <strong>bãi giữ xe máy</strong> an toàn, giá cả hợp lý trở nên cực kỳ quan trọng. 
          Bài viết dưới đây tổng hợp danh sách hơn {spots.length} bãi giữ xe uy tín, bao gồm đầy đủ thông tin về địa chỉ, giờ mở cửa, và mức giá. Dù bạn cần tìm một bãi gửi xe qua đêm hay một điểm đỗ xe tạm thời để đi cà phê, mua sắm, MapGo cung cấp cho bạn thông tin chính xác, cập nhật nhất giúp tiết kiệm thời gian và đảm bảo an toàn cho phương tiện của bạn.
        </p>

        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '40px' }}>
          <h2 style={{ color: 'white', marginTop: 0 }}>Thống Kê Tổng Quan</h2>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <li><strong>Tổng số bãi xe:</strong> {spots.length}</li>
            <li><strong>Số lượng bãi ô tô:</strong> {spots.filter(s => s.carSlots && s.carSlots > 0).length}</li>
            <li><strong>Khu vực bao phủ:</strong> {sortedDistricts.length} Quận/Huyện</li>
            <li><strong>Giá trung bình:</strong> {avgPrice.toLocaleString('vi-VN')} VNĐ/giờ</li>
          </ul>
        </div>

        <nav style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'white' }}>Mục Lục Theo Quận</h2>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', listStyleType: 'none', padding: 0 }}>
            {sortedDistricts.map(d => (
              <li key={d}>
                <a href={`#${createSlug(d)}`} style={{ color: '#4a9eff', textDecoration: 'none', padding: '5px 10px', backgroundColor: '#2a2a2a', borderRadius: '4px', display: 'inline-block' }}>
                  {d} ({districts[d].length})
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {sortedDistricts.map(district => (
          <section key={district} id={createSlug(district)} style={{ marginBottom: '50px' }}>
            <h2 style={{ color: 'white', borderBottom: '1px solid #2a2a2a', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Bãi đỗ xe tại {district}</span>
              <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#888' }}>{districts[district].length} bãi xe</span>
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #2a2a2a' }}>
                    <th style={{ padding: '12px 8px', color: 'white' }}>Tên bãi xe</th>
                    <th style={{ padding: '12px 8px', color: 'white' }}>Địa chỉ</th>
                    <th style={{ padding: '12px 8px', color: 'white' }}>Giờ hoạt động</th>
                    <th style={{ padding: '12px 8px', color: 'white' }}>Giá (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  {districts[district].map(spot => (
                    <tr key={spot.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <Link href={`/bai-xe/${spot.slug || spot.id}`} style={{ color: '#4a9eff', textDecoration: 'none', fontWeight: 'bold' }}>
                          {spot.name}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 8px' }}>{spot.address}</td>
                      <td style={{ padding: '12px 8px' }}>{spot.openTime} - {spot.closeTime}</td>
                      <td style={{ padding: '12px 8px' }}>{spot.pricePerHour ? `${spot.pricePerHour.toLocaleString('vi-VN')}/h` : 'Liên hệ'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <Link href={`/bai-do-xe/${createSlug(district)}`} style={{ color: '#4a9eff', textDecoration: 'none' }}>
                &rarr; Xem chi tiết tất cả bãi xe {district}
              </Link>
            </div>
          </section>
        ))}

        <section style={{ marginTop: '60px', padding: '30px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
          <h2 style={{ color: 'white', marginTop: 0 }}>Câu Hỏi Thường Gặp (FAQ)</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#4a9eff', marginBottom: '10px' }}>1. Giá gửi xe ô tô trung bình ở TP.HCM là bao nhiêu?</h3>
            <p style={{ margin: 0 }}>Giá gửi xe ô tô tại TP.HCM dao động từ 20.000 VNĐ - 50.000 VNĐ/giờ tùy khu vực. Tại Quận 1 và Quận 3, mức giá thường cao hơn, có thể lên đến 50.000 VNĐ/2 giờ đầu. Gửi qua đêm thường từ 150.000 VNĐ - 300.000 VNĐ.</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#4a9eff', marginBottom: '10px' }}>2. Làm sao để tìm bãi đỗ xe ô tô gần đây nhất?</h3>
            <p style={{ margin: 0 }}>Bạn có thể sử dụng chức năng tìm kiếm trên bản đồ của MapGo.vn. Chỉ cần cho phép truy cập vị trí, hệ thống sẽ tự động hiển thị các bãi xe gần bạn nhất cùng với thông tin về sức chứa và giá cả hiện tại.</p>
          </div>
          
          <div>
            <h3 style={{ color: '#4a9eff', marginBottom: '10px' }}>3. Có bãi giữ xe mở cửa 24/24 không?</h3>
            <p style={{ margin: 0 }}>Có. Nhiều bãi giữ xe tại các hầm chung cư, trung tâm thương mại lớn hoặc các bãi xe tư nhân lớn đều hoạt động 24/7 để phục vụ nhu cầu gửi xe qua đêm của người dân.</p>
          </div>
        </section>

      </div>
    </div>
  );
}
