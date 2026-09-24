"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { service, type ServiceItem } from "@/content/site";
import { NightBrewLogo } from "./logos";
import { MaskLines, Reveal, SectionLabel } from "./reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

function Visual({ item }: { item: ServiceItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <motion.div
      ref={ref}
      className="relative aspect-[4/3] overflow-hidden bg-mist"
      initial={{ clipPath: "inset(12% 12% 12% 12%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 1.4, ease: EASE }}
    >
      {item.image ? (
        <motion.div
          className="absolute -inset-y-[10%] inset-x-0 bg-cover bg-center transition-transform duration-[1.4s] ease-out-expo group-hover:scale-105"
          style={{ backgroundImage: `url(${item.image})`, y }}
        />
      ) : (
        <Placeholder item={item} />
      )}
    </motion.div>
  );
}

// 画像がまだない事業は、事業名をタイポグラフィで見せる
function Placeholder({ item }: { item: ServiceItem }) {
  const isNext = item.name === "Next";
  return (
    <div
      className={`absolute inset-0 grid place-items-center ${isNext ? "bg-paper" : "bg-mist"}`}
      style={
        isNext
          ? {
              backgroundImage:
                "repeating-linear-gradient(135deg, rgb(17 17 17 / 0.06) 0 1px, transparent 1px 14px)",
            }
          : undefined
      }
    >
      <span className={`text-center font-medium ${isNext ? "font-en text-6xl tracking-tight italic md:text-7xl" : "text-3xl tracking-[0.12em] md:text-4xl"}`}>
        {isNext ? "Next?" : item.name}
      </span>
    </div>
  );
}

// ステータスの丸：公開中は電源が入った緑、開発中は電源の落ちたグレー
const STATUS_DOT: Record<string, string> = {
  "now available": "bg-emerald-500",
  "in development": "bg-ink/25",
};

export function Service() {
  return (
    <section id="service" className="bg-paper pb-32 md:pb-48">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="border-t border-line pt-16 md:pt-24">
          <SectionLabel>{service.label}</SectionLabel>
          <div className="mt-8 grid gap-6 md:grid-cols-12">
            <h2 className="text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.5] font-medium md:col-span-7">
              <MaskLines lines={[service.heading]} />
            </h2>
            <Reveal as="p" className="text-sm leading-[2.1] text-mute md:col-span-5 md:self-end" delay={0.2}>
              {service.lead}
            </Reveal>
          </div>
        </div>

        <ul className="mt-20 space-y-24 md:mt-28 md:space-y-36">
          {service.items.map((item, i) => (
            <li
              key={item.no}
              className={`group grid items-center gap-8 md:grid-cols-12 md:gap-12`}
            >
              <div className={`md:col-span-7 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                {item.link ? (
                  <a href={item.link.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.name} ${item.link.label}`}>
                    <Visual item={item} />
                  </a>
                ) : (
                  <Visual item={item} />
                )}
              </div>

              <div className={`md:col-span-5 ${i % 2 === 1 ? "md:order-1" : ""}`}>
                <Reveal className="flex items-center justify-between text-mute">
                  <span className="label">{item.no}</span>
                  <span className="label inline-flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${STATUS_DOT[item.status] ?? "border border-ink/40"}`} />
                    {item.status}
                  </span>
                </Reveal>
                <Reveal delay={0.05} className="mt-6">
                  {item.logo === "nightbrew" ? (
                    <h3>
                      <span className="sr-only">{item.name}</span>
                      <NightBrewLogo className="h-9 w-auto md:h-11" />
                    </h3>
                  ) : (
                    <h3 className="text-3xl font-medium tracking-[0.06em] md:text-[2.5rem]">
                      {item.name}
                    </h3>
                  )}
                  <p className="mt-3 text-xs tracking-[0.1em] text-mute">{item.category}</p>
                </Reveal>
                <Reveal delay={0.1} className="mt-8 border-l border-line pl-4">
                  <p className="label text-mute">we want</p>
                  <p className="mt-2 text-lg leading-[1.8] font-medium">{item.yoku}</p>
                </Reveal>
                <Reveal as="p" delay={0.15} className="mt-6 text-sm leading-[2.1] text-ink/80">
                  {item.description}
                </Reveal>
                {item.link && (
                  <Reveal delay={0.2} className="mt-8">
                    <a
                      href={item.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center gap-3 border-b border-ink pb-1 font-en text-sm tracking-[0.08em]"
                    >
                      {item.link.label}
                      <span className="inline-block transition-transform duration-500 ease-out-expo group-hover/link:translate-x-1 group-hover/link:-translate-y-1">
                        ↗
                      </span>
                    </a>
                  </Reveal>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
