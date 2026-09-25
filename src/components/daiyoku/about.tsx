"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { about } from "@/content/site";
import { DyLabel, EASE, Marquee, SpinBadge } from "./parts";

const LINE_STYLES = [
  "text-acid",
  "bg-hot text-ink px-[0.14em] -rotate-1 inline-block",
  "text-cream",
];

// 見出しの行が、スクロールに合わせて左右から滑り込む
function HeadingLine({ text, i, progress }: { text: string; i: number; progress: MotionValue<number> }) {
  const x = useTransform(progress, [0, 1], [i % 2 === 0 ? "-35%" : "35%", "0%"]);
  return (
    <motion.span className="block" style={{ x }}>
      <span className={LINE_STYLES[i % LINE_STYLES.length]}>{text}</span>
    </motion.span>
  );
}

// 本文の「欲」に蛍光ペンを引く
function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split(/(欲)/).map((part, i) =>
        part === "欲" ? (
          <mark key={i} className="mx-[0.05em] rounded-sm bg-acid px-[0.12em] font-bold text-ink">
            欲
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function DyAbout() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: headingRef, offset: ["start end", "center 0.6"] });

  return (
    <section id="about" className="relative overflow-hidden bg-ink pb-32 text-cream md:pb-44">
      <div className="border-b-[3px] border-cream/10 py-6">
        <Marquee
          items={["ABOUT", "欲", "THE MOST HONEST ENGINE", "欲"]}
          className="dy-outline-cream font-display text-[16vw] leading-none md:text-[11vw]"
          speed={50}
        />
      </div>

      <div className="mx-auto max-w-[1280px] px-5 pt-20 md:px-10 md:pt-28">
        <DyLabel className="text-acid">{about.label}</DyLabel>
        <h2
          ref={headingRef}
          className="mt-10 font-display text-[clamp(2.4rem,7vw,6.5rem)] leading-[1.18]"
        >
          {about.heading.map((line, i) => (
            <HeadingLine key={line} text={line} i={i} progress={scrollYProgress} />
          ))}
        </h2>

        <div className="mt-20 grid gap-14 md:mt-28 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <SpinBadge
                text="YOKU IS THE MOST HONEST ENGINE ✺ "
                className="size-40 md:size-56"
                fill="var(--color-hot)"
                speed={22}
              >
                <span className="font-display text-5xl text-ink md:text-7xl">欲</span>
              </SpinBadge>
            </div>
          </div>

          <div className="space-y-10 text-[16px] leading-[2.2] md:col-span-8 md:text-[19px]">
            {about.body.map((paragraph, pi) => (
              <motion.p
                key={pi}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 0.9, ease: EASE }}
                className={pi === about.body.length - 1 ? "font-display text-[1.25em] leading-[1.7] text-acid" : ""}
              >
                {paragraph.map((line) => (
                  <span key={line} className="block">
                    <Marked text={line} />
                  </span>
                ))}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
