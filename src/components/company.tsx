"use client";

import { motion } from "motion/react";
import { company } from "@/content/site";
import { YoakLogo } from "./logos";
import { Reveal, SectionLabel } from "./reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Company() {
  return (
    <section id="company" className="bg-mist py-32 md:py-48">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <SectionLabel no="06">{company.label}</SectionLabel>
          <Reveal as="h2" className="mt-8 font-en text-4xl font-medium tracking-tight md:text-5xl">
            Profile
          </Reveal>
        </div>

        <dl className="md:col-span-8">
          {company.rows.map((row, i) => (
            <motion.div
              key={row.th}
              className="relative grid gap-2 py-6 md:grid-cols-8 md:gap-6 md:py-7"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -5% 0px" }}
              transition={{ duration: 1, ease: EASE, delay: i * 0.06 }}
            >
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left bg-line"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: EASE, delay: i * 0.06 }}
              />
              <dt className="text-xs tracking-[0.12em] text-mute md:col-span-2 md:pt-1">{row.th}</dt>
              <dd className="text-[15px] leading-[1.9] md:col-span-6">
                {row.td.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="overflow-hidden bg-ink px-5 pt-20 pb-8 text-white md:px-10 md:pt-28">
      <div className="mx-auto max-w-[1280px]">
        <Reveal y={60}>
          <YoakLogo className="h-auto w-full max-w-[1200px]" />
        </Reveal>
        <div className="mt-16 flex flex-col-reverse justify-between gap-6 border-t border-line-inv pt-6 md:flex-row md:items-center">
          <p className="font-en text-xs tracking-[0.08em] text-white/50">© {new Date().getFullYear()} Yoak, LLC.</p>
          <a href="#top" className="label text-white/70 transition-colors hover:text-white">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
