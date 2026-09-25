"use client";

// 大欲モードの方向性 A: KINETIC TYPE
// 黒地に白の巨大タイポが画面を支配し、スクロールとマウスに反応して伸び縮み・塗り分けされる。
// 蛍光グリーン（acid）は句点・カーソル・「欲」の一文字だけに絞る。
import { DirectionAAbout } from "./a-about";
import { DirectionAKv } from "./a-kv";
import { DirectionAStyle } from "./a-shared";

export function DirectionA() {
  return (
    <>
      <DirectionAStyle />
      <DirectionAKv />
      <DirectionAAbout />
    </>
  );
}
