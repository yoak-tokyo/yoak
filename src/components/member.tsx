"use client";

import { motion } from "motion/react";
import { member } from "@/content/site";
import { MaskLines, Reveal, SectionLabel } from "./reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Member() {
  return (
    <section id="member" className="bg-paper py-32 md:py-48">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionLabel no="05">{member.label}</SectionLabel>
        <h2 className="mt-8 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.5] font-medium">
          <MaskLines lines={[member.heading]} />
        </h2>

        <ul className="mt-16 grid gap-16 md:mt-24 md:grid-cols-2 md:gap-10">
          {member.items.map((m, i) => (
            <li key={m.en} className="group">
              <motion.div
                className="relative aspect-[4/5] overflow-hidden bg-mist"
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 1.4, ease: EASE, delay: i * 0.15 }}
              >
                {/* TODO: メンバー写真に差し替え */}
                <div className="absolute inset-0 grid place-items-center transition-transform duration-[1.4s] ease-out-expo group-hover:scale-105">
                  <span className="font-en text-[7rem] leading-none tracking-tight text-ink/10 italic">
                    {m.en
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                </div>
                <div className="absolute inset-x-5 bottom-5 bg-paper/90 p-5 backdrop-blur md:inset-x-6 md:bottom-6">
                  <p className="label text-mute">My desire</p>
                  <p className="mt-2 text-[15px] leading-[1.8] font-medium">{m.yoku}</p>
                </div>
              </motion.div>

              <Reveal delay={0.1 + i * 0.15} className="mt-6 flex items-baseline justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-medium tracking-[0.08em]">{m.name}</h3>
                  <p className="mt-2 font-en text-sm tracking-[0.06em] text-mute">{m.en}</p>
                </div>
                <p className="text-xs tracking-[0.1em] text-mute">{m.role}</p>
              </Reveal>
              <Reveal as="p" delay={0.15 + i * 0.15} className="mt-5 text-sm leading-[2.1] text-ink/80">
                {m.bio}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
