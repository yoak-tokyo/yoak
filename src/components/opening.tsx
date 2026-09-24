"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { YoakLogo } from "./logos";

const EASE = [0.76, 0, 0.24, 1] as const;
const FILL_EASE = [0.65, 0, 0.35, 1] as const;

// 満ち始めるまで・満ちる時間・満ちてから幕が上がるまで（秒）
const FILL_DELAY = 0.35;
const FILL_DURATION = 1.6;
const HOLD = 0.3;
const VISIBLE = FILL_DELAY + FILL_DURATION + HOLD;

// KV はこの時刻を基準に登場する（幕が上がり始めて少し後）
export const OPENING_DURATION = VISIBLE + 0.7;

// 薄く置いたロゴが下から白く満ちていき、満ちきったら幕が上がるオープニング
export function Opening() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => {
      setVisible(false);
      document.documentElement.style.overflow = "";
    }, VISIBLE * 1000);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
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
          <motion.div exit={{ y: -40, opacity: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <YoakLogo className="h-9 w-auto text-white/15 md:h-12" />
              <motion.div
                className="absolute inset-0"
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                animate={{ clipPath: "inset(0% 0 0 0)" }}
                transition={{ duration: FILL_DURATION, ease: FILL_EASE, delay: FILL_DELAY }}
              >
                <YoakLogo className="h-9 w-auto md:h-12" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
