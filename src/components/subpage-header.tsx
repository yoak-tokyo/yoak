import Link from "next/link";
import { YoakLogo } from "./logos";

// トップページの Header はハッシュリンク前提・Opening アニメーション前提のため、
// サブページ用に最小限のシンプルなヘッダー／フッターをここで用意する。
export function SubpageHeader({ inverted = false }: { inverted?: boolean }) {
  return (
    <header
      className={`border-b px-5 py-5 md:px-10 md:py-7 ${
        inverted ? "border-line-inv" : "border-line"
      }`}
    >
      <Link href="/" aria-label="Yoak トップへ" className="inline-block">
        <YoakLogo className={`h-[18px] w-auto md:h-5 ${inverted ? "text-white" : "text-ink"}`} />
      </Link>
    </header>
  );
}

export function SubpageFooter() {
  return (
    <footer className="border-t border-line px-5 py-8 md:px-10">
      <p className="font-en text-xs tracking-[0.08em] text-mute">© 2025 Yoak, LLC.</p>
    </footer>
  );
}
