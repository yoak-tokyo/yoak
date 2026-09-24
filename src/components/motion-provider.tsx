"use client";

import { MotionConfig } from "motion/react";

// OS の「視差効果を減らす」設定がオンなら、移動系のアニメーションを止める
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
