"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { news, type NewsItem } from "@/content/site";
import { Reveal, SectionLabel } from "./reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

function NewsRow({ item }: { item: NewsItem }) {
  const content = (
    <>
      <time className="font-en text-sm tracking-[0.06em] text-mute">{item.date}</time>
      <span className="label text-mute">{item.category}</span>
      <span className="text-[15px] leading-[1.9]">
        {item.title}
        <span
          aria-hidden="true"
          className="ml-2 inline-block text-mute transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </>
  );
  // 日付とカテゴリは中身の幅に合わせた固定幅にして、タイトルとの間を詰める
  const className = "grid gap-2 py-6 md:grid-cols-[5.5rem_5.5rem_1fr] md:items-baseline md:gap-6 md:py-7";

  // すべての記事がサイト内のページを持つ。
  // ホバー：淡い面が下からせり上がり、中身が少し右へ寄り、下辺に線が引かれる
  return (
    <Link href={`/news/${item.slug}`} className="group relative block">
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-bottom scale-y-0 bg-mist transition-transform duration-700 ease-out-expo group-hover:scale-y-100 group-focus-visible:scale-y-100"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ink transition-transform duration-700 ease-out-expo group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
      <span
        className={`relative ${className} transition-transform md:pr-4 duration-700 ease-out-expo md:group-hover:translate-x-4 md:group-focus-visible:translate-x-4`}
      >
        {content}
      </span>
    </Link>
  );
}

export function News({ items }: { items: NewsItem[] }) {
  return (
    <section id="news" className="bg-paper pb-32 md:pb-48">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <SectionLabel>{news.label}</SectionLabel>
          <Reveal as="h2" className="mt-8 font-en text-4xl font-medium tracking-tight md:text-5xl">
            {news.heading}
          </Reveal>
        </div>

        <ul className="md:col-span-8">
          {items.map((item, i) => (
            <motion.li
              key={item.slug}
              className="relative"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -5% 0px" }}
              transition={{ duration: 1, ease: EASE, delay: i * 0.06 }}
            >
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left bg-line"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: EASE, delay: i * 0.06 }}
              />
              <NewsRow item={item} />
            </motion.li>
          ))}
          <li aria-hidden="true" className="h-px bg-line" />
        </ul>
      </div>
    </section>
  );
}
