"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { mission, values } from "@/content/site";
import { Burst, DyLabel, Flower, Marquee, POP, Squiggle } from "./parts";

// 1文字ずつ、スクロールに合わせて散らばった状態から整列する
function ScrollChar({ char, i, progress }: { char: string; i: number; progress: MotionValue<number> }) {
  const spread = ((i * 53) % 17) / 16 - 0.5;
  const y = useTransform(progress, [0, 1], [`${spread * 120}%`, "0%"]);
  const rotate = useTransform(progress, [0, 1], [spread * 60, 0]);
  const scale = useTransform(progress, [0, 1], [0.6 + Math.abs(spread), 1]);
  return (
    <motion.span aria-hidden="true" className="inline-block" style={{ y, rotate, scale }}>
      {char}
    </motion.span>
  );
}

const TILES = [
  { bg: "bg-volt", ink: "text-cream", rotate: -2, Deco: () => <Burst fill="var(--color-acid)" className="dy-spin size-24" /> },
  { bg: "bg-hot", ink: "text-ink", rotate: 1.5, Deco: () => <Flower fill="var(--color-acid)" className="dy-float size-20" /> },
  { bg: "bg-tang", ink: "text-ink", rotate: -1, Deco: () => <Squiggle stroke="var(--color-volt)" className="w-28" /> },
];

export function DyMission() {
  const statementRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: statementRef, offset: ["start end", "center 0.55"] });
  // 読点のあとで改行し、文字の通し番号を行をまたいで振る
  const lines = mission.statement.split(/(?<=、)/).reduce<{ text: string; start: number }[]>(
    (acc, text) => [...acc, { text, start: acc.reduce((n, l) => n + Array.from(l.text).length, 0) }],
    [],
  );

  return (
    <>
      <section id="mission" className="relative overflow-hidden bg-acid pt-32 text-ink md:pt-44">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <DyLabel>{mission.label}</DyLabel>
          <h2
            ref={statementRef}
            className="mt-10 font-display text-[clamp(3.6rem,14vw,13rem)] leading-[1.05] tracking-[-0.02em]"
          >
            <span className="sr-only">{mission.statement}</span>
            {lines.map((line) => (
              <span key={line.text} className="block">
                {Array.from(line.text).map((c, j) => (
                  <ScrollChar key={j} char={c} i={line.start + j} progress={scrollYProgress} />
                ))}
              </span>
            ))}
          </h2>
          <p className="mt-10 max-w-2xl text-lg leading-[1.9] font-bold md:text-2xl">{mission.body}</p>
        </div>

        <div className="mt-20 rotate-2 border-y-[3px] border-ink bg-ink py-4 text-acid md:mt-28">
          <Marquee items={[mission.en, "欲を、かたちに。"]} className="font-display text-3xl md:text-5xl" speed={24} reverse />
        </div>
        <div className="h-16 md:h-24" />
      </section>

      <section className="relative overflow-hidden bg-ink py-32 text-cream md:py-44">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <DyLabel className="text-acid">{values.label}</DyLabel>

          <ol className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-6">
            {values.items.map((v, i) => {
              const tile = TILES[i % TILES.length];
              return (
                <motion.li
                  key={v.no}
                  initial={{ opacity: 0, y: 140, rotate: tile.rotate * 5 }}
                  whileInView={{ opacity: 1, y: 0, rotate: tile.rotate }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ ...POP, delay: i * 0.12 }}
                  className={`relative flex min-h-[26rem] flex-col justify-between rounded-[2rem] border-[3px] border-cream/0 p-7 md:min-h-[32rem] md:p-8 ${tile.bg} ${tile.ink}`}
                >
                  <div className="absolute -top-8 -right-4">
                    <tile.Deco />
                  </div>
                  <span
                    className="dy-outline font-display text-[6.5rem] leading-none md:text-[8rem]"
                    style={{ "--dy-stroke": "3px" } as React.CSSProperties}
                  >
                    {v.no}
                  </span>
                  <div>
                    <p className="font-display text-[2rem] leading-[1.1] md:text-[2.4rem]">{v.en}</p>
                    <h3 className="mt-5 text-lg font-bold md:text-xl">{v.title}</h3>
                    <p className="mt-3 text-sm leading-[2] font-medium opacity-90">{v.body}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}
