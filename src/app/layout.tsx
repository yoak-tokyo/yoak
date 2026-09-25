import type { Metadata } from "next";
import { Dela_Gothic_One, Inter_Tight, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  // 600 以上は大欲モードの見出し用
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-inter-tight",
});

const notoSansJP = Noto_Sans_JP({
  // 900 は大欲モードの見出し用
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
  preload: false,
});

// スーパー大欲モードの見出し用（和欧とも極太のディスプレイ書体）
const delaGothic = Dela_Gothic_One({
  weight: "400",
  variable: "--font-dela",
  preload: false,
});

const title = "Yoak, LLC.";
const description =
  "Yoak（ヨーク）は「欲」から名付けた会社です。自分たちが心から欲しいものを、事業としてかたちにしていきます。";

export const metadata: Metadata = {
  metadataBase: new URL("https://yoak.tokyo"),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: title,
    url: "/",
    type: "website",
    images: ["/og.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${interTight.variable} ${notoSansJP.variable} ${delaGothic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
