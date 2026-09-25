"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { scrollToTopNow } from "./smooth-scroll";

// サイトの表示モード。コンテンツは同じで、見た目だけを切り替える。
// - yoak   : いつもの Yoak（モノトーン）
// - daiyoku: スーパー大欲モード（超グラフィカル・カラフル）
export type Mode = "yoak" | "daiyoku";

const STORAGE_KEY = "yoak-mode";

// 大欲モードは方向性を検討中のため、公開サイトではスイッチを出さず Yoak だけを表示する。
// 方向性の比較は /preview/daiyoku で行う。公開するときは true に戻す
export const MODE_SWITCH_ENABLED = false;

// ---------- 選んだモードの保存（localStorage。?mode=daiyoku でも開ける） ----------

const listeners = new Set<() => void>();
let current: Mode | null = null;

function readInitial(): Mode {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("mode");
    if (fromUrl === "daiyoku" || fromUrl === "yoak") return fromUrl;
    return window.localStorage.getItem(STORAGE_KEY) === "daiyoku" ? "daiyoku" : "yoak";
  } catch {
    return "yoak";
  }
}

const getSnapshot = () => (current ??= readInitial());
const getServerSnapshot = (): Mode => "yoak";
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function storeMode(mode: Mode) {
  current = mode;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // 保存できなくても、このページ内では切り替わる
  }
  // ?mode= で開いていた場合、再読み込みで元のモードに戻らないよう URL から外す
  const url = new URL(window.location.href);
  if (url.searchParams.has("mode")) {
    url.searchParams.delete("mode");
    window.history.replaceState(window.history.state, "", url);
  }
  listeners.forEach((listener) => listener());
}

// ---------- コンテキスト ----------

const ModeContext = createContext<{ mode: Mode; switchMode: (next: Mode) => void }>({
  mode: "yoak",
  switchMode: () => {},
});

export const useMode = () => useContext(ModeContext);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [target, setTarget] = useState<Mode | null>(null);

  const switchMode = useCallback(
    (next: Mode) => {
      if (next === mode || target) return;
      setTarget(next);
    },
    [mode, target],
  );

  // html に今のモードを書いておく（背景色や選択色の切り替えに使う）
  useEffect(() => {
    if (!MODE_SWITCH_ENABLED) return;
    document.documentElement.dataset.mode = mode;
    return () => {
      delete document.documentElement.dataset.mode;
    };
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, switchMode }}>
      {children}
      <ModeTransition
        target={target}
        onCovered={() => {
          if (target) storeMode(target);
          scrollToTopNow();
        }}
        onDone={() => setTarget(null)}
      />
    </ModeContext.Provider>
  );
}

// 今のモードに合わせて、どちらかのサイトだけを描画する
export function ModeView({ yoak, daiyoku }: { yoak: React.ReactNode; daiyoku: React.ReactNode }) {
  const { mode } = useMode();
  return <>{MODE_SWITCH_ENABLED && mode === "daiyoku" ? daiyoku : yoak}</>;
}

// ---------- 切り替えの幕 ----------

const EASE = [0.76, 0, 0.24, 1] as const;
const DAIYOKU_STRIPES = ["var(--color-acid)", "var(--color-hot)", "var(--color-volt)", "var(--color-tang)", "var(--color-grape)"];
const YOAK_STRIPES = ["#111111", "#161616", "#111111", "#161616", "#111111"];

// 色の帯が下から画面を覆い、覆いきった瞬間にモードを切り替えて、上へ抜けていく
function ModeTransition({
  target,
  onCovered,
  onDone,
}: {
  target: Mode | null;
  onCovered: () => void;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"cover" | "reveal">("cover");
  const stripes = target === "daiyoku" ? DAIYOKU_STRIPES : YOAK_STRIPES;
  const last = stripes.length - 1;

  const handleStripeDone = () => {
    if (phase === "cover") {
      onCovered();
      setPhase("reveal");
    } else {
      setPhase("cover");
      onDone();
    }
  };

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          key="mode-transition"
          className="fixed inset-0 z-[80] flex"
          aria-hidden="true"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {stripes.map((color, i) => (
            <motion.div
              key={i}
              className="h-full flex-1"
              style={{ background: color, originY: phase === "cover" ? 1 : 0 }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: phase === "cover" ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
              onAnimationComplete={i === last ? handleStripeDone : undefined}
            />
          ))}
          <motion.p
            className={`absolute inset-0 grid place-items-center font-display leading-none ${
              target === "daiyoku" ? "text-[22vw] text-ink md:text-[16vw]" : "font-en text-[14vw] font-medium tracking-tight text-white md:text-[10vw]"
            }`}
            initial={{ opacity: 0, scale: 0.8, rotate: target === "daiyoku" ? -8 : 0 }}
            animate={
              phase === "cover"
                ? { opacity: 1, scale: 1, rotate: target === "daiyoku" ? -4 : 0 }
                : { opacity: 0, scale: 1.1, rotate: 0 }
            }
            transition={{ duration: 0.45, ease: EASE, delay: phase === "cover" ? 0.25 : 0 }}
          >
            {target === "daiyoku" ? "大欲" : "Yoak"}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- 切り替えスイッチ（言語切り替えのような 2 択） ----------

const OPTIONS: { id: Mode; label: string; title: string }[] = [
  { id: "yoak", label: "Yoak", title: "いつもの Yoak" },
  { id: "daiyoku", label: "大欲", title: "スーパー大欲モード" },
];

export function ModeToggle({ tone, className = "" }: { tone: Mode; className?: string }) {
  const { mode, switchMode } = useMode();
  if (!MODE_SWITCH_ENABLED) return null;

  if (tone === "yoak") {
    // いつものヘッダー（mix-blend-difference の白文字）になじむ細身のスイッチ
    return (
      <div role="group" aria-label="表示モード" className={`label flex items-center gap-1 rounded-full border border-white/40 p-0.5 ${className}`}>
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            title={o.title}
            aria-pressed={mode === o.id}
            onClick={() => switchMode(o.id)}
            className={`rounded-full px-3 py-1 transition-colors duration-300 ${
              mode === o.id ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="表示モード"
      className={`flex items-center gap-1 rounded-full border-2 border-ink bg-cream p-1 font-display text-xs ${className}`}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          title={o.title}
          aria-pressed={mode === o.id}
          onClick={() => switchMode(o.id)}
          className={`rounded-full px-3 py-1.5 transition-colors duration-300 ${
            mode === o.id ? (o.id === "daiyoku" ? "bg-hot text-ink" : "bg-ink text-cream") : "text-ink/60 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
