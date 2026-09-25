"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { about, kv } from "@/content/site";
import { EASE_OUT, GridRules, HRule, MarkYoku } from "./c-parts";

// 背景の縦罫はごく薄く、段落の区切りは黒の罫で締める
const FAINT = "bg-[rgb(17_17_17/0.08)]";
const RULE_STRONG = "bg-ink";

// 段落の注記（左の欄）
const NOTES = ["Origin", "Taboo", "Speed", "Stance", "Statement"];

// 見出しの各行を置くカラム（スマホ 4 列 / PC 12 列）。行ごとに右へずらす
const HEADING_COLS = [
  "col-start-1 md:col-start-1",
  "col-start-1 md:col-start-3",
  "col-start-2 md:col-start-5",
];

// スクロールで横に流れる帯（1 本だけ）
function Band() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-2%", "-34%"]);
  const unit = [kv.catch.join(""), kv.sub];

  return (
    <div ref={ref} className="relative overflow-hidden bg-ink text-paper">
      <div className="mx-5 flex h-10 items-center justify-between border-b border-line-inv font-en text-[10px] font-medium tracking-[0.12em] text-white/50 uppercase md:mx-10 md:h-12 md:text-[11px]">
        <span className="pl-2.5">Fig. 02 — Chaos</span>
        <span className="pr-2.5 tabular-nums">→</span>
      </div>
      <motion.p
        aria-hidden="true"
        className="flex py-5 text-[19vw] leading-none whitespace-nowrap select-none md:py-8 md:text-[12.5vw]"
        style={{ x }}
      >
        {[0, 1, 2].map((r) =>
          unit.map((t, i) => (
            <span key={`${r}-${i}`} className="flex items-center">
              <span
                className={
                  i === 0
                    ? "font-sans font-black tracking-[-0.04em]"
                    : "font-en font-extrabold tracking-[-0.045em]"
                }
              >
                {t}
              </span>
              <span className="mx-[0.3em] h-[0.06em] w-[0.6em] bg-white/35" />
            </span>
          )),
        )}
      </motion.p>
      <div className="mx-5 h-10 border-t border-line-inv md:mx-10 md:h-12" />
    </div>
  );
}

export function AboutC() {
  const last = about.body.length - 1;

  return (
    <section id="about" className="relative overflow-hidden bg-paper text-ink">
      <GridRules inView className={FAINT} />

      {/* 罫：セクション番号 */}
      <div className="relative">
        <div className="relative mx-5 grid h-12 grid-cols-4 items-center font-en text-[10px] font-medium tracking-[0.12em] uppercase md:mx-10 md:h-14 md:grid-cols-12 md:text-[11px]">
          <span className="pl-2.5 tabular-nums">02</span>
          <span className="pl-2.5">{about.label}</span>
          <span className="col-start-4 justify-self-end pr-2.5 text-mute md:col-span-2 md:col-start-11">
            Order / Chaos
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <HRule inView className={RULE_STRONG} />
        </div>
      </div>

      {/* 見出し：行ごとにカラムをずらし、マスクから上げる */}
      <h2 className="relative mx-5 grid grid-cols-4 pt-20 pb-24 text-[clamp(2.25rem,10.4vw,3.25rem)] leading-[1.12] font-black tracking-[-0.035em] md:mx-10 md:grid-cols-12 md:pt-36 md:pb-40 md:text-[clamp(3rem,6.6vw,7rem)]">
        {about.heading.map((line, i) => (
          <span
            key={line}
            className={`${HEADING_COLS[i]} col-end-[-1] flex items-start gap-3 pl-2.5 md:gap-5`}
          >
            <span className="hidden pt-[0.5em] font-en text-[11px] font-medium tracking-[0.12em] text-mute tabular-nums md:block">
              {String.fromCharCode(97 + i)}.
            </span>
            <span className="block overflow-hidden pb-[0.08em] whitespace-nowrap">
              <motion.span
                className="block"
                initial={{ y: "108%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 1.1, ease: EASE_OUT, delay: i * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          </span>
        ))}
      </h2>

      {/* 本文：左に段落番号と注記、右に本文 */}
      <div className="relative pb-24 md:pb-40">
        {about.body.map((para, pi) => {
          const isLast = pi === last;
          return (
            <div key={pi} className="relative">
              <div className="absolute inset-x-5 top-0 md:inset-x-10">
                <HRule inView delay={0.05} className={RULE_STRONG} />
              </div>
              <motion.div
                className="mx-5 grid grid-cols-4 gap-y-4 pt-4 pb-12 md:mx-10 md:grid-cols-12 md:pt-5 md:pb-20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                transition={{ duration: 0.9, ease: EASE_OUT }}
              >
                <div className="col-span-4 flex gap-4 pl-2.5 font-en text-[11px] font-medium tracking-[0.12em] uppercase md:col-span-3 md:flex-col md:gap-1.5">
                  <span className="tabular-nums">{String(pi + 1).padStart(2, "0")}</span>
                  <span className="text-mute">{NOTES[pi]}</span>
                </div>
                <p
                  className={
                    isLast
                      ? "col-span-4 pl-2.5 text-[clamp(1.5rem,6.4vw,2rem)] leading-[1.45] font-black tracking-[-0.02em] md:col-span-9 md:col-start-4 md:text-[clamp(2rem,3.4vw,3.25rem)] md:leading-[1.35] lg:col-span-8 lg:col-start-5"
                      : "col-span-4 pl-2.5 text-[15px] leading-[2.1] font-medium tracking-[0.02em] md:col-span-9 md:col-start-4 md:leading-[2.25] lg:col-span-8 lg:col-start-5 lg:text-base xl:col-span-6 xl:text-[17px]"
                  }
                >
                  {para.map((line, li) => (
                    <span key={li} className="md:block">
                      <MarkYoku text={line} delay={0.35 + li * 0.1} />
                    </span>
                  ))}
                </p>
              </motion.div>
            </div>
          );
        })}
      </div>

      <Band />
    </section>
  );
}
