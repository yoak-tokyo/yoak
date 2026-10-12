# アーティファクト共有 設定手順書（Cloudflare）

PO が Cloudflare でやる設定を、上から順に書いている。コードは B-1 で入っている（`worker/access.ts`、`worker/artifacts.ts`、`migrations/`）。
画面の名前は 2026-10 時点の Cloudflare ダッシュボードに合わせている。名前が変わっていたら近いものを探す。

設定が済むまでの本番の動き：

- `/artifacts*` は 403、`/api/artifacts*` は 401（Access の値が空なので誰も通らない）
- Access を設定しても D1 をつなぐまでは `/api/artifacts*` が 503
- それ以外のページと `/api/contact` は今までどおり

## 全体の順番

1. D1 を作り、マイグレーションを当てる（ターミナル）
2. `wrangler.jsonc` に D1 を書いて PR にする（開発チームに頼んでもよい）
3. Zero Trust でログイン方法（Google、One-time PIN）を足す
4. Access Application を作る
5. `ACCESS_TEAM_DOMAIN`・`ACCESS_AUD` を `wrangler.jsonc` に書いて PR にする
6. 確かめる

2 と 5 はまとめて 1 つの PR にしてよい。

---

## 1. D1 を作る

ターミナルで、リポジトリの直下から実行する（初回は `npx wrangler login`）。

```sh
npx wrangler d1 create yoak-artifacts
```

出力に次のような `database_id` が出るので控える。

```
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "yoak-artifacts",
    "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
]
```

## 2. `wrangler.jsonc` に D1 を書き、マイグレーションを当てる

`wrangler.jsonc` の `assets` の下に足す（binding 名は必ず `DB`）。

```jsonc
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "yoak-artifacts",
      "database_id": "<1 で控えた ID>",
      "migrations_dir": "migrations"
    }
  ]
```

本番の D1 にテーブルを作る。

```sh
npx wrangler d1 migrations apply DB --remote
```

`0001_artifacts.sql` が ✅ になれば完了。この変更を PR にして main にマージすると、Workers Builds が D1 つきでデプロイする。

> 順番の注意：マイグレーションを当てる前に D1 つきでデプロイされると、`/api/artifacts*` が「テーブルが無い」で 500 になる。マイグレーションを先に当てる。

## 3. ログイン方法を足す（Zero Trust）

### チーム名を確かめる

Cloudflare ダッシュボード → **Zero Trust** → **Settings** → **Team name and domain**。
ここの **Team domain**（`<チーム名>.cloudflareaccess.com`）を 5 で使う。チームがまだ無ければ、Zero Trust を初めて開いたときにチーム名を決める画面が出る（Free プランで足りる）。

### Google ログイン

1. Google Cloud Console でプロジェクトを作る（既存でもよい）
2. **APIs & Services** → **OAuth consent screen** で同意画面を作る。対象（User type / Audience）は **External**（Yoak 外の Google アカウントも入れるため。AD-3）
3. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**、種類は **Web application**
   - **Authorized JavaScript origins**：`https://<チーム名>.cloudflareaccess.com`
   - **Authorized redirect URIs**：`https://<チーム名>.cloudflareaccess.com/cdn-cgi/access/callback`
4. 出てきた **Client ID** と **Client secret** を控える
5. Cloudflare ダッシュボード → **Zero Trust** → **Integrations** → **Identity providers** → **Add new identity provider** → **Google**
   - **App ID** に Client ID、**Client secret** に Client secret を入れて **Save**
   - 一覧の Google の横の **Test** でログインできるか確かめる

### One-time PIN（Google 以外の許可した人用）

同じ **Identity providers** で **Add new identity provider** → **One-time PIN** を選ぶ。
メールに届く数字でログインできるようになる（AD-4）。

## 4. Access Application を作る

**Zero Trust** → **Access controls** → **Applications** → **Create new application** → **Self-hosted and private**。

- **Application name**：`Yoak アーティファクト共有`
- **Add public hostname** を 2 つ足す（パスで分ける。サイトのほかのページは保護しない）
  | Subdomain | Domain | Path |
  | --- | --- | --- |
  | （空） | `yoak.tokyo` | `artifacts*` |
  | （空） | `yoak.tokyo` | `api/artifacts*` |
  - `www.yoak.tokyo` でも配信しているなら、同じ 2 行を `www` でも足す
- **Access policies**：**Create new policy**
  - **Policy name**：`アーティファクト共有を見られる人`
  - **Action**：**Allow**
  - **Include** に、許可する人を足す（Q-3 で決めた範囲）
    - Yoak のドメインの人全員：**Emails ending in** → `@yoak.tokyo` など
    - 個別に許可する人：**Emails** → メールアドレスを 1 件ずつ
