// アーティファクト共有の画面で繰り返し使うクラス。見た目は docs/artifacts/mocks/b-index.html（案B）に合わせる。
// globals.css に無い色（削除の赤）は、ここでだけ値を書く。

/** 中身の幅（モックの .wrap） */
export const wrap = "mx-auto w-full max-w-[1280px] px-[clamp(16px,4vw,40px)]";

export const danger = "text-[#c2341b]";

export const btnPrimary =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2.5 bg-ink px-5 text-[14px] tracking-[0.06em] text-paper no-underline transition-opacity duration-300 hover:opacity-85 disabled:cursor-default disabled:opacity-50";

export const btnLine =
  "inline-flex min-h-11 cursor-pointer items-center border border-ink px-[18px] text-[14px] hover:bg-ink hover:text-paper";

export const btnText = "min-h-11 cursor-pointer px-2 text-[14px] underline underline-offset-4";

export const btnDanger = "min-h-11 cursor-pointer bg-[#c2341b] px-5 text-[14px] text-white disabled:opacity-50";

/** タグ・事業のチップ（モックの .chip。案B の大きさ） */
export const chip =
  "inline-flex min-h-[30px] shrink-0 cursor-pointer items-center whitespace-nowrap border border-line px-2.5 text-[12px] transition-[border-color,background-color] duration-300 hover:border-ink";
export const chipOn = "border-ink bg-ink text-paper";

/** 1 行の入力欄（モックの .field input） */
export const input =
  "min-h-12 w-full appearance-none rounded-none border border-line bg-paper px-3.5 py-2.5 text-[16px] focus:border-ink focus:outline-none aria-[invalid=true]:border-[#c2341b]";
