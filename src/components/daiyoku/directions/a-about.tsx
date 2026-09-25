"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { about } from "@/content/site";

const EASE = [0.16, 1, 0.3, 1] as const;

// 見出しの 1 文字。スクロールに合わせてグレーから白へ塗られる
function RevealChar({
  ch,
  progress,
  range,
}: {
  ch: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const color = useTransform(progress, range, ["rgba(255,255,255,0.22)", "rgba(255,255,255,1)"]);
  return (
    <motion.span className="inline-block" style={{ color }}>
      {ch}
    </motion.span>
  );
}

// 本文の 1 行。スクロールに合わせて薄字から濃い字へ
function RevealLine({
  children,
  progress,
  range,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.28, 1]);
  return (
    <motion.span className="block" style={{ opacity }}>
      {children}
    </motion.span>
  );
}

// 本文中の「欲」だけを蛍光グリーンにする
function highlightYoku(text: string) {
  return text.split(/(欲)/).map((part, i) =>
    part === "欲" ? (
      <span key={i} className="text-acid">
        欲
      </span>
    ) : (
      part
    ),
  );
}

export function DirectionAAbout() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.15"] });

  // 見出しの文字数ぶんだけ、しきい値をずらして順番に塗る
  let counter = 0;
  const headingLines = about.heading.map((line) =>
    [...line].map((ch) => ({ ch, index: counter++ })),
  );
  const total = Math.max(counter, 1);
  const headingSpan = 0.85; // 残りの余白は句読点の余韻として残す

  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: bodyProgress } = useScroll({
    target: bodyRef,
    offset: ["start 0.9", "end 0.55"],
  });
  const lines = about.body.flatMap((p, pi) => p.map((text, li) => ({ text, pi, last: li === p.length - 1 })));
  const step = 1 / lines.length;

  const { scrollYProgress: glyphProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glyphY = useTransform(glyphProgress, [0, 1], ["-6%", "10%"]);

  return (
    <section id="about" ref={ref} className="relative overflow-hidden bg-ink py-28 text-white md:py-40">
      {/* 背景に薄く沈む「欲」。動きは控えめに */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[6vw] -right-[6vw] -z-0 hidden text-[42vw] leading-none font-black text-transparent select-none md:block"
        style={{
          y: glyphY,
          WebkitTextFillColor: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,0.06)",
        }}
      >
        欲
      </motion.span>

      <div className="relative mx-auto max-w-[1320px] px-5 md:px-10">
        <motion.div
          className="label text-white/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {about.label}
        </motion.div>

        <h2 className="mt-8 text-[clamp(2.1rem,7.4vw,5.75rem)] leading-[1.28] font-black tracking-tight">
          {headingLines.map((chars, li) => (
            <span key={li} className="block">
              {chars.map(({ ch, index }) => (
                <RevealChar
                  key={index}
                  ch={ch}
                  progress={scrollYProgress}
                  range={[(index / total) * headingSpan, ((index + 1) / total) * headingSpan + 0.02]}
                />
              ))}
            </span>
          ))}
        </h2>

        <div ref={bodyRef} className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-1" />
          <p className="text-[15px] leading-[2.3] text-white/70 md:col-span-7 md:text-[17px]">
            {lines.map((line, i) => (
              <RevealLine key={i} progress={bodyProgress} range={[i * step, (i + 1) * step]}>
                {highlightYoku(line.text)}
                {line.last && i !== lines.length - 1 && <span className="block h-[1.2em]" />}
              </RevealLine>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
