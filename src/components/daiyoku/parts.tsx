"use client";

import { motion, useMotionValue, useScroll, useSpring } from "motion/react";
import { useEffect, useId, useState } from "react";

// スーパー大欲モードで使い回す部品

export const EASE = [0.16, 1, 0.3, 1] as const;
export const POP = { type: "spring", stiffness: 260, damping: 18 } as const;

// ---------- 流れ続ける帯 ----------

export function Marquee({
  items,
  className = "",
  speed = 40,
  reverse = false,
  separator = "✺",
}: {
  items: string[];
  className?: string;
  speed?: number;
  reverse?: boolean;
  separator?: string;
}) {
  const row = items.flatMap((t) => [t, separator]);
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
      <div
        className="dy-marquee flex w-max"
        style={{ "--dy-dur": `${speed}s`, animationDirection: reverse ? "reverse" : "normal" } as React.CSSProperties}
      >
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center gap-[0.5em] pr-[0.5em]">
            {row.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- 文字がはじけて出てくる見出し ----------

// 文字ごとの傾きなどは index から決める（サーバーとクライアントで結果がずれないように）
const jitter = (i: number, range: number) => (((i * 47) % 23) / 22 - 0.5) * 2 * range;

export function PopText({
  text,
  className = "",
  colors,
  delay = 0,
  onMount = false,
}: {
  text: string;
  className?: string;
  colors?: string[];
  delay?: number;
  onMount?: boolean;
}) {
  const trigger = onMount
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <motion.span className={className} initial="hidden" {...trigger}>
      <span className="sr-only">{text}</span>
      {Array.from(text).map((c, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block"
          style={colors ? { color: colors[i % colors.length] } : undefined}
          variants={{
            hidden: { y: "0.5em", opacity: 0, rotate: jitter(i, 18), scale: 0.4 },
            show: { y: 0, opacity: 1, rotate: 0, scale: 1, transition: { ...POP, delay: delay + i * 0.035 } },
          }}
        >
          {c === " " ? " " : c}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ---------- セクションの見出しラベル ----------

export function DyLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 border-current px-3.5 py-1 font-display text-xs tracking-[0.08em] uppercase ${className}`}
    >
      <span className="size-2 rounded-full bg-current" />
      {children}
    </span>
  );
}

// ---------- 回りつづける円形バッジ ----------

export function SpinBadge({
  text,
  className = "",
  fill = "var(--color-acid)",
  ink = "var(--color-ink)",
  speed = 16,
  children,
}: {
  text: string;
  className?: string;
  fill?: string;
  ink?: string;
  speed?: number;
  children?: React.ReactNode;
}) {
  const id = `dy-badge-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 200 200"
        className="dy-spin absolute inset-0 size-full"
        style={{ "--dy-dur": `${speed}s` } as React.CSSProperties}
      >
        <defs>
          <path id={id} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
        </defs>
        <circle cx="100" cy="100" r="99" fill={fill} stroke={ink} strokeWidth="3" />
        <text fontSize="19" letterSpacing="2.5" fill={ink} style={{ fontFamily: "var(--font-dela)" }}>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

// ---------- 図形 ----------

export function Burst({ points = 12, fill, className = "" }: { points?: number; fill: string; className?: string }) {
  const pts = Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 48 : 30;
    const a = (Math.PI * i) / points - Math.PI / 2;
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden="true">
      <polygon points={pts} fill={fill} stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Flower({ fill, className = "" }: { fill: string; className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 6;
        return (
          <circle
            key={i}
            cx={(Math.cos(a) * 24).toFixed(2)}
            cy={(Math.sin(a) * 24).toFixed(2)}
            r="20"
            fill={fill}
            stroke="var(--color-ink)"
            strokeWidth="2.5"
          />
        );
      })}
      <circle r="14" fill="var(--color-cream)" stroke="var(--color-ink)" strokeWidth="2.5" />
    </svg>
  );
}

export function Squiggle({ stroke, className = "" }: { stroke: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden="true" fill="none">
      <path
        d="M6 20 Q 18 4 30 20 T 54 20 T 78 20 T 102 20 T 126 20"
        stroke="var(--color-ink)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path d="M6 20 Q 18 4 30 20 T 54 20 T 78 20 T 102 20 T 126 20" stroke={stroke} strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function Blob({ fill, className = "" }: { fill: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M52 4c18 0 34 10 40 27s2 38-12 51-36 17-52 8S2 60 5 42 34 4 52 4z"
        fill={fill}
        stroke="var(--color-ink)"
        strokeWidth="2.5"
      />
    </svg>
  );
}

// ---------- カーソルについてくる丸（マウス操作のみ） ----------

export function DyCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 700, damping: 45 });
  const sy = useSpring(y, { stiffness: 700, damping: 45 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const el = e.target as Element | null;
      setActive(Boolean(el?.closest("a, button, input, textarea, select, label")));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[60] hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-hot mix-blend-difference [@media(pointer:fine)]:block"
      style={{ x: sx, y: sy }}
      animate={{ scale: active ? 2.6 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    />
  );
}

// ---------- 上端の読み進みバー ----------

export function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[55] h-1.5 origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, var(--color-acid), var(--color-hot), var(--color-volt), var(--color-tang))",
      }}
    />
  );
}

// ---------- 画面全体の粒子 ----------

export function Grain() {
  return <div aria-hidden="true" className="dy-grain pointer-events-none fixed inset-0 z-[50]" />;
}
