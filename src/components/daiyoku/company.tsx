"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { company, footer, mission, type FooterLink } from "@/content/site";
import { Contact } from "../contact";
import { YoakLogo } from "../logos";
import { Burst, DyLabel, EASE, Marquee, POP, PopText } from "./parts";

export function DyCompany() {
  return (
    <section id="company" className="relative overflow-hidden bg-volt py-32 text-cream md:py-44">
      <Burst fill="var(--color-acid)" className="dy-spin pointer-events-none absolute -top-16 -right-16 size-56 opacity-90 md:size-80" />
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        <DyLabel className="text-acid">{company.label}</DyLabel>
        <h2 className="mt-8 font-display text-[clamp(3.4rem,11vw,10rem)] leading-none">
          <PopText text="PROFILE" />
        </h2>

        <dl className="mt-16 border-b-2 border-dashed border-cream/40 md:mt-20">
          {company.rows.map((row, i) => (
            <motion.div
              key={row.th}
              className="grid gap-2 border-t-2 border-dashed border-cream/40 py-6 md:grid-cols-[14rem_1fr] md:gap-8 md:py-7"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -5% 0px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.05 }}
            >
              <dt className="font-display text-sm text-acid md:pt-1">{row.th}</dt>
              <dd className="text-base leading-[1.9] font-bold md:text-lg">
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

export function DyContact() {
  return (
    <section className="relative overflow-hidden bg-tang pb-24 text-ink md:pb-36">
      <div className="py-8">
        <Marquee
          items={["CONTACT", "お気軽に、ご連絡ください。", "SAY HELLO"]}
          className="font-display text-[14vw] leading-none md:text-[9vw]"
          speed={40}
        />
      </div>
      <motion.div
        className="mx-4 overflow-hidden rounded-[2rem] border-[3px] border-ink bg-cream shadow-[12px_12px_0_var(--color-ink)] md:mx-auto md:max-w-[1200px]"
        initial={{ opacity: 0, y: 80, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={POP}
      >
        <Contact sectionClassName="py-16 md:py-20" />
      </motion.div>
    </section>
  );
}

function DyFooterLink({ link }: { link: FooterLink }) {
  const className =
    "inline-block rounded-full border-2 border-cream/30 px-4 py-1.5 font-display text-xs transition-colors duration-300 hover:border-acid hover:bg-acid hover:text-ink";
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

export function DyFooter() {
  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="-rotate-1 border-y-[3px] border-ink bg-acid py-3 text-ink">
        <Marquee items={[mission.en, mission.statement]} className="font-display text-2xl md:text-3xl" speed={22} />
      </div>

      <div className="mx-auto max-w-[1280px] px-5 pt-20 pb-8 md:px-10 md:pt-28">
        <div className="grid gap-14 md:grid-cols-12">
          <p className="dy-mesh-text font-display text-[clamp(3rem,7vw,6rem)] leading-[1.1] md:col-span-6">
            {mission.statement.split(/(?<=、)/).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>

          <nav aria-label="フッター" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:col-span-6">
            {footer.columns.map((col) => (
              <div key={col.heading}>
                <p className="font-display text-[11px] tracking-[0.12em] text-acid uppercase">{col.heading}</p>
                <ul className="mt-5 flex flex-col items-start gap-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <DyFooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex flex-col-reverse gap-10 md:mt-28 md:grid md:grid-cols-12 md:items-end">
          <address className="text-sm leading-[1.9] font-medium text-cream/70 not-italic md:col-span-5">
            <span className="block font-display text-cream">{footer.companyName}</span>
            {footer.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <YoakLogo className="dy-cycle h-auto w-full md:col-span-7" />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t-2 border-cream/15 pt-6 md:mt-16 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-xs text-cream/60">© 2025 Yoak, LLC.</p>
          <a href="#top" className="font-display text-xs text-cream/80 transition-colors hover:text-acid">
            back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
