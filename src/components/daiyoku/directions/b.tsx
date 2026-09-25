"use client";

import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { YoakLogo } from "@/components/logos";
import { about, kv } from "@/content/site";
import { GlyphCanvas, type GlyphTick } from "./b-glyph";

// 大欲モードの方向性 B「GLYPH」
// 「欲」の一文字を数千の網点で組み、引き寄せられ、散り、また集まる動きで見せる

const EASE = [0.16, 1, 0.3, 1] as const;
const clamp = (v: number) => Math.max(0, Math.min(1, v));

// 仕様書のような小さな英字ラベル
function Meta({ k, v, className = "" }: { k: string; v: React.ReactNode; className?: string }) {
  return (
    <div className={`font-en text-[10px] leading-[1.6] tracking-[0.14em] uppercase ${className}`}>
      <span className="block opacity-45">{k}</span>
      <span className="block tabular-nums">{v}</span>
    </div>
  );
}

// 一行ずつ下から持ち上がって現れる
function Line({ children, delay, inView }: { children: React.ReactNode; delay: number; inView?: boolean }) {
  const anim = { y: "0%" };
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className="block"
        initial={{ y: "105%" }}
        {...(inView
          ? { whileInView: anim, viewport: { once: true, margin: "0px 0px -12% 0px" } }
          : { animate: anim })}
        transition={{ duration: 1.3, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function Kv() {
  const ref = useRef<HTMLElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // スクロールで字がはじけて散っていく
  const getScatter = useCallback(() => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height * 0.85));
  }, []);

  const onTick = useCallback((t: GlyphTick) => {
    const el = coordRef.current;
    if (!el) return;
    const text = t.pointer
      ? `${t.pointer.x.toFixed(3)} / ${t.pointer.y.toFixed(3)}`
      : "—.— / —.—";
    if (el.textContent !== text) el.textContent = text;
  }, []);

  return (
    <section
      id="top"
      ref={ref}
      className="relative h-svh min-h-[600px] cursor-crosshair overflow-hidden bg-[#0b0b0b] text-white"
    >
      {/* 地の細かなドット方眼 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgb(255 255 255 / 0.07) 0.8px, transparent 1.1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <GlyphCanvas
        variant="kv"
        className="absolute inset-0 h-full w-full"
        getScatter={getScatter}
        onBuild={setCount}
        onTick={onTick}
      />

      <motion.div
        className="pointer-events-none relative flex h-full flex-col justify-between px-5 pt-6 pb-8 md:px-10 md:pt-8 md:pb-10"
        style={{ y: textY, opacity: fade }}
      >
        {/* 上段：ロゴと字の仕様 */}
        <motion.div
          className="flex items-start justify-between gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <YoakLogo className="h-[18px] w-auto md:h-5" />
          <div className="flex gap-6 text-white/80 md:gap-10">
            <Meta k="Glyph" v="欲 / U+6B32" />
            <Meta k="Strokes" v="11" className="hidden sm:block" />
            <Meta k="Points" v={count ? count.toLocaleString("en-US") : "—"} className="hidden sm:block" />
          </div>
        </motion.div>

        {/* 下段：キャッチ */}
        <div className="flex items-end justify-between gap-8">
          <div>
            <motion.p
              className="mb-5 flex items-center gap-3 font-en text-[11px] tracking-[0.14em] text-white/55 uppercase md:mb-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
            >
              <span className="block h-[5px] w-[5px] bg-acid" />
              {kv.reading}
            </motion.p>
            <h1 className="text-[clamp(2.5rem,6.2vw,6.25rem)] leading-[1.12] font-medium tracking-[0.01em]">
              {kv.catch.map((line, i) => (
                <Line key={line} delay={1.25 + i * 0.12}>
                  {line}
                </Line>
              ))}
            </h1>
            <motion.p
              className="mt-5 font-en text-[13px] tracking-[0.06em] text-white/55 md:mt-7 md:text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: EASE, delay: 1.7 }}
            >
              {kv.sub}
            </motion.p>
          </div>

          <motion.div
            className="hidden shrink-0 flex-col items-end gap-6 text-white/70 md:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.9 }}
          >
            <Meta k="Cursor x / y" v={<span ref={coordRef}>—.— / —.—</span>} className="text-right" />
            <a href="#about" className="pointer-events-auto flex items-center gap-3 font-en text-[10px] tracking-[0.14em] uppercase">
              Scroll
              <span className="relative block h-px w-16 overflow-hidden bg-white/20">
                <motion.span
                  className="absolute inset-y-0 left-0 w-1/2 bg-white"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                />
              </span>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// 本文中の「欲」だけに蛍光のマーカーを引く
const markVariants: Variants = {
  hidden: { backgroundSize: "0% 100%" },
  shown: { backgroundSize: "100% 100%", transition: { duration: 0.7, ease: EASE, delay: 0.35 } },
};

function Yoku({ text }: { text: string }) {
  const parts = text.split("欲");
  return parts.map((p, i) => (
    <span key={i}>
      {p}
      {i < parts.length - 1 && (
        <motion.span
          variants={markVariants}
          className="bg-no-repeat"
          style={{
            backgroundImage: "linear-gradient(transparent 58%, var(--color-acid) 58%, var(--color-acid) 92%, transparent 92%)",
          }}
        >
          欲
        </motion.span>
      )}
    </span>
  ));
}

const paraVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};

function About() {
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  // 画面に入ってくるあいだに、散った網点がまた集まる
  const getScatter = useCallback(() => {
    const el = panelRef.current;
    if (!el) return 1;
    const vh = window.innerHeight;
    return clamp((el.getBoundingClientRect().top - vh * 0.2) / (vh * 0.6));
  }, []);

  // 本文を読み進めるほど、字が白く満ちていく
  const getFill = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return 0;
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    return clamp((vh * 0.7 - r.top) / r.height);
  }, []);

  const onTick = useCallback((t: GlyphTick) => {
    const el = pctRef.current;
    if (!el) return;
    const text = `${String(Math.round(t.fill * 100)).padStart(3, "0")}%`;
    if (el.textContent !== text) el.textContent = text;
  }, []);

  const paragraphs = about.body;
  const lastIndex = paragraphs.length - 1;

  return (
    <section id="about" className="relative bg-paper py-24 text-ink md:py-40">
      <div className="mx-auto max-w-[1360px] px-5 md:px-10">
        {/* 見出しの上の罫とラベル */}
        <div className="flex items-baseline justify-between border-t border-ink pt-3 font-en text-[10px] tracking-[0.14em] uppercase">
          <span>(02) — {about.label}</span>
          <span className="text-mute">欲 — yoku / n. desire, want</span>
        </div>

        <h2 className="mt-14 text-[clamp(2.4rem,7.4vw,7.5rem)] leading-[1.08] font-bold tracking-[-0.02em] md:mt-20">
          {about.heading.map((line, i) => (
            <Line key={line} delay={i * 0.1} inView>
              {line}
            </Line>
          ))}
        </h2>

        <div className="mt-16 grid gap-12 md:mt-28 md:grid-cols-12 md:gap-10">
          {/* KV の字が縮んだ、スティッキーな小さな標本 */}
          <div className="md:col-span-5">
            <div className="md:sticky md:top-10">
              <div ref={panelRef} className="relative aspect-square w-full max-w-[440px] bg-[#0b0b0b]">
                <GlyphCanvas
                  variant="mark"
                  className="absolute inset-0 h-full w-full"
                  getScatter={getScatter}
                  getFill={getFill}
                  onTick={onTick}
                />
                <span className="pointer-events-none absolute top-3 left-3 font-en text-[10px] tracking-[0.14em] text-white/50 uppercase">
                  Fig. 01
                </span>
                <span className="pointer-events-none absolute top-3 right-3 font-en text-[10px] tracking-[0.14em] text-white/50 uppercase">
                  U+6B32
                </span>
              </div>
              <div className="mt-3 flex max-w-[440px] justify-between border-t border-line pt-3 text-mute">
                <Meta k="Specimen" v="欲 — yoku" />
                <Meta k="Read" v={<span ref={pctRef}>000%</span>} className="text-right" />
              </div>
            </div>
          </div>

          <div ref={bodyRef} className="md:col-span-6 md:col-start-7 md:pt-2">
            {paragraphs.map((lines, pi) => {
              const last = pi === lastIndex;
              return (
                <motion.div
                  key={pi}
                  className={`grid grid-cols-[2.5rem_1fr] md:grid-cols-[3.5rem_1fr] ${
                    last ? "mt-16 border-t border-ink pt-8 md:mt-24" : pi ? "mt-9 md:mt-11" : ""
                  }`}
                  variants={paraVariants}
                  initial="hidden"
                  whileInView="shown"
                  viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                >
                  <span className="pt-[0.45em] font-en text-[10px] tracking-[0.14em] text-mute tabular-nums">
                    {String(pi + 1).padStart(2, "0")}
                  </span>
                  <p
                    className={
                      last
                        ? "text-[clamp(1.25rem,2.1vw,1.75rem)] leading-[1.7] font-bold"
                        : "text-[15px] leading-[2.15] md:text-[16.5px]"
                    }
                  >
                    {lines.map((l, li) => (
                      <span key={li} className="block">
                        <Yoku text={l} />
                      </span>
                    ))}
                  </p>
                </motion.div>
              );
            })}
            <div className="mt-10 grid grid-cols-[2.5rem_1fr] md:grid-cols-[3.5rem_1fr]">
              <span />
              <YoakLogo className="h-6 w-auto justify-self-start text-ink" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DirectionB() {
  return (
    <>
      <Kv />
      <About />
    </>
  );
}