- **Login methods**：**Google** と **One-time PIN** にチェック（**Accept all available identity providers** は外す）
- **Session Duration**：既定（24 hours）でよい
- **Create** を押す

Access は「許可したもの以外は拒否」なので、ポリシーに当てはまらない人はログインしても入れない。

## 5. `ACCESS_TEAM_DOMAIN`・`ACCESS_AUD` を設定する

| 変数 | 値の取り方 | 例 |
| --- | --- | --- |
| `ACCESS_TEAM_DOMAIN` | 3 の **Team domain** | `yoak.cloudflareaccess.com` |
| `ACCESS_AUD` | **Access controls** → **Applications** → 4 の Application の **Configure** → **Additional settings**（または **Overview**）の **Application Audience (AUD) Tag** | 64 文字の英数字 |

どちらも秘密の値ではない（公開鍵の場所と、トークンの宛先の名前）。`wrangler.jsonc` の `vars` の空欄に書いて PR にする。

```jsonc
    "ACCESS_TEAM_DOMAIN": "yoak.cloudflareaccess.com",
    "ACCESS_AUD": "<AUD Tag>"
```

`ACCESS_DEV_EMAIL` は**本番には絶対に設定しない**（ローカル開発専用。設定しても localhost 以外では効かないようにしてあるが、置かない）。

## 6. 確かめる

マージしてデプロイが終わったら：

1. シークレットウィンドウで `https://yoak.tokyo/artifacts` を開く → Access のログイン画面が出る
2. 許可したアカウントでログイン → ページが出る（画面ができるまでは 404 ページ）
3. 同じウィンドウで `https://yoak.tokyo/api/artifacts/me` → `{"ok":true,"email":"<自分のメール>"}`
4. 許可していないアカウントでログイン → Access の拒否画面
5. `https://yoak.tokyo/` などほかのページは、ログインなしで今までどおり見られる
6. `https://yoak-corporate-site.yoak-corporate-site.workers.dev/api/artifacts` → 401（Access を通らない経路は弾く）

---

## ローカル開発

本番の `wrangler.jsonc` には D1 の ID が入るまで `d1_databases` を書けないので、ローカルでは D1 つきの別の設定 `wrangler.local.jsonc` を使う。
`wrangler.jsonc` を変えたら `wrangler.local.jsonc` も合わせる。

```sh
cp .dev.vars.example .dev.vars          # ACCESS_DEV_EMAIL を自分のメールにする
npx wrangler d1 migrations apply DB --local -c wrangler.local.jsonc   # ローカル D1（.wrangler/state）にテーブルを作る
npm run build
npx wrangler dev -c wrangler.local.jsonc  # http://localhost:8787
```

- `ACCESS_DEV_EMAIL` があると、localhost へのリクエストは Access の検証をせずにそのメールでログインしたことになる
- ほかの人の登録として試すには `.dev.vars` のメールを変えて起動し直す
- `npm run preview`（`wrangler.jsonc` を使う）でも起動できるが、D1 が無いので `/api/artifacts*` は 503 になる

試しの curl：

```sh
curl http://localhost:8787/api/artifacts/me
curl -X POST http://localhost:8787/api/artifacts -H 'Content-Type: application/json' \
  -d '{"url":"https://claude.ai/public/artifacts/xxx","title":"テスト","description":"説明","tags":["営業"]}'
curl 'http://localhost:8787/api/artifacts?q=テスト&tag=営業'
```

## API の一覧（画面を作る人向け）

すべて JSON。失敗は `{ "ok": false, "message": "..." }`。ログインしていなければ 401、D1 が無ければ 503。

| メソッド・パス | 内容 |
| --- | --- |
| `GET /api/artifacts?q=&tag=` | 一覧（新しい順）。`q` はタイトル・説明の部分一致、`tag` はタグの完全一致。`{ ok, artifacts: [...] }` |
| `POST /api/artifacts` | 登録。本文 `{ url, title, description?, tags? }`。`{ ok, artifact }`（201） |
| `GET /api/artifacts/me` | ログイン中のメール。`{ ok, email }` |
| `GET /api/artifacts/:id` | 1 件。`{ ok, artifact }` |
| `PATCH /api/artifacts/:id` | 更新（登録した本人だけ。他人は 403）。送った項目だけ変わる。`tags` を送ると置き換え |
| `DELETE /api/artifacts/:id` | 削除（登録した本人だけ。他人は 403） |

`artifact` の形：`{ id, url, title, description, author_email, created_at, updated_at, tags: string[] }`

入力の決まり：`url` は `https://claude.ai/` で始まる 2048 文字以内、`title` は必須で 200 文字以内、`description` は 2000 文字以内、`tags` は 1 個 50 文字以内で 10 個まで（前後の空白は取り、重複はまとめる）。
POST・PATCH は `Content-Type: application/json` で送る。別のサイトからの書き込み（`Origin` が違う）は 403。
