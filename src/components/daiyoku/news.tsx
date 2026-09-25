"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { news, type NewsItem } from "@/content/site";
import { DyLabel, EASE, Marquee } from "./parts";

// カテゴリごとのチップの色
const CATEGORY: Record<string, string> = {
  company: "bg-volt text-cream",
  service: "bg-tang text-ink",
  event: "bg-hot text-ink",
};

export function DyNews({ items }: { items: NewsItem[] }) {
  return (
    <section id="news" className="relative overflow-hidden bg-ink pb-32 text-cream md:pb-44">
      <div className="py-8">
        <Marquee
          items={["NEWS", news.heading, "欲の近況"]}
          className="dy-outline-acid font-display text-[18vw] leading-none md:text-[12vw]"
          speed={45}
        />
      </div>

      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <DyLabel className="text-acid">{news.label}</DyLabel>

        <ul className="mt-12 border-b-2 border-cream/15">
          {items.map((item, i) => (
            <motion.li
              key={item.slug}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "0px 0px -5% 0px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.07 }}
              className="border-t-2 border-cream/15"
            >
              <Link
                href={`/news/${item.slug}`}
                className="group -mx-3 grid items-center gap-3 rounded-2xl px-3 py-6 transition-colors duration-300 hover:bg-acid hover:text-ink md:-mx-5 md:grid-cols-[8rem_8rem_1fr_auto] md:gap-6 md:px-5 md:py-7"
              >
                <time className="font-display text-sm">{item.date}</time>
                <span
                  className={`justify-self-start rounded-full border-2 border-ink px-3 py-0.5 font-display text-[11px] ${
                    CATEGORY[item.category] ?? "bg-grape text-ink"
                  }`}
                >
                  {item.category}
                </span>
                <span className="text-base leading-[1.8] font-bold md:text-lg">{item.title}</span>
                <span
                  aria-hidden="true"
                  className="hidden size-11 place-items-center rounded-full border-2 border-current font-display transition-transform duration-300 group-hover:-rotate-45 md:grid"
                >
                  →
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
