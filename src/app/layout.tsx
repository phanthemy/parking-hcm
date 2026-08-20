import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { UserRetentionProvider } from "@/contexts/UserRetentionContext";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

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
    default: "Bãi giữ xe TP.HCM – Tìm bãi gửi xe, chỗ đậu xe ô tô gần đây | MapGo.vn",
    template: "%s | MapGo.vn",
  },
  description: "Bãi giữ xe TP.HCM ❱ Tìm 408+ bãi giữ xe ô tô xe máy, chỗ đậu xe ô tô gần đây, bãi gửi xe qua đêm, quán ăn có bãi xe, WC công cộng. Bản đồ GPS Sài Gòn miễn phí 24/7.",
  keywords: [
    // Head terms miền Nam — ưu tiên hàng đầu
    "bãi giữ xe",
    "bãi giữ xe TP.HCM",
    "bãi giữ xe ô tô",
    "bãi giữ xe gần đây",
    "chỗ đậu xe ô tô",
    "bãi gửi xe",
    "bãi gửi xe ô tô TP.HCM",
    "bãi gửi xe qua đêm",
    "bãi đỗ xe",
    "bãi đỗ xe TP.HCM",
    "bãi đỗ xe ô tô",
    "tìm bãi giữ xe",
    "giá gửi xe ô tô TP.HCM",
    "parking TPHCM",
    // Long-tail & Tiện ích
    "quán ăn có chỗ đậu ô tô Quận 1",
    "quán ăn có bãi giữ xe TP.HCM",
    "quán cafe có chỗ đậu xe ô tô",
    "nhà vệ sinh công cộng gần Bến Thành",
    "nhà vệ sinh gần đây TP.HCM",
    "bãi giữ xe Quận 1",
    "bãi giữ xe Quận 7",
    "bãi giữ xe TP Thủ Đức",
    "chỉ đường bãi xe GPS",
    "bản đồ tiện ích Sài Gòn",
    "app giữ xe Sài Gòn",
    // === Long-tail ===
    "bãi đỗ xe gần đây mở cửa 24/7",
    "chỗ gửi xe đi chơi Sài Gòn",
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MapGo",
  },
  openGraph: {
    title: "Bãi giữ xe TP.HCM – Tìm bãi gửi xe, chỗ đậu xe ô tô gần đây | MapGo.vn",
    description: "Bãi giữ xe TP.HCM ❱ Tìm 408+ bãi giữ xe ô tô xe máy, chỗ đậu xe ô tô gần đây, bãi gửi xe qua đêm, quán ăn có bãi xe, WC công cộng. Bản đồ GPS Sài Gòn miễn phí 24/7.",
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
    title: "Bãi giữ xe TP.HCM – Tìm chỗ đậu xe ô tô gần đây | MapGo.vn",
    description: "Bãi giữ xe TP.HCM ❱ 408+ bãi giữ xe ô tô xe máy, chỗ đậu xe ô tô, bãi gửi xe qua đêm, WC công cộng. Bản đồ GPS miễn phí!",
    images: ["https://mapgo.vn/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://mapgo.vn/#website",
      "url": "https://mapgo.vn",
      "name": "MapGo.vn",
      "description": "Bản đồ tiện ích tìm bãi đỗ xe quanh đây, quán ăn có bãi đỗ xe, quán cafe đỗ xe ô tô, nhà vệ sinh công cộng gần nhất tại TP.HCM",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://mapgo.vn/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://mapgo.vn/#organization",
      "name": "MapGo.vn",
      "url": "https://mapgo.vn",
      "logo": "https://mapgo.vn/logo.png"
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://mapgo.vn/#localbusiness",
      "name": "MapGo.vn - Bản đồ bãi giữ xe & Tiện ích TP.HCM",
      "image": "https://mapgo.vn/logo.png",
      "url": "https://mapgo.vn",
      "telephone": "+84900000000",
      "priceRange": "5.000đ - 50.000đ",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "TP. Hồ Chí Minh",
        "addressLocality": "Hồ Chí Minh",
        "addressRegion": "Hồ Chí Minh",
        "addressCountry": "VN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 10.7769,
        "longitude": 106.7009
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://mapgo.vn/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Làm sao tìm bãi đỗ xe gần nhất trên MapGo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bạn chỉ cần mở bản đồ MapGo.vn, cho phép truy cập vị trí, hệ thống sẽ hiển thị các bãi đỗ xe ô tô, xe máy gần bạn nhất kèm chỉ đường GPS trực tiếp."
          }
        },
        {
          "@type": "Question",
          "name": "MapGo có cung cấp giá gửi xe không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Một số bãi xe có giá tham khảo do cộng đồng cập nhật. Giá thực tế có thể thay đổi tùy thời điểm, vui lòng xác nhận tại điểm đỗ."
          }
        },
        {
          "@type": "Question",
          "name": "Làm sao tìm nhà vệ sinh công cộng gần nhất TP.HCM?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Trên MapGo.vn, chọn bộ lọc 'Nhà vệ sinh công cộng' để xem các vị trí gần bạn nhất, kèm khoảng cách và chỉ đường."
          }
        },
        {
          "@type": "Question",
          "name": "Bãi giữ xe ô tô qua đêm ở TP.HCM tìm ở đâu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bạn có thể lọc các bãi giữ xe mở cửa 24/7 trên MapGo.vn hoặc xem danh mục bãi giữ xe qua đêm để tìm vị trí có bảo vệ an toàn."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
        <AuthProvider>
          <LocaleProvider>
            <UserRetentionProvider>
              <ServiceWorkerRegister />
              {children}
            </UserRetentionProvider>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
