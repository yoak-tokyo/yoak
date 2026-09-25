"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { kv } from "@/content/site";
import { useReducedMotionPref } from "./a-shared";

const EASE = [0.16, 1, 0.3, 1] as const;

// 背景に流れ続ける文字の帯（KV の下地）。CSS アニメーションで動かし、
// スクロール速度だけを上の階層の skewX で反映する（transform の競合を避けるため層を分ける）
function TypeBand({
  text,
  duration,
  reverse,
  skew,
  className,
}: {
  text: string;
  duration: number;
  reverse?: boolean;
  skew: MotionValue<number>;
  className?: string;
}) {
  return (
    <motion.div className="w-full overflow-hidden" style={{ skewX: skew }}>
      <div
        className={`flex w-max ${className ?? ""}`}
        style={{
          animation: `dyk-a-scroll ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[0, 1].map((i) => (
          <span key={i} className="dyk-a-band-item shrink-0 pr-[4vw] whitespace-nowrap">
            {text}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function DirectionAKv() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionPref();

  // セクション内スクロールで、行ごとに伸び縮みさせる
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scaleTop = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.55]);
  const scaleBottom = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 0.72]);
  const bandY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-10%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // ページ全体のスクロール速度 → 背景の帯を少しだけ傾ける（せん断）。マウス・タッチ問わず反応するが、reduced-motion では止める
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 300 });
  const skewRaw = useTransform(smoothVelocity, [-2500, 0, 2500], [-7, 0, 7], { clamp: true });
  const skewZero = useMotionValue(0);
  const skew = reduced ? skewZero : skewRaw;

  const secondLine = kv.catch[1].replace(/。$/, "");

  return (
    <section
      id="top"
      ref={ref}
      className="relative h-svh min-h-[600px] overflow-hidden bg-ink text-white"
    >
      {/* 背景の帯：欲 / WANT が異なる速度で流れる */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col justify-between py-[6%] select-none"
        style={{ y: bandY }}
      >
        <TypeBand
          text="WANT　WANT　WANT　WANT　WANT　"
          duration={30}
          skew={skew}
          className="font-en text-[13vw] leading-none font-extrabold text-white/[0.06]"
        />
        <TypeBand
          text="欲　欲　欲　欲　欲　欲　"
          duration={42}
          reverse
          skew={skew}
          className="text-[14vw] leading-none font-black text-white/[0.07]"
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

      <motion.p
        className="label absolute top-10 right-5 text-white/50 md:top-14 md:right-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
      >
        {kv.reading}
      </motion.p>

      <motion.div
        className="relative flex h-full flex-col justify-center px-5 md:px-10"
        style={{ opacity: fade }}
      >
        <h1 className="font-black text-[clamp(3.2rem,13vw,10.5rem)] leading-[0.95] tracking-tight">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          >
            <motion.span className="block origin-top" style={{ scaleY: scaleTop }}>
              {kv.catch[0]}
            </motion.span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.28 }}
          >
            <motion.span className="block origin-bottom" style={{ scaleY: scaleBottom }}>
              {secondLine}
              <span className="text-acid">。</span>
              <span
                aria-hidden="true"
                className="dyk-a-cursor ml-2 inline-block h-[0.6em] w-[0.09em] translate-y-[0.06em] bg-acid align-middle"
              />
            </motion.span>
          </motion.div>
        </h1>

        <motion.p
          className="mt-6 max-w-sm font-en text-sm tracking-[0.08em] text-white/60 italic md:mt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.5 }}
        >
          {kv.sub}
        </motion.p>
      </motion.div>

      <a
        href="#about"
        className="group absolute right-5 bottom-8 flex flex-col items-center gap-3 text-white/60 md:right-10 md:bottom-12"
      >
        <span className="label [writing-mode:vertical-rl]">scroll</span>
        <span className="relative block h-16 w-px overflow-hidden bg-white/20">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-white"
            animate={reduced ? undefined : { y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
          />
        </span>
      </a>
    </section>
  );
}
