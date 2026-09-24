"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { nav } from "@/content/site";
import { YoakLogo } from "./logos";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header() {
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
        className="fixed inset-x-0 top-0 z-40 text-white mix-blend-difference"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden && !open ? -80 : 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: hidden ? 0 : 0.2 }}
      >
        <div className="flex items-center justify-between px-5 py-5 md:px-10 md:py-7">
          <a href="#top" aria-label="Yoak トップへ" className="block">
            <YoakLogo className="h-[18px] w-auto md:h-5" />
          </a>
          <nav className="hidden md:block" aria-label="メイン">
            <ul className="flex gap-9">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="group label relative block py-1">
                    {item.label}
                    <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            className="label relative z-50 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-30 flex flex-col justify-end bg-ink px-5 pb-16 text-white md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <ul className="space-y-3">
              {nav.map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <motion.a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block font-en text-5xl tracking-tight"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.05 }}
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
