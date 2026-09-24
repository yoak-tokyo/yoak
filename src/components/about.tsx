"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { about } from "@/content/site";
import { MaskLines, SectionLabel } from "./reveal";

// スクロールに合わせて一行ずつ文字が濃くなる
function ScrollLine({
  children,
  progress,
  range,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span className="block" style={{ opacity }}>
      {children}
    </motion.span>
  );
}

export function About() {
  const ref = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glyphY = useTransform(scrollYProgress, [0, 1], ["-10%", "25%"]);
  const glyphRotate = useTransform(scrollYProgress, [0, 1], [-4, 6]);

  const { scrollYProgress: bodyProgress } = useScroll({
    target: bodyRef,
    offset: ["start 0.85", "end 0.55"],
  });

  const lines = about.body.flatMap((p, pi) =>
    p.map((text, li) => ({ text, pi, last: li === p.length - 1 })),
  );
  const step = 1 / lines.length;

  return (
    <section id="about" ref={ref} className="relative overflow-hidden bg-paper py-32 md:py-48">
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[8vw] top-10 select-none text-[48vw] leading-none font-bold text-transparent md:text-[36vw]"
        style={{ y: glyphY, rotate: glyphRotate, WebkitTextStroke: "1px rgb(17 17 17 / 0.08)" }}
      >
        欲
      </motion.span>

      <div className="relative mx-auto grid max-w-[1280px] gap-16 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <SectionLabel>{about.label}</SectionLabel>
            <h2 className="mt-8 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.5] font-medium">
              <MaskLines lines={about.heading} />
            </h2>
          </div>
        </div>

        <div ref={bodyRef} className="md:col-span-7 md:pt-24">
          <p className="text-[15px] leading-[2.3] md:text-[17px]">
            {lines.map((line, i) => (
              <ScrollLine
                key={i}
                progress={bodyProgress}
                range={[i * step, (i + 1) * step]}
              >
                {line.text}
                {line.last && i !== lines.length - 1 && <span className="block h-[1.2em]" />}
              </ScrollLine>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
