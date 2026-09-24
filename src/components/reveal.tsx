"use client";

import { motion, type Variants } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

// 画面に入ったら下からふわっと出す汎用ラッパー
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "p" | "li" | "h2" | "h3" | "dl";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

// 行ごとにマスクから持ち上げる見出し用
const lineVariants: Variants = {
  hidden: { y: "110%" },
  show: ({ i, delay }: { i: number; delay: number }) => ({
    y: "0%",
    transition: { duration: 1.2, ease: EASE, delay: delay + i * 0.12 },
  }),
};

export function MaskLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  animateOnMount = false,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  animateOnMount?: boolean;
}) {
  const trigger = animateOnMount
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <motion.span
      className={className}
      initial="hidden"
      {...trigger}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${lineClassName ?? ""}`}
            variants={lineVariants}
            custom={{ i, delay }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// セクション見出し左の英字ラベル + 伸びる罫線
export function SectionLabel({
  children,
  no,
  inverted = false,
}: {
  children: React.ReactNode;
  no: string;
  inverted?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 ${inverted ? "text-white/70" : "text-mute"}`}>
      <span className="label">{no}</span>
      <motion.span
        className={`h-px w-12 origin-left ${inverted ? "bg-white/40" : "bg-ink/30"}`}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      <span className="label">{children}</span>
    </div>
  );
}
