import type { Metadata } from "next";
import Link from "next/link";
import { SubpageHeader } from "@/components/subpage-header";

export const metadata: Metadata = {
  title: "404 | Yoak, LLC.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-ink text-white">
      <SubpageHeader inverted />
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <p className="font-en text-[22vw] font-medium leading-none tracking-tight md:text-[9rem]">
          404
        </p>
        <p className="mt-8 text-[15px] leading-[2.1] text-white/70">
          お探しのページは見つかりませんでした。
          <br />
          欲しいものは、ここにはなかったようです。
        </p>
        <Link
          href="/"
          className="label mt-10 inline-block border-b border-white/40 pb-1 text-white/80 transition-colors hover:border-white hover:text-white"
        >
          back to home
        </Link>
      </main>
    </div>
  );
}
