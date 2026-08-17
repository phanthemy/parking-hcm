import { Metadata } from 'next';
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
          <Link href={`/blog/${a.slug}`} key={a.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
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
