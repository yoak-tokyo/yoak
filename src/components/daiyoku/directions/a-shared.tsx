"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

// prefers-reduced-motion を購読する。スクロール連動・マウス連動の演出をここで止める
export function useReducedMotionPref() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// 方向性 A 専用の CSS（globals.css は触らないので、コンポーネント内で完結させる）
export function DirectionAStyle() {
  return (
    <style>{`
      @keyframes dyk-a-scroll {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
      @keyframes dyk-a-blink {
        50%, 100% { opacity: 0; }
      }
      .dyk-a-cursor {
        animation: dyk-a-blink 1s steps(1, end) infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .dyk-a-cursor { animation: none; }
      }
    `}</style>
  );
}
