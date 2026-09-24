import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubpageFooter, SubpageHeader } from "@/components/subpage-header";
import { findNews, getNews } from "@/lib/cms";

// 静的書き出しのため、ビルド時に存在する記事だけを生成する（全記事がページを持つ）
export const dynamicParams = false;

// 関連リンクの表示名（ドメイン名）。URL として読めなければそのまま出す
function linkLabel(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}

export function generateStaticParams() {
  const items = getNews();
  // 記事が1件もないと静的書き出しがエラーになるため、ダミーを1件返す（中身は 404）
  return items.length > 0 ? items.map((item) => ({ slug: item.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = findNews((await params).slug);
  if (!item) return {};
  return { title: `${item.title} | Yoak, LLC.` };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const item = findNews((await params).slug);
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
          {item.html && <div className="cms-body mt-14" dangerouslySetInnerHTML={{ __html: item.html }} />}

          {item.link && (
            <p className="mt-12">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group label inline-flex items-center gap-2 border-b border-ink pb-1 text-ink transition-opacity hover:opacity-60"
              >
                {linkLabel(item.link)}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  ↗
                </span>
              </a>
            </p>
          )}

          <div className="mt-16">
            <Link
              href="/#news"
              className="group label inline-flex items-center gap-2 text-mute transition-colors hover:text-ink"
            >
              <span
                aria-hidden="true"
                className="transition-transform duration-500 ease-out-expo group-hover:-translate-x-1"
              >
                ←
              </span>
              back to news
            </Link>
          </div>
        </article>
      </main>
      <SubpageFooter />
    </>
  );
}
