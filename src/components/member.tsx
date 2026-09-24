"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { member, type MemberItem, type MemberLink } from "@/content/site";
import { Reveal, SectionLabel } from "./reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

const LINK_LABELS: Record<MemberLink["type"], string> = {
  x: "X",
  note: "note",
  instagram: "Instagram",
  portfolio: "portfolio",
};

export function Member({ items }: { items: MemberItem[] }) {
  return (
    <section id="member" className="bg-paper py-32 md:py-48">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionLabel>{member.label}</SectionLabel>
        <Reveal as="h2" className="mt-8 font-en text-4xl font-medium tracking-tight md:text-5xl">
          {member.heading}
        </Reveal>

        <ul className="mt-16 grid gap-16 md:mt-24 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
          {items.map((m, i) => (
            <li key={m.en} className="group">
              <motion.div
                className="relative aspect-[4/5] overflow-hidden bg-mist"
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 1.4, ease: EASE, delay: i * 0.15 }}
              >
                <div className="absolute inset-0 transition-transform duration-[1.4s] ease-out-expo group-hover:scale-105">
                  {m.photo ? (
                    <Image
                      src={m.photo}
                      alt={m.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center font-en text-[7rem] leading-none tracking-tight text-ink/10 italic">
                      {m.en
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </span>
                  )}
                </div>
              </motion.div>

              <Reveal delay={0.1 + i * 0.15} className="mt-9 flex items-baseline justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-medium tracking-[0.08em]">{m.name}</h3>
                  <p className="mt-2 font-en text-sm tracking-[0.06em] text-mute">{m.en}</p>
                </div>
                <p className="text-xs tracking-[0.1em] text-mute">{m.role}</p>
              </Reveal>
              <Reveal as="p" delay={0.15 + i * 0.15} className="mt-5 text-sm leading-[2.1] text-ink/80">
                {m.bio}
              </Reveal>
              <Reveal delay={0.2 + i * 0.15} className="mt-6 bg-mist p-5">
                <p className="label text-mute">I want</p>
                <p className="mt-2 text-[15px] leading-[1.8] font-medium">{m.yoku}</p>
              </Reveal>
              {m.links.length > 0 && (
                <Reveal delay={0.25 + i * 0.15} className="mt-5">
                  <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {m.links.map((link, li) => (
                      <li key={link.type} className="flex items-center gap-3">
                        {li > 0 && (
                          <span aria-hidden="true" className="text-xs text-ink/20">
                            /
                          </span>
                        )}
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${m.name}の${LINK_LABELS[link.type]}（新しいタブで開く）`}
                          className="label text-mute transition-colors hover:text-ink"
                        >
                          {LINK_LABELS[link.type]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
