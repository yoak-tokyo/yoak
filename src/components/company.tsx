"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { company, footer, mission, type FooterLink } from "@/content/site";
import { YoakLogo } from "./logos";
import { Reveal, SectionLabel } from "./reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Company() {
  return (
    <section id="company" className="bg-mist py-32 md:py-48">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <SectionLabel>{company.label}</SectionLabel>
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

function FooterNavLink({ link }: { link: FooterLink }) {
  const className = "text-[15px] text-white/75 transition-colors hover:text-white";
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label} <span aria-hidden="true">↗</span>
      </a>
    );
  }
  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="overflow-hidden bg-ink px-5 pt-20 pb-8 text-white md:px-10 md:pt-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-14 border-t border-line-inv pt-8 md:grid-cols-12 md:pt-10">
          <div className="md:col-span-5">
            <p className="text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.5] font-medium">
              {/* 読点のあとで改行する */}
              {mission.statement.split(/(?<=、)/).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="mt-4 font-en text-sm tracking-[0.08em] text-white/60 italic">{mission.en}</p>
          </div>

          <nav aria-label="フッター" className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 md:col-span-6 md:col-start-7">
            {footer.columns.map((col) => (
              <div key={col.heading}>
                <p className="label text-white/40">{col.heading}</p>
                <ul className="mt-6 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <FooterNavLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex flex-col-reverse gap-12 md:mt-32 md:grid md:grid-cols-12 md:items-end">
          <address className="text-sm leading-[1.9] text-white/70 not-italic md:col-span-5">
            <span className="block text-white">{footer.companyName}</span>
            {footer.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <Reveal y={60} className="md:col-span-6 md:col-start-7">
            <YoakLogo className="h-auto w-full" />
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 border-t border-line-inv pt-6 md:mt-16 md:grid-cols-3 md:items-center">
          <p className="font-en text-xs tracking-[0.08em] text-white/50 md:col-start-2 md:text-center">
            © 2025 Yoak, LLC.
          </p>
          <a
            href="#top"
            className="label text-white/70 transition-colors hover:text-white md:col-start-3 md:justify-self-end"
          >
            back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
