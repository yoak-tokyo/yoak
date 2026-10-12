// 静的アセットの前段で Basic 認証をかける。
// ユーザー名は BASIC_AUTH_USER（wrangler.jsonc の vars）、
// パスワードは `wrangler secret put BASIC_AUTH_PASSWORD` で設定する。
// シークレットを削除すれば認証なしで公開される。
// /api/contact はお問い合わせの受付（worker/contact.ts）。
// /artifacts* と /api/artifacts* はアーティファクト共有。Basic 認証はかけず、
// Cloudflare Access の JWT だけを検証する（worker/access.ts、決定ログ AD-4・AD-5）。
// それ以外のパスも、Access の JWT が正しければ Basic 認証をかけない（二重ログインを避ける。AD-13）。
// JWT の検証は 1 リクエストにつき多くても 1 回にする（/_next/* などの静的ファイルにも毎回かかるため）。

import { getAccessEmail, type AccessEnv } from "./access";
import { handleArtifacts, type ArtifactsEnv } from "./artifacts";
import { handleContact, type ContactEnv } from "./contact";

interface Env extends ContactEnv, AccessEnv, ArtifactsEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
  BASIC_AUTH_USER?: string;
  BASIC_AUTH_PASSWORD?: string;
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isAuthorized(request: Request, user: string, password: string) {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Basic ")) return false;
  try {
    const decoded = atob(header.slice(6));
    const sep = decoded.indexOf(":");
    if (sep === -1) return false;
    const okUser = safeEqual(decoded.slice(0, sep), user);
    const okPass = safeEqual(decoded.slice(sep + 1), password);
    return okUser && okPass;
  } catch {
    return false;
  }
}

// Access の Application のパス（yoak.tokyo/artifacts*、yoak.tokyo/api/artifacts*）と同じ前方一致にする。
// /artifacts.txt など、静的書き出しが /artifacts ページ用に作るファイルも含めるため
const isArtifactsApi = (pathname: string) => pathname.startsWith("/api/artifacts");
const isArtifactsPage = (pathname: string) => pathname.startsWith("/artifacts");

async function handleArtifactsRoute(request: Request, env: Env, pathname: string) {
  const email = await getAccessEmail(request, env);
  if (isArtifactsApi(pathname)) {
    if (!email) {
      return new Response(JSON.stringify({ ok: false, message: "ログインが必要です。" }), {
        status: 401,
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
    return handleArtifacts(request, env, email);
  }
  if (!email) {
    return new Response("このページを見る権限がありません。", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  return env.ASSETS.fetch(request);
}

const worker = {
  async fetch(request: Request, env: Env, ctx: { waitUntil(promise: Promise<unknown>): void }) {
    const { pathname } = new URL(request.url);
    if (isArtifactsApi(pathname) || isArtifactsPage(pathname)) {
      return handleArtifactsRoute(request, env, pathname);
    }

    const password = env.BASIC_AUTH_PASSWORD;
    // Basic 認証が通っていれば JWT は検証しない。通っていなければ Access の JWT を 1 回だけ検証する
    if (
      password &&
      !isAuthorized(request, env.BASIC_AUTH_USER ?? "", password) &&
      !(await getAccessEmail(request, env))
    ) {
      return new Response("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Yoak preview", charset="UTF-8"' },
      });
    }
    if (pathname === "/api/contact") return handleContact(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};

export default worker;
