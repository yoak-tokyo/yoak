"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { member, type MemberItem, type MemberLink } from "@/content/site";
import { DyLabel, POP, PopText } from "./parts";

const LINK_LABELS: Record<MemberLink["type"], string> = {
  x: "X",
  note: "note",
  instagram: "Instagram",
  portfolio: "portfolio",
};

// ポラロイドの傾き・マスキングテープ・吹き出しの色
const CARDS = [
  { rotate: -3, tape: "bg-acid", bubble: "bg-hot" },
  { rotate: 2.2, tape: "bg-hot", bubble: "bg-acid" },
  { rotate: -1.4, tape: "bg-volt", bubble: "bg-tang" },
];

export function DyMember({ items }: { items: MemberItem[] }) {
  return (
    <section id="member" className="dy-dots relative overflow-hidden bg-cream py-32 text-ink md:py-44">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <DyLabel>{member.label}</DyLabel>
        <h2 className="mt-8 font-display text-[clamp(3rem,9vw,8rem)] leading-none">
          <PopText
            text={member.heading}
            colors={["var(--color-ink)", "var(--color-hot)", "var(--color-volt)", "var(--color-tang)"]}
          />
        </h2>

        <ul className="mt-20 grid gap-20 md:mt-28 md:grid-cols-2 md:gap-12 lg:grid-cols-3">
          {items.map((m, i) => {
            const card = CARDS[i % CARDS.length];
            return (
              <motion.li
                key={m.en}
                initial={{ opacity: 0, y: 120, rotate: card.rotate * 4 }}
                whileInView={{ opacity: 1, y: 0, rotate: card.rotate }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ ...POP, delay: i * 0.12 }}
              >
                <div className="group relative border-[3px] border-ink bg-white p-4 pb-7 shadow-[10px_10px_0_var(--color-ink)] transition-[translate,rotate] duration-300 hover:-translate-y-2 hover:rotate-1">
                  <span
                    aria-hidden="true"
                    className={`absolute -top-4 left-1/2 z-10 h-8 w-28 -translate-x-1/2 -rotate-3 border-2 border-ink/20 opacity-90 ${card.tape}`}
                  />

                  <div className="relative aspect-square overflow-hidden border-[3px] border-ink bg-mist">
                    {m.photo ? (
                      <Image
                        src={m.photo}
                        alt={m.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="grid h-full place-items-center font-display text-7xl">
                        {m.en
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </span>
                    )}
                  </div>

                  {/* I want は写真に重なる吹き出し */}
                  <div
                    className={`relative z-10 -mt-10 ml-auto w-[88%] rotate-2 rounded-2xl border-[3px] border-ink px-4 py-3 ${card.bubble}`}
                  >
                    <p className="font-display text-[10px] tracking-[0.12em]">I WANT</p>
                    <p className="mt-1 text-[15px] leading-[1.6] font-bold">{m.yoku}</p>
                  </div>

                  <div className="mt-6 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl">{m.name}</h3>
                      <p className="mt-1 font-en text-sm font-medium tracking-[0.04em] text-ink/60">{m.en}</p>
                    </div>
                    <span className="shrink-0 rounded-full border-2 border-ink bg-ink px-3 py-1 font-display text-[10px] text-cream">
                      {m.role}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-[2] font-medium text-ink/85">{m.bio}</p>

                  {m.links.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {m.links.map((link) => (
                        <li key={link.type}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${m.name}の${LINK_LABELS[link.type]}（新しいタブで開く）`}
                            className="block rounded-full border-2 border-ink px-3 py-1 font-display text-[11px] transition-colors duration-300 hover:bg-ink hover:text-cream"
                          >
                            {LINK_LABELS[link.type]}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
