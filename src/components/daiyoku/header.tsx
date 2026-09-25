"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { nav } from "@/content/site";
import { YoakLogo } from "../logos";
import { ModeToggle } from "../mode";
import { Burst, EASE, Flower, POP } from "./parts";

// ナビのホバー色（Tailwind が拾えるよう、クラス名は丸ごと書く）
const HOVERS = [
  "hover:bg-acid",
  "hover:bg-hot",
  "hover:bg-volt hover:text-cream",
  "hover:bg-tang",
  "hover:bg-grape",
  "hover:bg-acid",
  "hover:bg-hot",
];
const MENU_COLORS = ["text-acid", "text-cream", "text-volt", "text-ink", "text-acid", "text-cream", "text-volt"];

export function DyHeader() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 160);
  });

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: hidden && !open ? -100 : 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5">
          <a
            href="#top"
            aria-label="Yoak トップへ"
            className="block rounded-full border-2 border-ink bg-ink px-4 py-2.5 text-cream transition-transform duration-300 hover:-rotate-6"
          >
            <YoakLogo className="h-4 w-auto md:h-[18px]" />
          </a>

          <nav className="hidden lg:block" aria-label="メイン">
            <ul className="flex gap-1 rounded-full border-2 border-ink bg-cream/90 p-1 backdrop-blur">
              {nav.map((item, i) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`block rounded-full px-4 py-2 font-display text-xs tracking-[0.04em] transition-[background-color,color,rotate] duration-300 hover:-rotate-3 ${HOVERS[i % HOVERS.length]}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle tone="daiyoku" />
            <button
              type="button"
              className="relative z-50 rounded-full border-2 border-ink bg-ink px-4 py-2 font-display text-xs text-cream lg:hidden"
              aria-expanded={open}
              aria-controls="dy-mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "close" : "menu"}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="dy-mobile-menu"
            className="fixed inset-0 z-30 flex flex-col overflow-x-hidden overflow-y-auto bg-hot px-5 pt-28 pb-12 lg:hidden"
            initial={{ clipPath: "circle(0% at 90% 4%)" }}
            animate={{ clipPath: "circle(150% at 90% 4%)" }}
            exit={{ clipPath: "circle(0% at 90% 4%)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Burst fill="var(--color-acid)" className="dy-spin pointer-events-none absolute -top-10 -left-12 size-48" />
            <Flower fill="var(--color-volt)" className="dy-float pointer-events-none absolute right-6 bottom-40 size-28" />
            <ul className="relative mt-auto space-y-1">
              {nav.map((item, i) => (
                <li key={item.href}>
                  <motion.a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`inline-block font-display text-[13vw] leading-[1.1] ${MENU_COLORS[i % MENU_COLORS.length]}`}
                    style={{ WebkitTextStroke: "2px var(--color-ink)" }}
                    initial={{ x: -60, opacity: 0, rotate: -6 }}
                    animate={{ x: 0, opacity: 1, rotate: i % 2 === 0 ? -2 : 2 }}
                    transition={{ ...POP, delay: 0.15 + i * 0.05 }}
                  >
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
