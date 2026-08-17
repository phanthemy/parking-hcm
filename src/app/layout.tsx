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
    default: "MapGo.vn – Tìm bãi đỗ xe, quán ăn, WC gần bạn | TP.HCM",
    template: "%s | MapGo.vn",
  },
  description: "Tìm bãi đỗ xe ô tô gần đây, quán ăn có chỗ đậu xe, quán cafe có bãi xe, nhà vệ sinh công cộng tại TP.HCM. Bản đồ GPS real-time miễn phí.",
  keywords: [
    // Head terms — nhắm dài hạn
    "tìm bãi đỗ xe",
    "bãi đỗ xe gần đây",
    "bãi giữ xe TP.HCM",
    "bãi đỗ xe ô tô",
    // Long-tail — dễ rank, ưu tiên
    "quán ăn có chỗ đậu ô tô Quận 1",
    "quán ăn có bãi đỗ xe TP.HCM",
    "quán cafe có bãi xe ô tô Phú Nhuận",
    "nhà vệ sinh công cộng gần Bến Thành",
    "nhà vệ sinh gần đây TP.HCM",
    "bãi đỗ xe Quận 1",
    "bãi đỗ xe Quận 7",
    "bãi đỗ xe TP Thủ Đức",
    "chỉ đường bãi xe GPS",
    "bản đồ tiện ích Sài Gòn"
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
    title: "MapGo.vn - Tìm bãi đỗ xe quanh đây, Quán ăn, Café có chỗ đỗ xe & WC công cộng",
    description: "Bản đồ tìm bãi đỗ xe ô tô xe máy quanh đây, quán ăn có bãi đỗ xe, quán cafe, nhà vệ sinh gần nhất tại TP.HCM. Chỉ đường GPS real-time miễn phí!",
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
    title: "MapGo.vn - Tìm bãi đỗ xe quanh đây & Tiện ích gần bạn",
    description: "Tìm bãi đỗ xe quanh đây, quán ăn có bãi đỗ xe, quán cafe có chỗ đỗ xe, nhà vệ sinh gần đây tại TP.HCM. Chỉ đường GPS miễn phí!",
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
