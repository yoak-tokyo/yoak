"use client";

import { useState } from "react";
import { Opening } from "./opening";

export function OpeningLab() {
  const [run, setRun] = useState(0);

  return (
    <main className="min-h-svh bg-paper px-5 py-24 md:px-10">
      <Opening key={run} />

      <div className="mx-auto max-w-[720px]">
        <p className="label text-mute">preview</p>
        <h1 className="mt-4 font-en text-4xl font-medium tracking-tight md:text-5xl">Opening</h1>
        <p className="mt-6 text-sm leading-[2.1] text-mute">
          トップページと同じオープニングを再生します。幕が上がったあとの白い画面は、トップページの KV の代わりです。
        </p>
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="label mt-10 border-b border-ink pb-1 transition-opacity hover:opacity-60"
        >
          replay ↻
        </button>
      </div>
    </main>
  );
}
