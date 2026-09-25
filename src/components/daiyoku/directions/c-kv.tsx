"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { kv } from "@/content/site";
import { YoakLogo } from "@/components/logos";
import { EASE, EASE_OUT, GridRules, HRule, Mark } from "./c-parts";

// 「欲」を横に切る帯（上端%, 下端%）。均等にしないことで緊張をつくる
const BANDS = [0, 13, 31, 50, 64, 82, 100];
// 登場時のずれ（字幅に対する%）。混沌から秩序へ収束させる
const ENTRY = [-19, 12, -7, 16, -11, 6];
// カーソルの左右位置に応じたずれ（px）。静止すると揃う
const PULL = [22, -30, 40, -18, 28, -12];

const pad = (v: number) => String(Math.max(0, Math.round(v))).padStart(4, "0");

// 切り取られた「欲」の一帯
function Slice({ i, nx, still }: { i: number; nx: MotionValue<number>; still: boolean }) {
  const top = BANDS[i];
  const bottom = 100 - BANDS[i + 1];
  const pull = useTransform(nx, (v) => (still ? 0 : v * PULL[i]));
  const x = useSpring(pull, { stiffness: 140, damping: 22, mass: 0.7 });
  return (
    <div className="absolute inset-0" style={{ clipPath: `inset(${top}% -40% ${bottom}% -40%)` }}>
      <motion.div
        initial={{ x: `${ENTRY[i]}%`, opacity: 0 }}
        animate={{ x: "0%", opacity: 1 }}
        transition={{
          x: { duration: 1.5, ease: [0.87, 0, 0.13, 1], delay: 0.55 + i * 0.05 },
          opacity: { duration: 0.2, delay: 0.55 + i * 0.05 },
        }}
      >
        <motion.span className="block leading-none" style={{ x }}>
          欲
        </motion.span>
      </motion.div>
    </div>
  );
}

