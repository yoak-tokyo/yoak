// /api/artifacts* — アーティファクト（claude.ai のリンク）の登録・一覧・検索・更新・削除。
// 呼ばれる前に worker/index.ts で Access の検証を済ませ、ログインした人のメールを受け取る。
//
//   GET    /api/artifacts?q=&tag=&business=  一覧（新しい順）。q はタイトル・説明の部分一致、
//                                           tag はタグの完全一致、business は事業の完全一致
//   POST   /api/artifacts          登録（author_email はログインした人のメール）
//   GET    /api/artifacts/me       ログイン中のメールと表示名（無ければ Google の名前を取りにいく。AD-18）
//   PUT    /api/artifacts/me       表示名を本人が設定する（source: self）
//   GET    /api/artifacts/tags     使われているタグと件数（件数の多い順）
//   GET    /api/artifacts/:id      1件
//   PATCH  /api/artifacts/:id      更新（canEdit が許す人だけ）
//   DELETE /api/artifacts/:id      削除（canEdit が許す人だけ）
//
// データは D1（binding 名 DB、スキーマは migrations/）。DB が無いときは 503 を返す。

import { getAccessIdentityName, type AccessEnv } from "./access";

// D1 の型は @cloudflare/workers-types を入れずに、使う分だけ書く
interface D1Result<T> {
  results: T[];
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}

export interface ArtifactsEnv extends AccessEnv {
  DB?: D1Database;
}

/**
 * 事業（AD-10）。1件に1つ必須。画面側も同じ値を持つので、綴りを変えないこと。
 * 既定値「その他」は migrations/0002_business.sql の DEFAULT と合わせている。
 */
export const BUSINESSES = ["Yoak", "nightbrew", "nomitai", "LAMP", "CaseMatch", "その他"] as const;
export type Business = (typeof BUSINESSES)[number];

const isBusiness = (value: unknown): value is Business =>
  typeof value === "string" && (BUSINESSES as readonly string[]).includes(value);

type ArtifactRow = {
  id: string;
  url: string;
  title: string;
  description: string;
  business: Business;
  author_email: string;
  author_name: string | null; // profiles の名前。無ければ null（画面はメールの @ より前を出す。AD-16）
  created_at: string;
  updated_at: string;
  tags: string; // json_group_array の結果（JSON 文字列）
};

type Artifact = Omit<ArtifactRow, "tags"> & { tags: string[] };

type ArtifactInput = { url: string; title: string; description: string; business: Business; tags: string[] };

const URL_PREFIX = "https://claude.ai/";
const LIMITS = { url: 2048, title: 200, description: 2000, tag: 50, tags: 10, q: 200 };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const fail = (message: string, status: number) => json({ ok: false, message }, status);

/**
 * 更新・削除してよい人かどうか。いまは登録した本人だけ。
 * 本人以外にも許すか（Q-1）が決まったら、この関数だけを変える。
 */
export function canEdit(artifact: Pick<Artifact, "author_email">, email: string): boolean {
  return artifact.author_email === email;
}

const SELECT_ARTIFACT = `
  SELECT a.id, a.url, a.title, a.description, a.business, a.author_email, p.name AS author_name,
    a.created_at, a.updated_at,
    (SELECT json_group_array(name) FROM (SELECT name FROM tags WHERE artifact_id = a.id ORDER BY name)) AS tags
  FROM artifacts a
  LEFT JOIN profiles p ON p.email = a.author_email`;

function toArtifact(row: ArtifactRow): Artifact {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags) as string[];
  } catch {
    // タグが読めなくても本体は返す
  }
  return { ...row, tags };
}

async function findArtifact(db: D1Database, id: string): Promise<Artifact | null> {
  const row = await db.prepare(`${SELECT_ARTIFACT} WHERE a.id = ?`).bind(id).first<ArtifactRow>();
  return row ? toArtifact(row) : null;
}

// ---------- 入力の検証 ----------

function parseUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw "URL を入力してください。";
  const url = value.trim();
  if (url.length > LIMITS.url) throw "URL が長すぎます。";
  if (!url.startsWith(URL_PREFIX) || /\s/.test(url)) {
    throw "Claude のアーティファクトのリンク（https://claude.ai/ で始まる URL）を入力してください。";
  }
  return url;
}

function parseTitle(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw "タイトルを入力してください。";
  const title = value.trim();
  if (title.length > LIMITS.title) throw "タイトルが長すぎます。";
  return title;
}

function parseDescription(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw "説明の形式が正しくありません。";
  const description = value.trim();
  if (description.length > LIMITS.description) throw "説明が長すぎます。";
  return description;
}

function parseBusiness(value: unknown): Business {
  if (value === undefined || value === null || value === "") throw "事業を選んでください。";
  if (!isBusiness(value)) throw `事業は ${BUSINESSES.join(" / ")} のどれかを選んでください。`;
  return value;
}

