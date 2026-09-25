"use client";

import { motion } from "motion/react";

// 方向性 C の共通部品（グリッド罫線・マーカー）
export const EASE = [0.65, 0, 0.35, 1] as const;
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// 黒地にも白地にも沈まない中間グレーの罫線
export const RULE = "bg-[rgb(128_128_128/0.38)]";

// 12 カラム（スマホは 4 カラム）の縦罫線。inView なら見えたときに一本ずつ引く
export function GridRules({
  delay = 0,
  inView = false,
  className = RULE,
}: {
  delay?: number;
  inView?: boolean;
  className?: string;
}) {
  const lines = Array.from({ length: 13 }, (_, i) => i);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 inset-x-5 grid grid-cols-4 md:inset-x-10 md:grid-cols-12"
    >
      {lines.slice(0, 12).map((i) => (
        <div key={i} className={`relative ${i >= 4 ? "hidden md:block" : ""}`}>
          <Rule i={i} delay={delay} inView={inView} className={className} />
        </div>
      ))}
      {/* 右端の罫線 */}
      <div className="absolute inset-y-0 right-0">
        <Rule i={12} delay={delay} inView={inView} className={className} />
      </div>
    </div>
  );
}

function Rule({
  i,
  delay,
  inView,
  className,
}: {
  i: number;
  delay: number;
  inView: boolean;
  className: string;
}) {
  const transition = { duration: 1.2, ease: EASE, delay: delay + i * 0.045 };
  return (
    <motion.span
      className={`absolute inset-y-0 left-0 w-px origin-top ${className}`}
      initial={{ scaleY: 0 }}
      {...(inView
        ? { whileInView: { scaleY: 1 }, viewport: { once: true, amount: 0.1 } }
        : { animate: { scaleY: 1 } })}
      transition={transition}
    />
  );
}

// 横罫線。左から引く
export function HRule({
  delay = 0,
  inView = false,
  className = RULE,
}: {
  delay?: number;
  inView?: boolean;
  className?: string;
}) {
  return (
    <motion.span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 h-px origin-left ${className}`}
      initial={{ scaleX: 0 }}
      {...(inView
        ? { whileInView: { scaleX: 1 }, viewport: { once: true, amount: 1 } }
        : { animate: { scaleX: 1 } })}
      transition={{ duration: 1.4, ease: EASE, delay }}
    />
  );
}

// 蛍光グリーンのマーカーを左から引く
export function Mark({
  children,
  delay = 0,
  inView = true,
}: {
  children: React.ReactNode;
  delay?: number;
  inView?: boolean;
}) {
  return (
    <span className="relative isolate inline-block">
      <motion.span
        aria-hidden="true"
        className="absolute -inset-x-[0.08em] top-[0.14em] bottom-[0.06em] -z-10 origin-left bg-acid"
        initial={{ scaleX: 0 }}
        {...(inView
          ? { whileInView: { scaleX: 1 }, viewport: { once: true, margin: "0px 0px -12% 0px" } }
          : { animate: { scaleX: 1 } })}
        transition={{ duration: 0.7, ease: EASE, delay }}
      />
      {children}
    </span>
  );
}

// 文中の「欲」だけにマーカーを引く
export function MarkYoku({ text, delay = 0 }: { text: string; delay?: number }) {
  const parts = text.split("欲");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <Mark delay={delay + i * 0.08}>欲</Mark>}
        </span>
      ))}
    </>
  );
}
