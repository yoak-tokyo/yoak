// POST /api/contact — お問い合わせを受け付けて Notion の Contact DB に保存し、Slack に通知する。
//
// 必要なシークレット（`wrangler secret put <NAME>`）:
//   NOTION_CONTACT_TOKEN  Contact DB に「追加だけ」できる Notion インテグレーションのトークン
//   SLACK_WEBHOOK_URL     通知先チャンネルの Incoming Webhook URL（未設定なら通知しない）
//   TURNSTILE_SECRET_KEY  Cloudflare Turnstile のシークレットキー（未設定ならボット判定をしない）

import { contact } from "../src/content/contact";

export interface ContactEnv {
  NOTION_CONTACT_TOKEN?: string;
  NOTION_CONTACT_DATA_SOURCE_ID?: string;
  SLACK_WEBHOOK_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

type Inquiry = {
  name: string;
  company: string;
  email: string;
  category: string;
  message: string;
};

const LIMITS = { name: 100, company: 100, email: 254, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

const fail = (message: string, status: number) => json({ ok: false, message }, status);

function parseInquiry(body: Record<string, unknown>): Inquiry | string {
  const str = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim() : "");
  const inquiry = {
    name: str("name"),
    company: str("company"),
    email: str("email"),
    category: str("category"),
    message: str("message"),
  };
  if (!inquiry.name || !inquiry.email || !inquiry.message) return "必須項目が入力されていません。";
  if (!EMAIL_RE.test(inquiry.email)) return "メールアドレスの形式が正しくありません。";
  if (!contact.categories.includes(inquiry.category)) return "お問い合わせ種別が正しくありません。";
  for (const [key, max] of Object.entries(LIMITS)) {
    if (inquiry[key as keyof typeof LIMITS].length > max) return "入力内容が長すぎます。";
  }
  return inquiry;
}

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}

// Notion の rich_text は 1 要素 2000 文字までなので分割する
const richText = (text: string) =>
  (text.match(/[\s\S]{1,2000}/g) ?? []).map((content) => ({ text: { content } }));

async function saveToNotion(env: ContactEnv, inquiry: Inquiry): Promise<string> {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.NOTION_CONTACT_TOKEN}`,
      "Notion-Version": "2025-09-03",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: env.NOTION_CONTACT_DATA_SOURCE_ID },
      properties: {
        お名前: { title: richText(inquiry.name) },
        会社名: { rich_text: richText(inquiry.company) },
        メール: { email: inquiry.email },
        種別: { select: { name: inquiry.category } },
        内容: { rich_text: richText(inquiry.message) },
        対応状況: { select: { name: "未対応" } },
      },
    }),
  });
  if (!res.ok) throw new Error(`Notion API ${res.status}: ${await res.text()}`);
  const page = (await res.json()) as { url: string };
  return page.url;
}

const slackEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function notifySlack(webhookUrl: string, inquiry: Inquiry, notionUrl: string) {
  const excerpt = inquiry.message.length > 1000 ? `${inquiry.message.slice(0, 1000)}…` : inquiry.message;
  // 本文は引用ブロックにして、項目と区別しやすくする
  const quoted = slackEscape(excerpt)
    .split("\n")
    .map((line) => `>${line}`)
    .join("\n");
  const lines = [
    `*種別：* ${slackEscape(inquiry.category)}`,
    `*名前：* ${slackEscape(inquiry.name)}`,
    `*会社名：* ${inquiry.company ? slackEscape(inquiry.company) : "—"}`,
    `*メール：* ${slackEscape(inquiry.email)}`,
  ];
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `📮 お問い合わせが届きました（${inquiry.category}）`,
      blocks: [
        { type: "section", text: { type: "mrkdwn", text: "*📮 お問い合わせが届きました*" } },
        { type: "section", text: { type: "mrkdwn", text: lines.join("\n") } },
        { type: "section", text: { type: "mrkdwn", text: `*内容：*\n${quoted}` } },
        // ボタンは Slack がアプリ側へ操作通知を送るため、Interactivity 未設定だと ⚠️ になる。ふつうのリンクにする
        { type: "section", text: { type: "mrkdwn", text: `<${notionUrl}|→ Notion で開く>` } },
      ],
    }),
  });
  if (!res.ok) console.error(`Slack 通知に失敗しました: ${res.status} ${await res.text()}`);
}

export async function handleContact(
  request: Request,
  env: ContactEnv,
  ctx: { waitUntil(promise: Promise<unknown>): void },
): Promise<Response> {
  if (request.method !== "POST") return fail("Method Not Allowed", 405);

  // 別サイトからの送信を受け付けない
  const origin = request.headers.get("Origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return fail("Forbidden", 403);

  if (!env.NOTION_CONTACT_TOKEN || !env.NOTION_CONTACT_DATA_SOURCE_ID) {
    console.error("NOTION_CONTACT_TOKEN または NOTION_CONTACT_DATA_SOURCE_ID が未設定です");
    return fail("現在、送信を受け付けられません。", 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("送信内容を読み取れませんでした。", 400);
  }

  // ボット対策のダミー欄（画面には見えない）に入力があれば、成功を装って捨てる
  if (typeof body.website === "string" && body.website !== "") return json({ ok: true });

  if (env.TURNSTILE_SECRET_KEY) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const ip = request.headers.get("CF-Connecting-IP");
    if (!token || !(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, ip))) {
      return fail("送信の確認に失敗しました。ページを再読み込みしてお試しください。", 400);
    }
  }

  const inquiry = parseInquiry(body);
  if (typeof inquiry === "string") return fail(inquiry, 400);

  let notionUrl: string;
  try {
    notionUrl = await saveToNotion(env, inquiry);
  } catch (err) {
    console.error(err);
    return fail("送信に失敗しました。", 502);
  }

  // Slack 通知は失敗してもユーザーには成功を返す（Notion には保存済みのため）
  if (env.SLACK_WEBHOOK_URL) ctx.waitUntil(notifySlack(env.SLACK_WEBHOOK_URL, inquiry, notionUrl));

  return json({ ok: true });
}
