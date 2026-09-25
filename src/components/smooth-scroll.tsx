"use client";

import Lenis from "lenis";
import { useEffect } from "react";

let current: Lenis | null = null;

// ページの先頭へ即座に戻す（モード切り替え時など）
export function scrollToTopNow() {
  if (current) current.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });
    current = lenis;
    return () => {
      lenis.destroy();
      current = null;
    };
  }, []);
  return null;
}
