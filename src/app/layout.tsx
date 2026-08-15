import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mapgo.vn"),
  title: {
    default: "MapGo.vn - Tìm bãi đỗ xe quanh đây, Quán ăn, Café & Nhà vệ sinh gần nhất",
    template: "%s | MapGo.vn",
  },
  description: "MapGo.vn - Tìm bãi đỗ xe, bãi giữ xe ô tô xe máy quanh đây. Quán ăn có chỗ giữ xe, quán cafe đậu xe ô tô, nhà vệ sinh công cộng gần nhất tại TP.HCM. Bản đồ chỉ đường GPS real-time miễn phí 24/7.",
  keywords: [
    // === Parking - chung ===
    "Tìm bãi đỗ xe quanh đây",
    "bãi đỗ xe gần đây",
    "bãi giữ xe ô tô xe máy",
    "chỗ đậu xe gần đây",
    "chỗ giữ xe gần đây",
    "đậu xe ở đâu",
    "bãi gửi xe",
    "bãi giữ xe",
    "tìm chỗ đậu xe",
    "tìm chỗ giữ xe",
    // === Parking - loại xe ===
    "bãi đỗ xe ô tô",
    "bãi đỗ xe máy",
    "bãi giữ xe ô tô",
    "bãi giữ xe máy",
    "đỗ xe ô tô qua đêm",
    "bãi đỗ xe ô tô 24h",
    "bãi giữ xe máy tháng",
    "gửi xe máy qua đêm",
    "bãi đậu xe tải",
    // === Parking - giá ===
    "giá giữ xe ô tô",
    "giá gửi xe máy",
    "bãi đỗ xe giá rẻ",
    "bãi giữ xe giá rẻ",
    "phí giữ xe",
    "giá đậu xe",
    "bãi xe máy giá bao nhiêu",
    // === Ăn uống ===
    "quán ăn có bãi đỗ xe",
    "nhà hàng có chỗ đậu xe",
    "quán ăn có chỗ giữ xe",
    "nhà hàng có bãi giữ xe ô tô",
    "quán nhậu có chỗ đậu xe",
    // === Café ===
    "quán cafe có bãi đỗ xe",
    "quán cà phê đỗ xe ô tô",
    "quán cafe có chỗ giữ xe",
    "quán cà phê có bãi giữ xe ô tô",
    "quán cafe đậu xe ô tô Sài Gòn",
    // === WC ===
    "nhà vệ sinh gần đây",
    "nhà vệ sinh công cộng TP.HCM",
    "toilet công cộng gần đây",
    "WC công cộng Sài Gòn",
    // === Dịch vụ ===
    "trạm xăng gần đây",
    "cây xăng gần đây",
    "rửa xe gần đây",
    "tiệm rửa xe ô tô",
    "sửa xe máy gần đây",
    // === Quận - phổ biến ===
    "bãi đỗ xe Quận 1",
    "bãi đỗ xe Quận 3",
    "bãi đỗ xe Quận 5",
    "bãi đỗ xe Quận 7",
    "bãi đỗ xe Quận 10",
    "bãi đỗ xe TP Thủ Đức",
    "bãi giữ xe Quận Bình Thạnh",
    "bãi giữ xe Quận Gò Vấp",
    "bãi giữ xe Quận Tân Bình",
    "bãi giữ xe Quận Phú Nhuận",
    "bãi giữ xe Quận Bình Tân",
    "bãi giữ xe Quận Tân Phú",
    "bãi đỗ xe Quận 4",
    "bãi đỗ xe Quận 6",
    "bãi đỗ xe Quận 8",
    "bãi đỗ xe Quận 11",
    "bãi đỗ xe Quận 12",
    // === Địa danh / Landmark ===
    "đỗ xe gần sân bay Tân Sơn Nhất",
    "giữ xe gần chợ Bến Thành",
    "bãi đỗ xe gần Chợ Lớn",
    "giữ xe gần bến xe miền Đông",
    "giữ xe gần bến xe miền Tây",
    "đậu xe gần bệnh viện",
    "bãi đỗ xe trung tâm Sài Gòn",
    // === App / Bản đồ ===
    "ứng dụng tìm bãi đỗ xe",
    "app tìm chỗ đậu xe",
    "bản đồ bãi xe TP.HCM",
    "bản đồ tiện ích MapGo",
    "chỉ đường GPS TP.HCM",
    "app giữ xe Sài Gòn",
    // === Long-tail ===
    "bãi đỗ xe gần đây mở cửa 24/7",
    "chỗ gửi xe đi chơi Sài Gòn",
    "bãi xe có camera an ninh",
    "giữ xe ô tô dài ngày",
    "đỗ xe ở đâu khi đi ăn Quận 1",
  ],
  authors: [{ name: "MapGo Team", url: "https://mapgo.vn" }],
  creator: "MapGo.vn",
  publisher: "MapGo.vn",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://mapgo.vn",
  },
  openGraph: {
    title: "MapGo.vn - Tìm bãi đỗ xe, bãi giữ xe quanh đây, Quán ăn, Café có chỗ đậu xe & WC",
    description: "Bản đồ tìm bãi đỗ xe, bãi giữ xe ô tô xe máy quanh đây. Quán ăn có chỗ giữ xe, quán cafe đậu xe ô tô, nhà vệ sinh gần nhất tại TP.HCM. Chỉ đường GPS miễn phí!",
    url: "https://mapgo.vn",
    siteName: "MapGo.vn",
    images: [
      {
        url: "https://mapgo.vn/logo.png",
        width: 512,
        height: 512,
        alt: "MapGo.vn Logo",
      },
    ],
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "MapGo.vn - Tìm bãi đỗ xe, bãi giữ xe quanh đây & Tiện ích gần bạn",
    description: "Tìm bãi đỗ xe, bãi giữ xe ô tô xe máy quanh đây. Quán ăn có chỗ giữ xe, quán cafe đậu xe ô tô, nhà vệ sinh gần đây tại TP.HCM. Chỉ đường GPS miễn phí!",
    images: ["https://mapgo.vn/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MapGo.vn",
  "url": "https://mapgo.vn",
  "description": "Bản đồ tiện ích tìm bãi đỗ xe quanh đây, quán ăn có bãi đỗ xe, quán cafe đỗ xe ô tô, nhà vệ sinh công cộng gần nhất tại TP.HCM",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://mapgo.vn/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MapGo.vn",
  "url": "https://mapgo.vn",
  "logo": "https://mapgo.vn/logo.png",
  "sameAs": []
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body>
        <AuthProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
