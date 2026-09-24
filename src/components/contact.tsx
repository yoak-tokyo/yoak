"use client";

import { useId, useState, type FormEvent } from "react";
import { contact } from "@/content/contact";
import { Reveal, SectionLabel } from "./reveal";
import { TURNSTILE_SITE_KEY, Turnstile } from "./turnstile";

type FormState = {
  name: string;
  company: string;
  email: string;
  category: string;
  message: string;
  agree: boolean;
};

const initialState: FormState = {
  name: "",
  company: "",
  email: "",
  category: contact.categories[0],
  message: "",
  agree: false,
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

// worker/contact.ts の /api/contact に送信し、Notion に保存・Slack に通知する
async function sendInquiry(
  data: FormState,
  extra: { turnstileToken: string; website: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { agree, ...fields } = data;
  void agree;
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...fields, ...extra }),
  });
  const body = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
  if (res.ok && body?.ok) return { ok: true };
  return { ok: false, message: body?.message ?? contact.errorMessage };
}

function validate(data: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.name.trim()) errors.name = "お名前を入力してください。";
  if (!data.email.trim()) {
    errors.email = "メールアドレスを入力してください。";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "メールアドレスの形式が正しくありません。";
  }
  if (!data.message.trim()) errors.message = "お問い合わせ内容を入力してください。";
  if (!data.agree) errors.agree = "プライバシーポリシーへの同意が必要です。";
  return errors;
}

const fieldBase =
  "peer w-full border-b border-line bg-transparent py-3 text-[15px] outline-none transition-colors placeholder:text-mute/60 focus:border-ink";

export function Contact() {
  const [data, setData] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [website, setWebsite] = useState("");

  const nameId = useId();
  const companyId = useId();
  const emailId = useId();
  const categoryId = useId();
  const messageId = useId();
  const agreeId = useId();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors = validate(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus("error");
      setErrorMessage(contact.turnstileMessage);
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);
    try {
      const result = await sendInquiry(data, { turnstileToken, website });
      if (result.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(result.message);
        setTurnstileReset((n) => n + 1);
      }
    } catch {
      setStatus("error");
      setErrorMessage(contact.errorMessage);
      setTurnstileReset((n) => n + 1);
    }
  }

  if (status === "success") {
    return (
      <section id="contact" className="bg-paper py-32 md:py-48">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <SectionLabel>{contact.label}</SectionLabel>
          <Reveal as="h2" className="mt-8 text-2xl font-medium tracking-tight md:text-3xl">
            {contact.successHeading}
          </Reveal>
          <Reveal as="p" delay={0.1} className="mt-4 max-w-xl text-[15px] leading-[1.9] text-mute">
            {contact.successBody}
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="bg-paper py-32 md:py-48">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <SectionLabel>{contact.label}</SectionLabel>
          <Reveal as="h2" className="mt-8 text-3xl leading-[1.4] font-medium tracking-tight md:text-4xl">
            {contact.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </Reveal>
          <Reveal as="p" delay={0.1} className="mt-6 max-w-sm text-[15px] leading-[1.9] text-mute">
            {contact.lead}
          </Reveal>
        </div>

        <div className="md:col-span-8">
          <Reveal delay={0.1}>
            <form noValidate onSubmit={handleSubmit} className="grid gap-8">
              <div>
                <label htmlFor={nameId} className="label text-mute">
                  お名前 <span aria-hidden="true">*</span>
                </label>
                <input
                  id={nameId}
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? `${nameId}-error` : undefined}
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={fieldBase}
                />
                {errors.name && (
                  <p id={`${nameId}-error`} className="mt-2 text-xs text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={companyId} className="label text-mute">
                  会社名・所属
                </label>
                <input
                  id={companyId}
                  name="company"
                  type="text"
                  autoComplete="organization"
                  value={data.company}
                  onChange={(e) => update("company", e.target.value)}
                  className={fieldBase}
                />
              </div>

              <div>
                <label htmlFor={emailId} className="label text-mute">
                  メールアドレス <span aria-hidden="true">*</span>
                </label>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? `${emailId}-error` : undefined}
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={fieldBase}
                />
                {errors.email && (
                  <p id={`${emailId}-error`} className="mt-2 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={categoryId} className="label text-mute">
                  お問い合わせ種別
                </label>
                <select
                  id={categoryId}
                  name="category"
                  value={data.category}
                  onChange={(e) => update("category", e.target.value)}
                  className={`${fieldBase} cursor-pointer`}
                >
                  {contact.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={messageId} className="label text-mute">
                  お問い合わせ内容 <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id={messageId}
                  name="message"
                  rows={5}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? `${messageId}-error` : undefined}
                  value={data.message}
                  onChange={(e) => update("message", e.target.value)}
                  className={`${fieldBase} resize-none`}
                />
                {errors.message && (
                  <p id={`${messageId}-error`} className="mt-2 text-xs text-red-600">
                    {errors.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <input
                    id={agreeId}
                    name="agree"
                    type="checkbox"
                    required
                    aria-required="true"
                    aria-invalid={Boolean(errors.agree)}
                    aria-describedby={errors.agree ? `${agreeId}-error` : undefined}
                    checked={data.agree}
                    onChange={(e) => update("agree", e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 border-line accent-ink"
                  />
                  <label htmlFor={agreeId} className="text-sm leading-[1.8] text-mute">
                    <a
                      href={contact.privacyHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink underline underline-offset-2 hover:text-mute"
                    >
                      プライバシーポリシー
                    </a>
                    に同意する <span aria-hidden="true">*</span>
                  </label>
                </div>
                {errors.agree && (
                  <p id={`${agreeId}-error`} className="mt-2 text-xs text-red-600">
                    {errors.agree}
                  </p>
                )}
              </div>

              {/* ボット対策のダミー欄。人には見えず、入力されていたら送信を捨てる */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  website
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>
              </div>

              <Turnstile onToken={setTurnstileToken} resetKey={turnstileReset} />

              {status === "error" && errorMessage && (
                <div role="alert" className="border-t border-line pt-6 text-sm leading-[1.9] text-mute">
                  <p className="font-medium text-ink">{errorMessage}</p>
                  <p className="mt-1">{contact.errorHint}</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="label border-b border-ink pb-1 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === "submitting" ? contact.submittingLabel : contact.submitLabel}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
