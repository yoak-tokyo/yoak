"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  BUSINESSES,
  createArtifact,
  deleteArtifact,
  errorMessage,
  getMe,
  listTags,
  updateArtifact,
  updateMyName,
  type Artifact,
  type ArtifactInput,
  type Me,
} from "./api";
import { btnDanger, btnLine, btnPrimary, btnText, chip, chipOn, danger, input } from "./styles";

// 入力の上限はモックに合わせる（API の上限より小さい）
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 200;
const TAGS_MAX = 5;
const TAG_MAX = 50;
// 自分の名前の上限（B-5 の PUT /api/artifacts/me と同じ）
const NAME_MAX = 30;

const URL_PATTERN = /^https:\/\/claude\.ai\/\S+$/;

type Errors = Partial<Record<"name" | "url" | "title" | "business", string>>;

function validate(d: ArtifactInput, name: string | null): Errors {
  const e: Errors = {};
  if (name !== null) {
    const n = name.trim();
    if (!n) e.name = "名前を入れてください。";
    else if ([...n].length > NAME_MAX) e.name = `名前は ${NAME_MAX} 字までです。`;
  }
  if (!d.url.trim()) e.url = "リンクを貼ってください。";
  else if (!URL_PATTERN.test(d.url.trim())) e.url = "claude.ai のリンクを貼ってください。https://claude.ai/ で始まるものです。";
  if (!d.title.trim()) e.title = "タイトルを入れてください。";
  if (!d.business) e.business = "事業を選んでください。";
  return e;
}

