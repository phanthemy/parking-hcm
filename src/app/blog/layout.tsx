import Link from 'next/link';

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
