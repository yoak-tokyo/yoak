import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubpageFooter, SubpageHeader } from "@/components/subpage-header";
import { getNewsWithBody } from "@/lib/cms";

// 静的書き出しのため、ビルド時に存在する記事だけを生成する
export const dynamicParams = false;

export function generateStaticParams() {
  const items = getNewsWithBody();
  // 本文つきの記事が1件もないと静的書き出しがエラーになるため、ダミーを1件返す（中身は 404）
  return items.length > 0 ? items.map((item) => ({ slug: item.slug })) : [{ slug: "_" }];
}

const findItem = (slug: string) => getNewsWithBody().find((item) => item.slug === slug);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = findItem((await params).slug);
  if (!item) return {};
  return { title: `${item.title} | Yoak, LLC.` };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const item = findItem((await params).slug);
  if (!item) notFound();

  return (
    <>
      <SubpageHeader />
      <main className="px-5 py-24 md:px-10 md:py-32">
        <article className="mx-auto max-w-[720px]">
          <p className="label text-mute">news</p>
          <div className="mt-6 flex items-baseline gap-6 text-mute">
            <time className="font-en text-sm tracking-[0.06em]">{item.date}</time>
            <span className="label">{item.category}</span>
          </div>
          <h1 className="mt-4 text-2xl leading-[1.6] font-medium tracking-tight md:text-3xl">
            {item.title}
          </h1>

          {/* 本文は Notion からビルド時に生成した HTML（scripts/fetch-cms.mjs でエスケープ済み） */}
          <div className="cms-body mt-14" dangerouslySetInnerHTML={{ __html: item.html }} />

          <div className="mt-20 border-t border-line pt-8">
            <Link href="/#news" className="label text-mute transition-colors hover:text-ink">
              back to news
            </Link>
          </div>
        </article>
      </main>
      <SubpageFooter />
    </>
  );
}
