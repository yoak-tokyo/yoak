"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { kv } from "@/content/site";
import { YoakLogo } from "./logos";
import { OPENING_DURATION } from "./opening";
import { MaskLines } from "./reveal";

const EASE = [0.16, 1, 0.3, 1] as const;
const START = OPENING_DURATION - 0.5;

export function Kv() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // カーソルに追従して布の上を光がなでる
  const mx = useMotionValue(0.62);
  const my = useMotionValue(0.38);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const lightX = useTransform(sx, (v) => `${v * 100}%`);
  const lightY = useTransform(sy, (v) => `${v * 100}%`);
  const light = useMotionTemplate`radial-gradient(40vmax circle at ${lightX} ${lightY}, rgb(255 255 255 / 0.14), transparent 70%)`;

  return (
    <section
      id="top"
      ref={ref}
      className="grain relative h-svh min-h-[560px] overflow-hidden bg-ink text-white"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
    >
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/kv.jpg)" }}
          initial={{ scale: 1.18, opacity: 0 }}
          animate={{ scale: 1.04, opacity: 1 }}
          transition={{ duration: 3.2, ease: EASE, delay: START - 0.3 }}
        />
      </motion.div>
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: light }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

      <motion.div
        className="relative flex h-full flex-col justify-end px-5 pb-10 md:px-10 md:pb-14"
        style={{ y: contentY, opacity: fade }}
      >
        <motion.p
          className="label absolute top-24 right-5 text-white/60 md:top-28 md:right-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: START + 0.9 }}
        >
          {kv.reading}
        </motion.p>

        <h1 className="text-[clamp(2.75rem,7.4vw,7rem)] leading-[1.15] font-medium tracking-[0.02em]">
          <MaskLines lines={kv.catch} animateOnMount delay={START} />
        </h1>

        <div className="mt-10 flex items-end justify-between gap-6 md:mt-14">
          <motion.div
            className="overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: START + 0.5 }}
          >
            <YoakLogo className="h-7 w-auto md:h-9" />
            <p className="mt-4 font-en text-sm tracking-[0.08em] text-white/70 italic">
              {kv.sub}
            </p>
          </motion.div>

          <motion.a
            href="#about"
            className="group flex flex-col items-center gap-3 text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: START + 1 }}
          >
            <span className="label [writing-mode:vertical-rl]">Scroll</span>
            <span className="relative block h-16 w-px overflow-hidden bg-white/20">
              <motion.span
                className="absolute inset-x-0 top-0 h-1/2 bg-white"
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
              />
            </span>
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
