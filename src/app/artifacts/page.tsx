import type { Metadata } from "next";
import { ArtifactsApp } from "@/components/artifacts/artifacts-app";

// 社内向け（Cloudflare Access で保護）。サイトのヘッダー・フッターからはリンクしない
export const metadata: Metadata = {
  title: "アーティファクト一覧 | Yoak, LLC.",
  robots: { index: false, follow: false },
};

export default function ArtifactsPage() {
  return <ArtifactsApp />;
}
