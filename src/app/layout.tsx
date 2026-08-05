import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ParkingHCM - Tìm bãi xe TP.HCM",
  description: "Tìm bãi xe, quán ăn, café gần bạn tại TP. Hồ Chí Minh. Giá rẻ, tiện lợi, đánh giá từ cộng đồng.",
  keywords: "bãi xe, parking, TP.HCM, Sài Gòn, gửi xe, tìm bãi xe",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