function parseTags(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw "タグの形式が正しくありません。";
  const tags: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") throw "タグの形式が正しくありません。";
    const tag = item.trim();
    if (!tag) continue;
    if (tag.length > LIMITS.tag) throw "タグが長すぎます。";
    if (!tags.includes(tag)) tags.push(tag);
  }
  if (tags.length > LIMITS.tags) throw `タグは ${LIMITS.tags} 個までです。`;
  return tags;
}

/** 登録は全項目、更新は送られた項目だけを検証する。エラーは文言を投げる */
function parseInput(body: Record<string, unknown>, partial: false): ArtifactInput;
function parseInput(body: Record<string, unknown>, partial: true): Partial<ArtifactInput>;
function parseInput(body: Record<string, unknown>, partial: boolean): Partial<ArtifactInput> {
  const has = (key: string) => !partial || body[key] !== undefined;
  const input: Partial<ArtifactInput> = {};
  if (has("url")) input.url = parseUrl(body.url);
  if (has("title")) input.title = parseTitle(body.title);
  if (has("description")) input.description = parseDescription(body.description);
  if (has("business")) input.business = parseBusiness(body.business);
  if (has("tags")) input.tags = parseTags(body.tags);
  if (partial && Object.keys(input).length === 0) throw "更新する項目がありません。";
  return input;
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    throw "送信内容は JSON で送ってください。";
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw "送信内容を読み取れませんでした。";
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw "送信内容を読み取れませんでした。";
  return body as Record<string, unknown>;
}

const tagStatements = (db: D1Database, id: string, tags: string[]) =>
  tags.map((tag) => db.prepare("INSERT INTO tags (artifact_id, name) VALUES (?, ?)").bind(id, tag));

// LIKE の % と _ を文字どおりに扱う
const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

// ---------- 各操作 ----------

async function listArtifacts(db: D1Database, url: URL): Promise<Response> {
  const q = url.searchParams.get("q")?.trim() ?? "";
  const tag = url.searchParams.get("tag")?.trim() ?? "";
  const business = url.searchParams.get("business")?.trim() ?? "";
  if (q.length > LIMITS.q || tag.length > LIMITS.tag) return fail("検索条件が長すぎます。", 400);
  if (business && !isBusiness(business)) return fail("事業の指定が正しくありません。", 400);

  const where: string[] = [];
  const params: unknown[] = [];
  if (q) {
    where.push("(a.title LIKE ? ESCAPE '\\' OR a.description LIKE ? ESCAPE '\\')");
    params.push(likePattern(q), likePattern(q));
  }
  if (tag) {
    where.push("EXISTS (SELECT 1 FROM tags t WHERE t.artifact_id = a.id AND t.name = ?)");
    params.push(tag);
  }
  if (business) {
    where.push("a.business = ?");
    params.push(business);
  }
  const sql = `${SELECT_ARTIFACT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""}
    ORDER BY a.created_at DESC, a.id DESC`;
  const { results } = await db.prepare(sql).bind(...params).all<ArtifactRow>();
  return json({ ok: true, artifacts: results.map(toArtifact) });
}

/** 使われているタグを、使われている件数の多い順に（同数は名前順）。画面のタグ候補用（AD-12） */
async function listTags(db: D1Database): Promise<Response> {
  const { results } = await db
    .prepare("SELECT name, COUNT(*) AS count FROM tags GROUP BY name ORDER BY count DESC, name")
    .all<{ name: string; count: number }>();
  return json({ ok: true, tags: results });
}

