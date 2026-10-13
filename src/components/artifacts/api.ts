// /api/artifacts*（worker/artifacts.ts）を呼ぶ処理は、すべてこのファイルにまとめる。
// 認証は Cloudflare Access が済ませているので、ブラウザは同じオリジンに fetch するだけでよい。
// API の形は docs/artifacts/setup.md の「API の一覧」と docs/artifacts/briefs/B-3.md・B-5.md。

// 事業の値（AD-10）。worker/artifacts.ts の定数と綴りをそろえる（変えないこと）
export const BUSINESSES = ["Yoak", "nightbrew", "nomitai", "LAMP", "CaseMatch", "その他"] as const;
export type Business = (typeof BUSINESSES)[number];

export type Artifact = {
  id: string;
  url: string;
  title: string;
  description: string;
  business: string;
  author_email: string;
  /** 登録した人の名前（B-5。profiles に無ければ null。古い API では項目ごと無い） */
  author_name?: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
};

export type ArtifactInput = {
  url: string;
  title: string;
  description: string;
  business: string;
  tags: string[];
};

/**
 * ログイン中の人。name は profiles の名前で、まだ無ければ null（B-5）。
 * 項目ごと無い（undefined）のは名前を扱わない古い API。そのときは名前を聞かない
 */
export type Me = { email: string; name?: string | null };

export type TagCount = { name: string; count: number };

/** API が失敗したとき。status が 0 のときは通信そのものが失敗した */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** 画面に出す失敗の文言。401・503 は API の文言ではなく、何をすればよいかを書く */
export function errorMessage(
  error: unknown,
  fallback = "読み込めませんでした。時間をおいて、ページを再読み込みしてください。",
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "ログインが切れました。ページを再読み込みして、もう一度ログインしてください。";
    if (error.status === 503) return "アーティファクト共有は準備中です。しばらくしてから開いてください。";
    if (error.status !== 0 && error.message) return error.message;
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "");
  }
  const body = (await res.json().catch(() => null)) as ({ ok?: boolean; message?: string } & T) | null;
  if (!res.ok || !body?.ok) throw new ApiError(res.status, body?.message ?? "");
  return body;
}

export async function listArtifacts(): Promise<Artifact[]> {
  const body = await request<{ artifacts: Artifact[] }>("/api/artifacts");
  return body.artifacts;
}

export async function getMe(): Promise<Me> {
  const body = await request<{ email: string; name?: string | null }>("/api/artifacts/me");
  return "name" in body ? { email: body.email, name: body.name || null } : { email: body.email };
}

/** 自分の名前を保存する（PUT /api/artifacts/me。前後の空白を除いて 1〜30 字） */
export async function updateMyName(name: string): Promise<Me> {
  const body = await request<{ email: string; name: string }>("/api/artifacts/me", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
  return { email: body.email, name: body.name };
}

export async function listTags(): Promise<TagCount[]> {
  const body = await request<{ tags: TagCount[] }>("/api/artifacts/tags");
  return body.tags;
}

export async function createArtifact(input: ArtifactInput): Promise<Artifact> {
  const body = await request<{ artifact: Artifact }>("/api/artifacts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return body.artifact;
}

export async function updateArtifact(id: string, input: ArtifactInput): Promise<Artifact> {
  const body = await request<{ artifact: Artifact }>(`/api/artifacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return body.artifact;
}

export async function deleteArtifact(id: string): Promise<void> {
  await request<object>(`/api/artifacts/${encodeURIComponent(id)}`, { method: "DELETE" });
}
