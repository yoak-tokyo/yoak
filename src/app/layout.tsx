import type { Metadata } from "next";
import { Inter_Tight, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-inter-tight",
});

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
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
    <html lang="ja" className={`${interTight.variable} ${notoSansJP.variable}`}>
      <body>{children}</body>
    </html>
  );
}