async function createArtifact(db: D1Database, request: Request, email: string): Promise<Response> {
  let input: ArtifactInput;
  try {
    input = parseInput(await readBody(request), false);
  } catch (message) {
    return fail(String(message), 400);
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.batch([
    db
      .prepare(
        `INSERT INTO artifacts (id, url, title, description, business, author_email, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, input.url, input.title, input.description, input.business, email, now, now),
    ...tagStatements(db, id, input.tags),
  ]);
  return json({ ok: true, artifact: await findArtifact(db, id) }, 201);
}

async function updateArtifact(db: D1Database, request: Request, artifact: Artifact): Promise<Response> {
  let input: Partial<ArtifactInput>;
  try {
    input = parseInput(await readBody(request), true);
  } catch (message) {
    return fail(String(message), 400);
  }
  // 送られた列だけを書く（読み取った旧値で書き戻すと、同時に送られた別の項目の変更を消してしまう）
  const columns = (["url", "title", "description", "business"] as const).filter((key) => input[key] !== undefined);
  const sets = [...columns.map((key) => `${key} = ?`), "updated_at = ?"];
  const values = [...columns.map((key) => input[key]), new Date().toISOString()];
  await db.batch([
    db.prepare(`UPDATE artifacts SET ${sets.join(", ")} WHERE id = ?`).bind(...values, artifact.id),
    // タグは送られたときだけ置き換える
    ...(input.tags
      ? [
          db.prepare("DELETE FROM tags WHERE artifact_id = ?").bind(artifact.id),
          ...tagStatements(db, artifact.id, input.tags),
        ]
      : []),
  ]);
  return json({ ok: true, artifact: await findArtifact(db, artifact.id) });
}

async function deleteArtifact(db: D1Database, artifact: Artifact): Promise<Response> {
  await db.batch([
    db.prepare("DELETE FROM tags WHERE artifact_id = ?").bind(artifact.id),
    db.prepare("DELETE FROM artifacts WHERE id = ?").bind(artifact.id),
  ]);
  return json({ ok: true });
}

// ---------- 表示名（profiles。AD-16・AD-18） ----------

const NAME_MAX = 30;

function parseName(value: unknown): string {
  if (typeof value !== "string") throw "名前を入力してください。";
  const name = value.trim();
  if (!name) throw "名前を入力してください。";
  // 絵文字などを 1 字と数えるため、コードポイントで数える
  if ([...name].length > NAME_MAX) throw `名前は ${NAME_MAX} 字以内で入力してください。`;
  return name;
}

const findProfileName = async (db: D1Database, email: string) =>
  (await db.prepare("SELECT name FROM profiles WHERE email = ?").bind(email).first<{ name: string }>())?.name ??
  null;

async function getMe(db: D1Database, request: Request, env: ArtifactsEnv, email: string): Promise<Response> {
  const saved = await findProfileName(db, email);
  if (saved !== null) return json({ ok: true, email, name: saved });

  const googleName = await getAccessIdentityName(request, env);
  if (!googleName) return json({ ok: true, email, name: null });
  // 取りにいっているあいだに本人が名前を入れていたら、そちらを残す（self は google で上書きしない）
  await db
    .prepare(
      `INSERT INTO profiles (email, name, source, updated_at) VALUES (?, ?, 'google', ?)
       ON CONFLICT (email) DO NOTHING`,
    )
    .bind(email, googleName, new Date().toISOString())
    .run();
  return json({ ok: true, email, name: await findProfileName(db, email) });
}

async function putMe(db: D1Database, request: Request, email: string): Promise<Response> {
  let name: string;
  try {
    name = parseName((await readBody(request)).name);
  } catch (message) {
    return fail(String(message), 400);
  }
  await db
    .prepare(
      `INSERT INTO profiles (email, name, source, updated_at) VALUES (?, ?, 'self', ?)
       ON CONFLICT (email) DO UPDATE SET name = excluded.name, source = 'self', updated_at = excluded.updated_at`,
    )
    .bind(email, name, new Date().toISOString())
    .run();
  return json({ ok: true, email, name });
}

// ---------- 入口 ----------

export async function handleArtifacts(request: Request, env: ArtifactsEnv, email: string): Promise<Response> {
  const db = env.DB;
  if (!db) {
    console.error("D1 の binding（DB）が未設定です");
    return fail("現在、アーティファクト共有は利用できません。", 503);
  }

  const url = new URL(request.url);
  const method = request.method;

  // 別サイトからの書き込みを受け付けない
  if (method !== "GET" && method !== "HEAD") {
    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) return fail("Forbidden", 403);
  }

  const rest = url.pathname.replace(/^\/api\/artifacts\/?/, "");
  try {
    if (rest === "") {
      if (method === "GET") return await listArtifacts(db, url);
      if (method === "POST") return await createArtifact(db, request, email);
      return fail("Method Not Allowed", 405);
    }

    if (rest === "me") {
      if (method === "GET") return await getMe(db, request, env, email);
      if (method === "PUT") return await putMe(db, request, email);
      return fail("Method Not Allowed", 405);
    }

    // 「tags」という ID と取り違えないよう、:id より先に判定する
    if (rest === "tags") {
      if (method === "GET") return await listTags(db);
      return fail("Method Not Allowed", 405);
    }

    if (rest.includes("/")) return fail("Not Found", 404);
    if (!["GET", "PATCH", "DELETE"].includes(method)) return fail("Method Not Allowed", 405);

    let id: string;
    try {
      id = decodeURIComponent(rest);
    } catch {
      return fail("Not Found", 404);
    }
    const artifact = await findArtifact(db, id);
    if (!artifact) return fail("指定のアーティファクトが見つかりません。", 404);
    if (method === "GET") return json({ ok: true, artifact });
    if (!canEdit(artifact, email)) return fail("登録した本人だけが変更できます。", 403);
    if (method === "PATCH") return await updateArtifact(db, request, artifact);
    return await deleteArtifact(db, artifact);
  } catch (err) {
    console.error(err);
    return fail("処理に失敗しました。", 500);
  }
}
