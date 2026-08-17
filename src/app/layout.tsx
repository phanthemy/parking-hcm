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
    default: "Bãi đỗ xe TP.HCM – Tìm bãi giữ xe ô tô, quán ăn, WC gần đây | MapGo.vn",
    template: "%s | MapGo.vn",
  },
  description: "Bãi đỗ xe TP.HCM ❱ Tìm nhanh 408+ bãi giữ xe ô tô xe máy gần đây, quán ăn có chỗ đậu xe, quán cafe có bãi xe, nhà vệ sinh công cộng. Bản đồ GPS miễn phí 24/7.",
  keywords: [
    // Head terms — ưu tiên rank cao nhất
    "bãi đỗ xe",
    "bãi đỗ xe TP.HCM",
    "bãi đỗ xe gần đây",
    "bãi đỗ xe ô tô",
    "bãi giữ xe ô tô",
    "bãi giữ xe TP.HCM",
    "tìm bãi đỗ xe",
    "chỗ đậu xe ô tô",
    "bãi đỗ xe ô tô gần đây",
    "parking TPHCM",
    // Long-tail — dễ rank
    "quán ăn có chỗ đậu ô tô Quận 1",
    "quán ăn có bãi đỗ xe TP.HCM",
    "quán cafe có bãi xe ô tô Phú Nhuận",
    "nhà vệ sinh công cộng gần Bến Thành",
    "nhà vệ sinh gần đây TP.HCM",
    "bãi đỗ xe Quận 1",
    "bãi đỗ xe Quận 7",
    "bãi đỗ xe TP Thủ Đức",
    "bãi giữ xe ô tô qua đêm",
    "giá gửi xe ô tô TP.HCM",
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
    title: "Bãi đỗ xe TP.HCM – Tìm bãi giữ xe ô tô, quán ăn có bãi xe, WC gần đây | MapGo.vn",
    description: "Bãi đỗ xe TP.HCM ❱ Tìm nhanh 408+ bãi giữ xe ô tô xe máy gần đây, quán ăn có chỗ đậu xe, quán cafe có bãi xe, nhà vệ sinh công cộng. Bản đồ GPS miễn phí 24/7.",
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
    title: "Bãi đỗ xe TP.HCM – Tìm bãi giữ xe ô tô gần đây | MapGo.vn",
    description: "Bãi đỗ xe TP.HCM ❱ 408+ bãi giữ xe ô tô xe máy, quán ăn có chỗ đậu xe, quán cafe có bãi xe, WC công cộng. Bản đồ GPS miễn phí!",
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
