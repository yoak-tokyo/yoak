"use client";

import { useState } from "react";
import { DirectionA } from "./daiyoku/directions/a";
import { DirectionB } from "./daiyoku/directions/b";
import { DirectionC } from "./daiyoku/directions/c";

const DIRECTIONS = [
  { id: "a", name: "A", Component: DirectionA },
  { id: "b", name: "B", Component: DirectionB },
  { id: "c", name: "C", Component: DirectionC },
] as const;

// 大欲モードの方向性（KV と About）を切り替えて比べる
export function DaiyokuLab() {
  const [current, setCurrent] = useState<(typeof DIRECTIONS)[number]["id"]>("a");
  const { Component } = DIRECTIONS.find((d) => d.id === current)!;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 gap-1 rounded-full border border-white/20 bg-black/80 p-1 font-en text-xs text-white backdrop-blur">
        {DIRECTIONS.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={current === d.id}
            onClick={() => {
              setCurrent(d.id);
              window.scrollTo(0, 0);
            }}
            className={`rounded-full px-4 py-2 transition-colors ${current === d.id ? "bg-acid text-black" : "hover:bg-white/10"}`}
          >
            {d.name}
          </button>
        ))}
      </div>
      <Component key={current} />
    </>
  );
}
