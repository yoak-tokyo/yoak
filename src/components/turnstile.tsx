"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile（ボット判定）のウィジェット。
// サイトキーは公開して問題ない値なのでコードに持つ（ホスト名は yoak.tokyo とプレビューの workers.dev のみ許可）。
// `next dev` では Cloudflare のテスト用キー（常に成功）を使う。
// NEXT_PUBLIC_TURNSTILE_SITE_KEY を設定すればそちらが優先される。
const PRODUCTION_SITE_KEY = "0x4AAAAAAFCjQrKPu6PEcBa-";
const TEST_SITE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??
  (process.env.NODE_ENV === "production" ? PRODUCTION_SITE_KEY : TEST_SITE_KEY);

type TurnstileApi = {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(id: string): void;
  remove(id: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => (window.turnstile ? resolve(window.turnstile) : reject()));
    script.addEventListener("error", () => reject(new Error("Turnstile の読み込みに失敗しました")));
  });
}

export function Turnstile({
  onToken,
  resetKey,
}: {
  onToken: (token: string) => void;
  // 値が変わるとウィジェットをリセットする（送信失敗後の再試行用）
  resetKey?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !ref.current) return;
    let cancelled = false;
    loadScript()
      .then((api) => {
        if (cancelled || !ref.current) return;
        widgetId.current = api.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "light",
          language: "ja",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => onTokenRef.current(""),
        });
      })
      .catch(() => onTokenRef.current(""));
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetKey && widgetId.current) {
      window.turnstile?.reset(widgetId.current);
      onTokenRef.current("");
    }
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className="min-h-[65px]" />;
}