export function KvC() {
  const reduce = useReducedMotion();
  const still = reduce === true;

  // カーソル座標（px）と、左右位置（-1〜1）
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const nx = useMotionValue(0);
  const crossOpacity = useMotionValue(0);
  const xLabel = useTransform(mx, (v) => `X ${pad(v)}`);
  const yLabel = useTransform(my, (v) => `Y ${pad(v)}`);

  return (
    <section
      id="top"
      className="relative h-svh min-h-[600px] overflow-hidden bg-paper text-ink md:cursor-crosshair"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - r.left;
        mx.set(x);
        my.set(e.clientY - r.top);
        nx.set((x / r.width) * 2 - 1);
        crossOpacity.set(1);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        nx.set(0);
        crossOpacity.set(0);
      }}
    >
      {/* 混沌：上下の罫で切り取られ、右へはみ出す「欲」 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-12 bottom-12 overflow-hidden select-none md:top-14 md:bottom-14"
      >
        <div className="absolute top-[3%] right-[-20vw] size-[1em] font-sans text-[114vw] font-black text-ink md:top-1/2 md:right-[-9vw] md:-translate-y-1/2 md:text-[min(120svh,84vw)]">
          {BANDS.slice(0, -1).map((_, i) => (
            <Slice key={i} i={i} nx={nx} still={still} />
          ))}
        </div>
      </div>

      {/* 罫線は「欲」の上にも重ねる（中間グレーなので白黒どちらでも見える） */}
      {/* 秩序：12 カラムの罫線 */}
      <GridRules delay={0.05} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-12 md:top-14">
          <HRule delay={0.2} />
        </div>
        <div className="absolute inset-x-0 bottom-12 md:bottom-14">
          <HRule delay={0.35} />
        </div>
        {/* 黄金比の補助線 */}
        <div className="absolute inset-x-0 top-[38.2%] hidden md:block">
          <HRule delay={0.5} className="bg-[rgb(128_128_128/0.22)]" />
        </div>
      </div>

      {/* 上の罫：番号と注記 */}
      <motion.div
        className="absolute inset-x-5 top-0 grid h-12 grid-cols-4 items-center font-en text-[10px] font-medium tracking-[0.12em] uppercase md:inset-x-10 md:h-14 md:grid-cols-12 md:text-[11px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className={`relative flex h-full items-center pl-2.5 ${i >= 4 ? "hidden md:flex" : ""}`}
          >
            <span className="absolute top-2 right-2 hidden text-[9px] tracking-normal text-mute tabular-nums lg:block">
              {String(i + 1).padStart(2, "0")}
            </span>
            {i === 0 && <YoakLogo className="h-3.5 w-auto md:h-4" />}
            {i === 1 && <span className="whitespace-nowrap md:hidden">Fig. 01</span>}
            {i === 2 && <span className="hidden whitespace-nowrap md:inline">Fig. 01</span>}
            {i === 3 && (
              <span className="hidden whitespace-nowrap md:inline">Order / Chaos</span>
            )}
            {i === 3 && (
              <span className="ml-auto flex items-center gap-1.5 pr-0.5 whitespace-nowrap md:hidden">
                <span className="size-1.5 bg-acid" />
                大欲
              </span>
            )}
            {i === 11 && (
              <span className="ml-auto flex items-center gap-1.5 pr-2.5 whitespace-nowrap lg:pr-7">
                <span className="size-1.5 bg-acid" />
                Mode — 大欲
              </span>
            )}
          </div>
        ))}
      </motion.div>

      {/* 仕様書のような注記。「欲」に重なっても読めるよう反転させる */}
      <motion.dl
        className="absolute top-[4.5rem] left-5 grid grid-cols-[auto_auto] gap-x-3 gap-y-1 pl-2.5 font-en text-[10px] leading-[1.5] tracking-[0.06em] text-white mix-blend-difference md:top-[5.5rem] md:left-10 md:text-[11px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.3 }}
      >
        <dt className="opacity-60">Glyph</dt>
        <dd className="font-sans">{kv.reading}</dd>
        <dt className="opacity-60">Code</dt>
        <dd className="tabular-nums">U+6B32</dd>
        <dt className="opacity-60">Strokes</dt>
        <dd className="tabular-nums">11</dd>
        <dt className="opacity-60">Weight</dt>
        <dd className="tabular-nums">900</dd>
      </motion.dl>

      {/* キャッチ。「欲」に重なった部分は白く抜ける */}
      <div className="absolute inset-x-5 bottom-[5.5rem] pl-2.5 md:inset-x-10 md:bottom-[7rem]">
        <h1 className="text-[clamp(2.75rem,13.2vw,4.5rem)] leading-[1.06] font-black tracking-[-0.03em] text-white mix-blend-difference md:text-[clamp(3.5rem,7.4vw,8rem)]">
          {kv.catch.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={{ y: "108%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, ease: EASE_OUT, delay: 1.25 + i * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="mt-5 font-en text-[13px] font-medium tracking-[-0.005em] md:mt-7 md:text-[15px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.7 }}
        >
          <Mark inView={false} delay={1.9}>
            <span className="px-1.5">{kv.sub}</span>
          </Mark>
        </motion.p>
      </div>

      {/* 下の罫 */}
      <motion.div
        className="absolute inset-x-5 bottom-0 grid h-12 grid-cols-4 items-center font-en text-[10px] font-medium tracking-[0.12em] uppercase md:inset-x-10 md:h-14 md:grid-cols-12 md:text-[11px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <span className="col-span-2 pl-2.5 whitespace-nowrap tabular-nums md:col-span-3">
          01 — Top
        </span>
        <span className="col-start-4 flex items-center justify-end gap-2.5 pr-2.5 md:col-start-7 md:justify-start md:pl-2.5">
          <span className="relative h-5 w-px overflow-hidden bg-[rgb(128_128_128/0.3)]">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-ink"
              initial={{ y: "-100%" }}
              animate={{ y: "200%" }}
              transition={{ duration: 1.6, ease: EASE, repeat: Infinity, repeatDelay: 0.4 }}
            />
          </span>
          Scroll
        </span>
        <span className="col-span-2 col-start-11 hidden justify-self-end pr-2.5 whitespace-nowrap tabular-nums md:block">
          02 — About ↓
        </span>
      </motion.div>

      {/* カーソルの十字線と座標（マウスのときだけ） */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ opacity: crossOpacity }}
      >
        <motion.span className="absolute inset-y-0 left-0 w-px bg-acid" style={{ x: mx }} />
        <motion.span className="absolute inset-x-0 top-0 h-px bg-acid" style={{ y: my }} />
        {/* X は上の罫の上、Y は左端の罫の上を走る */}
        <motion.span className="absolute top-12 left-0 md:top-14" style={{ x: mx }}>
          <motion.span className="block -translate-x-1/2 -translate-y-1/2 bg-acid px-1 py-px font-en text-[10px] font-medium text-ink tabular-nums">
            {xLabel}
          </motion.span>
        </motion.span>
        <motion.span className="absolute top-0 left-5 md:left-10" style={{ y: my }}>
          <motion.span className="block -translate-y-1/2 bg-acid px-1 py-px font-en text-[10px] font-medium text-ink tabular-nums">
            {yLabel}
          </motion.span>
        </motion.span>
      </motion.div>
    </section>
  );
}
