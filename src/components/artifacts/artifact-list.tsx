"use client";

import { BUSINESSES, type Artifact } from "./api";
import { btnLine, chip, chipOn, wrap } from "./styles";

/** 絞り込み。事業かタグのどちらか 1 つ（モックと同じく、チップは 1 つだけ選べる） */
export type ChipFilter = { kind: "business" | "tag"; value: string } | null;

export type ListStatus = { state: "loading" } | { state: "error"; message: string } | { state: "ready" };

/** 一覧の日付。登録日を YYYY.MM.DD で出す */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** 登録した人の表示。名前があればそれ、無ければメールの @ より前（AD-16） */
const authorName = (it: Artifact) => it.author_name?.trim() || it.author_email.split("@")[0] || it.author_email;

/** キーワード（スペースで AND）とチップで絞る。並びは API の新しい順のまま（AD-12） */
export function filterArtifacts(items: Artifact[], q: string, filter: ChipFilter): Artifact[] {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((it) => {
    if (filter?.kind === "business" && it.business !== filter.value) return false;
    if (filter?.kind === "tag" && !it.tags.includes(filter.value)) return false;
    const hay = [it.title, it.description, it.business, ...it.tags, it.author_email, it.author_name ?? ""].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** チップに出す事業（決まった順、登録があるものだけ）とタグ（多い順） */
function chipValues(items: Artifact[]) {
  const tagCount = new Map<string, number>();
  for (const it of items) for (const t of it.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  const businesses = BUSINESSES.filter((b) => items.some((it) => it.business === b));
  const tags = [...tagCount.keys()].sort(
    (a, b) => (tagCount.get(b) ?? 0) - (tagCount.get(a) ?? 0) || a.localeCompare(b, "ja"),
  );
  return { businesses, tags };
}

export function ArtifactList({
  items,
  status,
  me,
  q,
  filter,
  onQueryChange,
  onFilterChange,
  onClear,
  onEdit,
}: {
  items: Artifact[];
  status: ListStatus;
  me: string | null;
  q: string;
  filter: ChipFilter;
  onQueryChange: (q: string) => void;
  onFilterChange: (filter: ChipFilter) => void;
  onClear: () => void;
  onEdit: (artifact: Artifact) => void;
}) {
  const list = filterArtifacts(items, q, filter);
  const { businesses, tags } = chipValues(items);
  const isOn = (kind: "business" | "tag", value: string) => filter?.kind === kind && filter.value === value;

  const chipButton = (kind: "business" | "tag", value: string) => (
    <button
      key={`${kind}:${value}`}
      type="button"
      className={`${chip} ${isOn(kind, value) ? chipOn : ""}`}
      aria-pressed={isOn(kind, value)}
      onClick={() => onFilterChange({ kind, value })}
    >
      {value}
    </button>
  );

  return (
    <>
      <section className={`${wrap} flex flex-wrap items-end justify-between gap-4 pt-8 pb-5`}>
        <div>
          <p className="label text-mute">artifacts</p>
          <h1 className="mt-1.5 text-[clamp(1.375rem,2.6vw,1.75rem)] font-medium text-balance">アーティファクト一覧</h1>
        </div>
        <p className="label text-mute" aria-live="polite">
          {status.state === "ready" &&
            (list.length === items.length ? `${items.length} 件` : `${items.length} 件中 ${list.length} 件`)}
        </p>
      </section>

      <div className="sticky top-[env(safe-area-inset-top,0px)] z-10 border-y border-line bg-paper">
        <div
          className={`${wrap} grid grid-cols-[minmax(0,360px)_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 py-2.5 max-[760px]:grid-cols-[minmax(0,1fr)]`}
        >
          <div className="relative">
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 fill-none stroke-mute [stroke-width:1.6]"
            >
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3.5 3.5" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") onQueryChange("");
              }}
              placeholder="キーワードで探す（スペースで AND）"
              aria-label="キーワードで探す"
              className="min-h-10 w-full appearance-none rounded-none border border-line bg-paper pr-3.5 pl-10 text-[14px] focus:border-ink focus:outline-none"
            />
          </div>
          <div
            role="group"
            aria-label="タグで絞り込む"
            className="flex gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <button
              type="button"
              className={`${chip} ${!filter ? chipOn : ""}`}
              aria-pressed={!filter}
              onClick={() => onFilterChange(null)}
            >
              すべて
            </button>
            {businesses.map((b) => chipButton("business", b))}
            <span aria-hidden="true" className="h-5 w-px shrink-0 self-center bg-line" />
            {tags.map((t) => chipButton("tag", t))}
          </div>
        </div>
      </div>

      <section className={wrap}>
        {status.state === "loading" && <p className="py-14 text-mute">読み込み中…</p>}
        {status.state === "error" && (
          <div role="alert" className="grid justify-items-start gap-2 py-14">
            <p>{status.message}</p>
          </div>
        )}
        {status.state === "ready" && items.length === 0 && (
          <div className="grid justify-items-start gap-2 py-14">
            <p>まだ登録はありません。</p>
          </div>
        )}
        {status.state === "ready" && items.length > 0 && list.length === 0 && (
          <div className="grid justify-items-start gap-2 py-14">
            <p>
              {q && `「${q}」`}
              {filter && `${q ? "と" : ""}${filter.kind === "business" ? "事業" : "タグ"}「${filter.value}」`}
              に合うものはありません。
            </p>
            <p className="text-mute">ことばを変えるか、タグを外してください。</p>
            <button type="button" className={`${btnLine} mt-3`} onClick={onClear}>
              条件をクリア
            </button>
          </div>
        )}
        {status.state === "ready" && list.length > 0 && (
          <div role="list" className="group/rows pb-[120px]">
            <div
              aria-hidden="true"
              className="label grid grid-cols-[5.5rem_8rem_minmax(0,1fr)_9rem_6rem_2.75rem] items-center gap-4 border-b border-line py-2.5 text-mute max-[760px]:hidden"
            >
              <span>date</span>
              <span>business</span>
              <span>title</span>
              <span>type</span>
              <span>by</span>
              <span />
            </div>
            {list.map((it) => (
              <ArtifactRow key={it.id} artifact={it} mine={me !== null && it.author_email === me} onEdit={onEdit} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function ArtifactRow({
  artifact: it,
  mine,
  onEdit,
}: {
  artifact: Artifact;
  mine: boolean;
  onEdit: (artifact: Artifact) => void;
}) {
  return (
    <div
      role="listitem"
      className="relative grid grid-cols-[5.5rem_8rem_minmax(0,1fr)_9rem_6rem_2.75rem] items-baseline gap-4 border-b border-line py-3.5 transition-[opacity,background-color] duration-[400ms] group-hover/rows:opacity-40 hover:bg-mist hover:opacity-100! focus-within:bg-mist focus-within:opacity-100! has-[[data-title]:focus-visible]:outline-2 has-[[data-title]:focus-visible]:-outline-offset-2 has-[[data-title]:focus-visible]:outline-ink max-[760px]:grid-cols-[auto_minmax(0,1fr)_44px] max-[760px]:items-start max-[760px]:gap-x-3 max-[760px]:gap-y-1 max-[760px]:[grid-template-areas:'date_biz_open'_'main_main_open'_'type_by_open'] max-[760px]:group-hover/rows:opacity-100"
    >
      <time
        dateTime={it.created_at}
        className="font-en text-[13px] text-mute tabular-nums max-[760px]:text-[12px] max-[760px]:[grid-area:date]"
      >
        {formatDate(it.created_at)}
      </time>
      <span className="text-[12px] max-[760px]:[grid-area:biz]">{it.business || "—"}</span>
      <div className="grid min-w-0 gap-0.5 max-[760px]:[grid-area:main]">
        {/* 行全体を claude.ai へのリンクにする（詳細ページは作らない。AD-12） */}
        <a
          href={it.url}
          target="_blank"
          rel="noopener noreferrer"
          data-title
          className="text-[15px] font-medium no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {it.title}
        </a>
        <p className="truncate text-[12px] text-mute max-[760px]:line-clamp-1 max-[760px]:whitespace-normal">
          {it.description}
        </p>
      </div>
      <span className="text-[12px] text-mute max-[760px]:[grid-area:type]">
        {it.tags.map((t) => `#${t}`).join(" ") || "—"}
      </span>
      <span className="min-w-0 text-[12px] max-[760px]:justify-self-end max-[760px]:[grid-area:by]">
        {mine ? (
          <>
            <span className="border-b border-ink">あなた</span>
            <button
              type="button"
              className="relative z-[1] block cursor-pointer pt-1 text-[12px] underline underline-offset-4 max-[760px]:-my-3 max-[760px]:inline-block max-[760px]:py-3 max-[760px]:pl-3"
              onClick={() => onEdit(it)}
            >
              編集する
            </button>
          </>
        ) : (
          <span className="block truncate" title={it.author_email}>
            {authorName(it)}
          </span>
        )}
      </span>
      <a
        href={it.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${it.title} を claude.ai で開く`}
        title="claude.ai で開く"
        className="relative z-[1] grid size-10 place-items-center self-center justify-self-end border border-line font-en no-underline transition-[background-color,color] duration-300 hover:border-ink hover:bg-ink hover:text-paper max-[760px]:size-11 max-[760px]:[grid-area:open]"
      >
        ↗
      </a>
    </div>
  );
}
