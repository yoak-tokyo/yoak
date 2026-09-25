"use client";

import { motion } from "motion/react";
import { service, type ServiceItem } from "@/content/site";
import { NightBrewLogo } from "../logos";
import { DyLabel, POP, PopText, SpinBadge } from "./parts";

// 事業ごとのポスターの色と傾き
const POSTERS = [
  { bg: "bg-hot", ink: "text-ink", rotate: -2.5 },
  { bg: "bg-volt", ink: "text-cream", rotate: 1.8 },
  { bg: "bg-tang", ink: "text-ink", rotate: -1.2 },
];

const STATUS: Record<string, { fill: string; ink: string; mark: string }> = {
  "now available": { fill: "var(--color-acid)", ink: "var(--color-ink)", mark: "ON" },
  "in development": { fill: "var(--color-cream)", ink: "var(--color-ink)", mark: "WIP" },
};

function Visual({ item }: { item: ServiceItem }) {
  if (item.image) {
    // ふだんはポスターの色に染まったダブルトーン、ホバーで本来の色が戻る
    return (
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-multiply grayscale transition-[filter] duration-500 group-hover:grayscale-0"
        style={{ backgroundImage: `url(${item.image})` }}
      />
    );
  }
  const isNext = item.name === "Next";
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden">
      <span
        className={`font-display leading-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 ${
          isNext ? "dy-outline text-[10rem] md:text-[12rem]" : "text-center text-4xl md:text-5xl"
        }`}
        style={isNext ? ({ "--dy-stroke": "3px" } as React.CSSProperties) : undefined}
      >
        {isNext ? "?" : item.name}
      </span>
    </div>
  );
}

export function DyService() {
  return (
    <section id="service" className="relative overflow-hidden bg-cream py-32 text-ink md:py-44">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <DyLabel>{service.label}</DyLabel>
        <h2 className="mt-8 font-display text-[clamp(2.2rem,6vw,5.5rem)] leading-[1.15]">
          <PopText text={service.heading} />
        </h2>
        <p className="mt-6 max-w-xl text-[15px] leading-[2] font-medium md:text-base">{service.lead}</p>

        <ul className="mt-20 grid gap-14 md:mt-28 md:grid-cols-3 md:gap-8">
          {service.items.map((item, i) => {
            const poster = POSTERS[i % POSTERS.length];
            const status = STATUS[item.status];
            return (
              <motion.li
                key={item.no}
                initial={{ opacity: 0, y: 120, rotate: poster.rotate * 4 }}
                whileInView={{ opacity: 1, y: 0, rotate: poster.rotate }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ ...POP, delay: i * 0.12 }}
                className="relative"
              >
                <article
                  className={`group relative flex h-full flex-col border-[3px] border-ink ${poster.bg} ${poster.ink} shadow-[8px_8px_0_var(--color-ink)] transition-[translate,box-shadow] duration-300 hover:-translate-y-2 hover:shadow-[14px_14px_0_var(--color-ink)]`}
                >
                  {/* ステータスのバッジ */}
                  <div className="absolute -top-8 -right-6 z-10">
                    <SpinBadge
                      text={`${item.status.toUpperCase()} ✺ ${item.status.toUpperCase()} ✺ `}
                      className="size-24"
                      fill={status?.fill ?? "var(--color-grape)"}
                      ink={status?.ink ?? "var(--color-ink)"}
                      speed={12}
                    >
                      <span className="font-display text-sm">{status?.mark ?? "SOON"}</span>
                    </SpinBadge>
                    <span className="sr-only">{item.status}</span>
                  </div>

                  <div className={`relative aspect-[4/3] overflow-hidden border-b-[3px] border-ink ${poster.bg}`}>
                    <Visual item={item} />
                    <span className="absolute top-3 left-3 rounded-full border-2 border-ink bg-cream px-3 py-0.5 font-display text-xs text-ink">
                      {item.no}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    {item.logo === "nightbrew" ? (
                      <h3>
                        <span className="sr-only">{item.name}</span>
                        <NightBrewLogo className="h-9 w-auto md:h-10" />
                      </h3>
                    ) : (
                      <h3 className="font-display text-3xl leading-tight md:text-[2.1rem]">{item.name}</h3>
                    )}
                    <p className="mt-2 text-xs font-bold tracking-[0.08em] opacity-80">{item.category}</p>

                    {/* we want は吹き出しに */}
                    <div className="relative mt-6 rounded-2xl border-2 border-ink bg-cream px-4 py-3 text-ink">
                      <p className="font-display text-[10px] tracking-[0.12em]">WE WANT</p>
                      <p className="mt-1 text-[15px] leading-[1.7] font-bold">{item.yoku}</p>
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-[9px] left-8 size-4 rotate-45 border-r-2 border-b-2 border-ink bg-cream"
                      />
                    </div>

                    <p className="mt-6 text-sm leading-[2] font-medium">{item.description}</p>

                    {item.link && (
                      <div className="mt-auto pt-8">
                        <a
                          href={item.link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-5 py-2.5 font-display text-xs text-cream transition-colors duration-300 hover:bg-acid hover:text-ink"
                        >
                          {item.link.label}
                          <span aria-hidden="true">↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
