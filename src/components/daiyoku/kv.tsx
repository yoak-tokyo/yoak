"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { kv } from "@/content/site";
import { useIntroStart } from "../opening";
import { Blob, Burst, Flower, Marquee, POP, PopText, SpinBadge, Squiggle } from "./parts";


// マウスの位置に合わせて、奥行きごとに少しずつずれる
function useParallax(sx: ReturnType<typeof useSpring>, sy: ReturnType<typeof useSpring>, depth: number) {
  return {
    x: useTransform(sx, (v) => v * depth),
    y: useTransform(sy, (v) => v * depth),
  };
}

export function DyKv() {
  const START = useIntroStart();
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });
  const far = useParallax(sx, sy, -18);
  const mid = useParallax(sx, sy, 34);
  const near = useParallax(sx, sy, 64);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const glyphRotate = useTransform(scrollYProgress, [0, 1], [-6, 18]);
  const glyphScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative h-svh min-h-[640px] overflow-hidden bg-cream text-ink"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      {/* 画面いっぱいの「欲」。多色のグラデーションがうねり続ける */}
      <motion.div
        className="pointer-events-none absolute -top-[4vh] -right-[10vw] select-none md:-right-[4vw]"
        style={{ ...far, rotate: glyphRotate, scale: glyphScale }}
        aria-hidden="true"
      >
        <motion.span
          className="dy-mesh-text block font-display text-[min(98vh,110vw)] leading-none"
          initial={{ opacity: 0, scale: 0.4, rotate: -40 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 16, delay: START }}
        >
          欲
        </motion.span>
      </motion.div>

      {/* 散らばる図形 */}
      <motion.div className="pointer-events-none absolute inset-0" style={mid} aria-hidden="true">
        <motion.div
          className="absolute top-[16%] left-[6%]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...POP, delay: START + 0.3 }}
        >
          <Burst fill="var(--color-acid)" className="dy-spin size-24 md:size-36" />
        </motion.div>
        <motion.div
          className="absolute top-[58%] right-[8%] md:top-[62%] md:right-[38%]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...POP, delay: START + 0.45 }}
        >
          <Flower fill="var(--color-hot)" className="dy-float size-20 md:size-28" />
        </motion.div>
      </motion.div>
      <motion.div className="pointer-events-none absolute inset-0" style={near} aria-hidden="true">
        <motion.div
          className="absolute top-[30%] left-[42%] hidden md:block"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: -12 }}
          transition={{ ...POP, delay: START + 0.55 }}
        >
          <Squiggle stroke="var(--color-volt)" className="w-40" />
        </motion.div>
        <motion.div
          className="absolute top-[12%] right-[30%] hidden md:block"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...POP, delay: START + 0.6 }}
        >
          <Blob fill="var(--color-tang)" className="dy-float size-16" />
        </motion.div>
      </motion.div>

      {/* 回るバッジ（読み方） */}
      <motion.div
        className="absolute top-24 right-4 md:top-28 md:right-10"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...POP, delay: START + 0.8 }}
      >
        <SpinBadge
          text="YOAK ✺ 欲 YOKU ✺ WANT IT ✺ MAKE IT ✺ "
          className="size-24 md:size-32"
          fill="var(--color-acid)"
        >
          <span className="font-display text-2xl md:text-3xl">欲</span>
        </SpinBadge>
        <span className="sr-only">{kv.reading}</span>
      </motion.div>

      {/* キャッチ */}
      <motion.div
        className="relative flex h-full flex-col justify-end px-5 pb-32 md:px-10 md:pb-40"
        style={{ y: contentY }}
      >
        <h1 className="font-display text-[clamp(3.25rem,10.5vw,10rem)] leading-[1.02] tracking-[-0.01em]">
          <span className="block">
            <PopText text={kv.catch[0]} onMount delay={START + 0.1} />
          </span>
          <motion.span
            className="mt-2 inline-block origin-left border-[3px] border-ink bg-hot px-[0.12em] pb-[0.06em] shadow-[8px_8px_0_var(--color-ink)] md:shadow-[12px_12px_0_var(--color-ink)]"
            initial={{ scaleX: 0, rotate: 0 }}
            animate={{ scaleX: 1, rotate: -2 }}
            transition={{ ...POP, delay: START + 0.35 }}
          >
            <PopText text={kv.catch[1]} onMount delay={START + 0.5} />
          </motion.span>
        </h1>

        <motion.p
          className="mt-8 inline-block self-start border-2 border-ink bg-acid px-4 py-2 font-display text-sm md:mt-10 md:text-base"
          initial={{ opacity: 0, y: 30, rotate: 8 }}
          animate={{ opacity: 1, y: 0, rotate: 2 }}
          transition={{ ...POP, delay: START + 0.9 }}
        >
          {kv.sub}
        </motion.p>
      </motion.div>

      {/* 下端の帯 */}
      <div className="absolute inset-x-[-6%] bottom-8 -rotate-2 border-y-[3px] border-ink bg-ink py-3 text-acid md:bottom-10">
        <Marquee
          items={["欲から、はじめる。", "START WANT.", "STAY CURIOUS.", "WANT IT. MAKE IT."]}
          className="font-display text-lg md:text-2xl"
          speed={28}
        />
      </div>
    </section>
  );
}
