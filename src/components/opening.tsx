"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { YoakLogo } from "./logos";

const EASE = [0.76, 0, 0.24, 1] as const;
export const OPENING_DURATION = 1.9;

// ロゴが浮かび上がってから幕が上がるオープニング
export function Opening() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => {
      setVisible(false);
      document.documentElement.style.overflow = "";
    }, OPENING_DURATION * 1000 - 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-ink text-white"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: EASE }}
          aria-hidden="true"
        >
          <motion.div
            className="overflow-hidden"
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <motion.div
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <YoakLogo className="h-9 w-auto md:h-12" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
