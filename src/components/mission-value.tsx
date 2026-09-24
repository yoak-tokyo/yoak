"use client";

import { motion } from "motion/react";
import { mission, values } from "@/content/site";
import { Reveal, SectionLabel } from "./reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

export function MissionValue() {
  const chars = Array.from(mission.statement);

  return (
    <section id="mission" className="relative overflow-hidden bg-ink py-32 text-white md:py-48">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionLabel inverted>{mission.label}</SectionLabel>

        <motion.h2
          className="mt-14 text-[clamp(3rem,11vw,10rem)] leading-[1.1] md:text-[clamp(2.4rem,8.8vw,8rem)] font-medium tracking-[0.02em]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -20% 0px" }}
          aria-label={mission.statement}
        >
          {chars.map((c, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: "0.4em", filter: "blur(12px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 1.4, ease: EASE, delay: i * 0.08 },
                },
              }}
            >
              {c}
            </motion.span>
          ))}
        </motion.h2>

        <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-12">
          <Reveal as="p" delay={0.5} className="font-en text-lg tracking-[0.06em] text-white/60 italic md:col-span-5">
            {mission.en}
          </Reveal>
          <Reveal as="p" delay={0.6} className="text-base leading-[2.1] md:col-span-7 md:text-lg">
            {mission.body}
          </Reveal>
        </div>

        <div className="mt-32 md:mt-48">
          <SectionLabel inverted>{values.label}</SectionLabel>

          <ol className="mt-12 md:mt-16">
            {values.items.map((v, i) => (
              <li key={v.no} className="relative">
                <motion.span
                  className="absolute inset-x-0 top-0 h-px origin-left bg-white/20"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: EASE, delay: i * 0.1 }}
                />
                <Reveal
                  delay={i * 0.1}
                  className="relative grid gap-4 py-10 md:grid-cols-12 md:items-baseline md:gap-8 md:py-14"
                >
                  <span className="label text-white/50 md:col-span-1">{v.no}</span>
                  <p className="font-en text-[clamp(2rem,4.2vw,3.5rem)] leading-none tracking-[-0.01em] md:col-span-6">
                    {v.en}
                  </p>
                  <div className="md:col-span-5">
                    <h3 className="text-lg font-medium md:text-2xl">{v.title}</h3>
                    <p className="mt-3 text-[11px] leading-[2.1] text-white/70 md:text-sm">{v.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
            <li aria-hidden="true" className="h-px bg-white/20" />
          </ol>
        </div>
      </div>
    </section>
  );
}
