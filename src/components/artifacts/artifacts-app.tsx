"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { errorMessage, getMe, listArtifacts, type Artifact, type Me } from "./api";
import { ArtifactForm } from "./artifact-form";
import { ArtifactList, type ChipFilter, type ListStatus } from "./artifact-list";
import { btnPrimary } from "./styles";

// 一覧・登録・編集を 1 ページで切り替える（静的書き出しのまま動かすため、画面はブラウザの中で切り替える）
type View = { name: "list" } | { name: "new" } | { name: "edit"; artifact: Artifact };

type Loaded = { ok: true; items: Artifact[]; me: Me } | { ok: false; message: string };

/** 一覧とログイン中の人（メール・名前）を一緒に取る */
async function loadAll(): Promise<Loaded> {
  try {
    const [items, me] = await Promise.all([listArtifacts(), getMe()]);
    return { ok: true, items, me };
  } catch (err) {
    return { ok: false, message: errorMessage(err) };
  }
}

export function ArtifactsApp() {
  const [view, setView] = useState<View>({ name: "list" });
  const [items, setItems] = useState<Artifact[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [status, setStatus] = useState<ListStatus>({ state: "loading" });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ChipFilter>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const applyLoaded = (result: Loaded) => {
    if (result.ok) {
      setItems(result.items);
      setMe(result.me);
      setStatus({ state: "ready" });
    } else {
      setStatus({ state: "error", message: result.message });
    }
  };

  useEffect(() => {
    let alive = true;
    void loadAll().then((result) => {
      if (alive) applyLoaded(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  // いま開いている画面。保存・削除の完了時に、その画面がまだ開いているかを確かめる
  const viewRef = useRef<View>(view);

  const go = (next: View) => {
    viewRef.current = next;
    setView(next);
    window.scrollTo({ top: 0 });
  };

  const reload = () => void loadAll().then(applyLoaded);

  const backToList = () => {
    go({ name: "list" });
    reload();
  };

  /** 保存・削除が終わったとき。待つあいだに別の画面へ移っていたら、そちらの入力を消さないよう一覧へは戻さない */
  const afterMutation = (from: View, message: string) => {
    showToast(message);
    if (viewRef.current === from) backToList();
    else reload();
  };

  const onLogo = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (view.name !== "list") backToList();
  };

  return (
    <div className="min-h-dvh text-[14px] leading-[1.8]">
      <header className="flex items-center justify-between gap-4 border-b border-line bg-paper px-[clamp(16px,4vw,40px)] py-[18px]">
        <a
          href="/artifacts"
          onClick={onLogo}
          aria-label="一覧へ"
          className="inline-flex items-baseline gap-2.5 font-en text-[19px] font-semibold tracking-[-0.01em] no-underline"
        >
          Yoak
          <span className="text-[12px] font-normal tracking-[0.06em] text-mute">artifacts</span>
        </a>
        <button
          type="button"
          className={btnPrimary}
          // すでに登録画面なら何もしない（保存中に押しても、開いているフォームのまま完了を受け取れるように）
          onClick={() => {
            if (viewRef.current.name !== "new") go({ name: "new" });
          }}
        >
          ＋ 登録する
        </button>
      </header>

      <main>
        {view.name === "list" ? (
          <ArtifactList
            items={items}
            status={status}
            me={me?.email ?? null}
            q={q}
            filter={filter}
            onQueryChange={setQ}
            onFilterChange={setFilter}
            onClear={() => {
              setQ("");
              setFilter(null);
            }}
            onEdit={(artifact) => go({ name: "edit", artifact })}
          />
        ) : (
          <ArtifactForm
            // 新規と編集、別の行の編集で入力を持ち越さない
            key={view.name === "edit" ? view.artifact.id : "new"}
            editing={view.name === "edit" ? view.artifact : null}
            // 自分の名前がまだ無いときだけ、登録の画面で名前を聞く（AD-16）。まだ取れていなければ null
            askName={view.name === "new" ? (me === null ? null : me.name === null) : false}
            onMe={setMe}
            onBack={() => go({ name: "list" })}
            onSaved={(_, created) => afterMutation(view, created ? "登録しました" : "保存しました")}
            onDeleted={() => afterMutation(view, "削除しました")}
          />
        )}
      </main>

      {toast && (
        <div
          role="status"
          className="fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 bg-ink px-[18px] py-3 text-[13px] text-paper"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