export function ArtifactForm({
  editing,
  askName,
  onMe,
  onBack,
  onSaved,
  onDeleted,
}: {
  /** 編集するときの元の登録。無ければ新規登録 */
  editing: Artifact | null;
  /**
   * 自分の名前がまだ無い。true なら「あなたの名前」の欄を出し、登録の前に保存する（AD-16）。
   * null はログイン中の人をまだ取れていない。新規登録ならその場で取り直してから決める
   */
  askName: boolean | null;
  /** ログイン中の人を取り直した・名前を保存できたとき（登録そのものが失敗しても、名前は保存済み） */
  onMe: (me: Me) => void;
  onBack: () => void;
  onSaved: (artifact: Artifact, created: boolean) => void;
  onDeleted: (id: string) => void;
}) {
  const isEdit = editing !== null;
  const [draft, setDraft] = useState<ArtifactInput>(() => ({
    url: editing?.url ?? "",
    title: editing?.title ?? "",
    description: editing?.description ?? "",
    business: editing?.business ?? "",
    tags: editing ? [...editing.tags] : [],
  }));
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tagText, setTagText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const nameId = useId();
  const urlId = useId();
  const titleId = useId();
  const descId = useId();
  const tagId = useId();
  const bizId = useId();

  // よく使うタグ（GET /api/artifacts/tags、使われている件数の多い順）。取れなければ候補を出さないだけ
  useEffect(() => {
    let alive = true;
    listTags()
      .then((tags) => {
        if (alive) setSuggestions(tags.map((t) => t.name));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const set = <K extends keyof ArtifactInput>(key: K, value: ArtifactInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const addTag = (raw: string) => {
    const t = raw.trim().replace(/^#/, "").slice(0, TAG_MAX);
    setTagText("");
    if (!t || draft.tags.includes(t) || draft.tags.length >= TAGS_MAX) return;
    set("tags", [...draft.tags, t]);
    tagInputRef.current?.focus();
  };

  const removeTag = (t: string) => set("tags", draft.tags.filter((x) => x !== t));

  const onTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && !e.nativeEvent.isComposing) {
      e.preventDefault();
      addTag(tagText);
    } else if (e.key === "Backspace" && !tagText && draft.tags.length) {
      set("tags", draft.tags.slice(0, -1));
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setSubmitError(null);
    // 名前を聞くのは新規登録のときだけ。名前の有無がまだ分からなければ、先に取り直す
    let askingName = !editing && askName === true;
    if (!editing && askName === null) {
      setBusy(true);
      try {
        const me = await getMe();
        onMe(me);
        askingName = me.name === null;
      } catch (err) {
        setSubmitError(errorMessage(err, "保存できませんでした。時間をおいて、もう一度お試しください。"));
        return;
      } finally {
        setBusy(false);
      }
    }
    const found = validate(draft, askingName ? name : null);
    setErrors(found);
    if (Object.keys(found).length) {
      // 描き直したあとで、最初のまちがいに移る
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus());
      return;
    }
    const body: ArtifactInput = {
      url: draft.url.trim(),
      title: draft.title.trim(),
      description: draft.description.trim(),
      business: draft.business,
      tags: draft.tags,
    };
    setBusy(true);
    try {
      // 名前は先に保存する。保存できたら欄は消え、登録が失敗してもやり直しで名前を聞き直さない
      if (askingName) onMe(await updateMyName(name.trim()));
      const saved = editing ? await updateArtifact(editing.id, body) : await createArtifact(body);
      onSaved(saved, !editing);
    } catch (err) {
      setSubmitError(errorMessage(err, "保存できませんでした。時間をおいて、もう一度お試しください。"));
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!editing || busy) return;
    setBusy(true);
    setSubmitError(null);
    try {
      await deleteArtifact(editing.id);
      onDeleted(editing.id);
    } catch (err) {
      setSubmitError(errorMessage(err, "削除できませんでした。時間をおいて、もう一度お試しください。"));
      setConfirmDelete(false);
      setBusy(false);
    }
  };

  const restSuggestions = suggestions.filter((t) => !draft.tags.includes(t));

  return (
    <div className="mx-auto max-w-[calc(640px+clamp(16px,4vw,40px)*2)] px-[clamp(16px,4vw,40px)] pt-8 pb-24">
      <button type="button" className="min-h-11 cursor-pointer text-[13px] text-mute hover:text-ink" onClick={onBack}>
        ← 一覧へ戻る
      </button>
      <h1 className="mt-6 text-[clamp(1.5rem,3vw,2rem)] font-medium text-balance">
        {isEdit ? "登録を編集する" : "アーティファクトを登録する"}
      </h1>
      <p className="mt-2 text-[14px] text-mute">
        {isEdit
          ? "変えたいところだけ直してください。"
          : "claude.ai で「公開」したアーティファクトのリンクを貼ります。本体は claude.ai に置いたままです。"}
      </p>

      <form ref={formRef} noValidate onSubmit={onSubmit} className="mt-9 grid gap-7">
        {askName === true && !isEdit && (
          <div className="grid gap-2">
            <label htmlFor={nameId} className="text-[14px] font-medium">
              あなたの名前 <span className="ml-1.5 text-[11px] font-normal text-mute">必須</span>
            </label>
            <input
              id={nameId}
              type="text"
              autoComplete="name"
              maxLength={NAME_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${nameId}-msg` : undefined}
              className={input}
            />
            {errors.name && (
              <p id={`${nameId}-msg`} className={`text-[12px] ${danger}`}>
                {errors.name}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-2">
          <label htmlFor={urlId} className="text-[14px] font-medium">
            claude.ai のリンク <span className="ml-1.5 text-[11px] font-normal text-mute">必須</span>
          </label>
          <input
            id={urlId}
            type="url"
            inputMode="url"
            placeholder="https://claude.ai/public/artifacts/…"
            value={draft.url}
            onChange={(e) => set("url", e.target.value)}
            aria-invalid={!!errors.url}
            aria-describedby={`${urlId}-msg`}
            className={input}
          />
          <p id={`${urlId}-msg`} className={`text-[12px] ${errors.url ? danger : "text-mute"}`}>
            {errors.url ?? "共有メニューの「リンクをコピー」で取れます。"}
          </p>
        </div>

        <div className="grid gap-2">
          <label htmlFor={titleId} className="text-[14px] font-medium">
            タイトル <span className="ml-1.5 text-[11px] font-normal text-mute">必須</span>
          </label>
          <input
            id={titleId}
            type="text"
            maxLength={TITLE_MAX}
            placeholder="例：店舗マップのプロトタイプ"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            aria-invalid={!!errors.title}
            aria-describedby={`${titleId}-msg`}
            className={input}
          />
          <p id={`${titleId}-msg`} className={`text-[12px] ${errors.title ? danger : "text-mute"}`}>
            {errors.title ?? "一覧で見つけやすい名前にします。"}
          </p>
        </div>

        <div className="grid gap-2">
          <label htmlFor={descId} className="text-[14px] font-medium">
            説明
          </label>
          <textarea
            id={descId}
            rows={4}
            maxLength={DESCRIPTION_MAX}
            placeholder="何のためにつくったか、どこで使うか"
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            className={`${input} resize-y leading-[1.8]`}
          />
          <p className="text-[12px] text-mute">
            {draft.description.length} / {DESCRIPTION_MAX}
          </p>
        </div>

        {/* 事業（AD-10）。モックには無い項目なので、チップと同じ見た目の 1 つ選ぶボタンにしている */}
        <fieldset className="grid gap-2" aria-describedby={errors.business ? `${bizId}-msg` : undefined}>
          <legend className="mb-2 text-[14px] font-medium">
            事業 <span className="ml-1.5 text-[11px] font-normal text-mute">必須</span>
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {BUSINESSES.map((b) => (
              <label
                key={b}
                className={`${chip} has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-ink ${
                  draft.business === b ? chipOn : ""
                }`}
              >
                <input
                  type="radio"
                  name="business"
                  value={b}
                  checked={draft.business === b}
                  onChange={() => set("business", b)}
                  data-invalid={b === BUSINESSES[0] && !!errors.business ? "true" : undefined}
                  className="sr-only"
                />
                {b}
              </label>
            ))}
          </div>
          {errors.business && (
            <p id={`${bizId}-msg`} className={`text-[12px] ${danger}`}>
              {errors.business}
            </p>
          )}
        </fieldset>

        <div className="grid gap-2">
          <label htmlFor={tagId} className="text-[14px] font-medium">
            タグ
          </label>
          <div className="flex min-h-12 flex-wrap items-center gap-1.5 border border-line px-2 py-[7px] focus-within:border-ink">
            {draft.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-0.5 bg-mist py-[3px] pr-1 pl-2.5 text-[13px]">
                #{t}
                <button
                  type="button"
                  className="size-[26px] cursor-pointer text-mute"
                  aria-label={`${t} を外す`}
                  onClick={() => removeTag(t)}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id={tagId}
              ref={tagInputRef}
              type="text"
              maxLength={TAG_MAX}
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
              onKeyDown={onTagKeyDown}
              placeholder={draft.tags.length ? "追加" : "入力して Enter"}
              enterKeyHint="done"
              className="min-h-8 min-w-[8em] flex-1 border-0 bg-transparent px-1.5 text-[16px] outline-none"
            />
          </div>
          <p className="text-[12px] text-mute">種類（試作・ツールなど）を付けると探しやすくなります。</p>
          {restSuggestions.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="label mr-1 text-mute">よく使うタグ</span>
              {restSuggestions.map((t) => (
                <button key={t} type="button" className={chip} onClick={() => addTag(t)}>
                  + {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {submitError && (
          <p role="alert" className={`text-[13px] ${danger}`}>
            {submitError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className={btnPrimary} disabled={busy}>
            {isEdit ? "保存する" : "登録する"}
          </button>
          <button type="button" className={btnText} onClick={onBack}>
            やめる
          </button>
        </div>
      </form>

      {editing &&
        (confirmDelete ? (
          <div role="alert" className="mt-12 grid gap-4 border border-[#c2341b] p-5">
            <p>
              <strong className="font-medium">「{editing.title}」を削除しますか？</strong>
              <br />
              <span className="text-mute">一覧から消えます。claude.ai の本体は消えません。</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={btnDanger} disabled={busy} onClick={onDelete}>
                削除する
              </button>
              <button type="button" className={btnLine} onClick={() => setConfirmDelete(false)}>
                やめる
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-12 border-t border-line pt-5">
            <button type="button" className={`${btnText} ${danger}`} onClick={() => setConfirmDelete(true)}>
              削除する
            </button>
          </div>
        ))}
    </div>
  );
}
