// 静的アセットの前段で Basic 認証をかける。
// ユーザー名は BASIC_AUTH_USER（wrangler.jsonc の vars）、
// パスワードは `wrangler secret put BASIC_AUTH_PASSWORD` で設定する。
// シークレットを削除すれば認証なしで公開される。

interface Env {
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

const worker = {
  async fetch(request: Request, env: Env) {
    const password = env.BASIC_AUTH_PASSWORD;
    if (password && !isAuthorized(request, env.BASIC_AUTH_USER ?? "", password)) {
      return new Response("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Yoak preview", charset="UTF-8"' },
      });
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
