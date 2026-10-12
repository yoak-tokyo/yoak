// Cloudflare Access の JWT（Cf-Access-Jwt-Assertion ヘッダー）を検証し、ログインした人のメールを返す。
// workers.dev とプレビュー URL は Worker 単位の Access で保護する（決定ログ AD-13）。
// 将来 yoak.tokyo をこの Worker に向けるときは、/artifacts* と /api/artifacts* にパス別の Application を足す（AD-4）。
// Access を通らない経路にはヘッダーが無いので、ここで弾かれる。
//
// 設定（wrangler.jsonc の vars。値は PO が設定する。手順は docs/artifacts/setup.md）:
//   ACCESS_TEAM_DOMAIN  Zero Trust のチームドメイン（例: yoak.cloudflareaccess.com）
//   ACCESS_AUD          Access Application の Application Audience (AUD) Tag。
//                       workers.dev とプレビュー URL など Application が複数あるときはカンマ区切りで並べる
//
// ローカル開発用（.dev.vars にだけ書く。wrangler.jsonc には書かない）:
//   ACCESS_DEV_EMAIL    設定されていて、かつ localhost へのリクエストのときだけ、検証せずにこのメールで通す

import { createRemoteJWKSet, jwtVerify } from "jose";

export interface AccessEnv {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ACCESS_DEV_EMAIL?: string;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

// 公開鍵の取得結果は isolate の中で使い回す（jose がキャッシュと鍵の更新を受け持つ）
const jwksByIssuer = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(issuer: string) {
  let jwks = jwksByIssuer.get(issuer);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    jwksByIssuer.set(issuer, jwks);
  }
  return jwks;
}

// "https://" の有無や末尾のスラッシュの揺れを吸収して、iss と同じ形にする
const toIssuer = (teamDomain: string) =>
  `https://${teamDomain.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

/** 検証が通ればログインした人のメール（小文字）を、通らなければ null を返す */
export async function getAccessEmail(request: Request, env: AccessEnv): Promise<string | null> {
  if (env.ACCESS_DEV_EMAIL && LOCAL_HOSTS.has(new URL(request.url).hostname)) {
    return env.ACCESS_DEV_EMAIL.trim().toLowerCase();
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return null;

  const audiences = (env.ACCESS_AUD ?? "")
    .split(",")
    .map((aud) => aud.trim())
    .filter(Boolean);
  if (!env.ACCESS_TEAM_DOMAIN?.trim() || audiences.length === 0) {
    console.error("ACCESS_TEAM_DOMAIN または ACCESS_AUD が未設定のため、Access の JWT を検証できません");
    return null;
  }

  const issuer = toIssuer(env.ACCESS_TEAM_DOMAIN);
  try {
    // 署名・iss・aud・期限（exp / nbf）を検証する
    const { payload } = await jwtVerify(token, getJwks(issuer), {
      issuer,
      audience: audiences,
      algorithms: ["RS256"],
    });
    // サービストークンの JWT には email が無いので通さない
    return typeof payload.email === "string" && payload.email ? payload.email.toLowerCase() : null;
  } catch (err) {
    console.warn(`Access の JWT の検証に失敗しました: ${(err as Error).message}`);
    return null;
  }
}
