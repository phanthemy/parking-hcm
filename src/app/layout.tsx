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
  title: "MapGo.vn - Bản đồ tiện ích quanh bạn",
  description: "Tìm bãi đỗ xe, quán ăn, nhà hàng, nhà vệ sinh, café & tiện ích gần bạn tại TP.HCM. Chỉ đường, dẫn đường GPS real-time. Miễn phí!",
  keywords: "bãi xe, quán ăn, nhà vệ sinh, café, tiện ích, bản đồ, TP.HCM, Sài Gòn, gửi xe, chỉ đường, mapgo",
  openGraph: {
    title: "MapGo.vn - Bản đồ tiện ích quanh bạn",
    description: "Tìm bãi đỗ xe, quán ăn, WC, café gần bạn. Chỉ đường & dẫn đường GPS ngay trên web!",
    url: "https://mapgo.vn",
    siteName: "MapGo.vn",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
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
