# yoak

Yoak合同会社のコーポレートサイト（https://yoak.tokyo/）。

- Next.js（App Router / `output: "export"` の静的書き出し）
- Tailwind CSS v4
- Motion（アニメーション）/ Lenis（スムーススクロール）
- Cloudflare Workers の静的アセットで配信

## 開発

```sh
npm install
npm run dev        # http://localhost:3000
```

## 文言の編集

サイトの文言（コーポレートメッセージ、Service、Mission / Value、Member、会社概要）は
すべて `src/content/site.ts` にまとまっている。文言だけの変更はこのファイルだけ触ればよい。

画像は `public/images/` に置く。

## デプロイ

```sh
npx wrangler login   # 初回のみ
npm run preview      # ビルドして wrangler でローカル確認
npm run deploy       # ビルドして Cloudflare にデプロイ
```

独自ドメイン（yoak.tokyo）は Cloudflare ダッシュボードの Workers → Settings → Domains & Routes から設定する。

## プレビューのパスワード保護

プレビュー: https://yoak-corporate-site.yoak-corporate-site.workers.dev

`worker/index.ts` で Basic 認証をかけている。ユーザー名は `wrangler.jsonc` の `vars.BASIC_AUTH_USER`、パスワードは Cloudflare のシークレットに保存している。

```sh
npx wrangler secret put BASIC_AUTH_PASSWORD     # 変更
npx wrangler secret delete BASIC_AUTH_PASSWORD  # 削除すると認証なしで公開される
```

## Notion CMS（News / Member）

News と Member は Notion の「コーポレートサイトCMS」ページの DB で管理している。
`npm run build` の前に `scripts/fetch-cms.mjs` が Notion から取得し、`.cms/cms.json` と `public/cms/`（画像）に書き出す。

- `NOTION_TOKEN` が未設定なら `src/content/site.ts` の仮データでビルドする（手元の開発用）
- `CMS_REQUIRED=1` のときは、トークン未設定や取得失敗でビルドを止める（本番用）
- 反映タイミング：毎朝 5:00（`.github/workflows/cms-deploy.yml`）、Actions の「Run workflow」で手動、`main` への push

| 環境 | 設定するもの |
|---|---|
| Cloudflare（Workers → Settings → Build → Variables and secrets） | `NOTION_TOKEN`（Secret）、`CMS_REQUIRED=1` |
| GitHub（Settings → Secrets and variables → Actions） | Secrets: `NOTION_TOKEN` `CLOUDFLARE_API_TOKEN` `CLOUDFLARE_ACCOUNT_ID` |

## お問い合わせ（Notion + Slack）

フォームは `worker/contact.ts` の `POST /api/contact` に送信され、Notion の Contact DB に保存、Slack に通知する。
ボット対策に Cloudflare Turnstile と、見えないダミー欄を使っている。
Turnstile のサイトキーは `src/components/turnstile.tsx` に直接書いている（`next dev` ではテスト用キー）。

```sh
npx wrangler secret put NOTION_CONTACT_TOKEN   # Contact DB に「追加だけ」できるインテグレーションのトークン
npx wrangler secret put SLACK_WEBHOOK_URL      # 通知先チャンネルの Incoming Webhook URL
npx wrangler secret put TURNSTILE_SECRET_KEY   # Turnstile のシークレットキー
```

## アーティファクト共有（/artifacts）

Yoak メンバーが作った Claude のアーティファクト（claude.ai のリンク）を登録・一覧・検索するページ。
計画は `docs/artifacts/plan.md`、決定は `docs/artifacts/decisions.md`。

- 公開先は Worker の workers.dev のアドレス。workers.dev とプレビュー URL に Worker 単位で Cloudflare Access（Google ログイン）をかける。コーポレートサイトのプレビューも同じログインの対象になる
- Worker（`worker/access.ts`）が `Cf-Access-Jwt-Assertion` を検証して、ログインした人のメールを取り出す
- `/artifacts*` と `/api/artifacts*` は Access の JWT だけで判定し、Basic 認証はかけない。ほかのページも、JWT が正しければ Basic 認証をかけない（JWT が無ければ今までどおり Basic 認証）
- 将来 yoak.tokyo をこの Worker に向けるときは、`/artifacts*` と `/api/artifacts*` にパス別の Access Application を足す
- API は `worker/artifacts.ts`、データは D1（binding 名 `DB`、スキーマは `migrations/`）。D1 が無いあいだは `/api/artifacts*` が 503

Cloudflare の設定（D1 の作成、Access、`ACCESS_TEAM_DOMAIN`・`ACCESS_AUD`）とローカル開発の仕方は `docs/artifacts/setup.md`。

```sh
cp .dev.vars.example .dev.vars                                       # ローカル用のログインメール
npx wrangler d1 migrations apply DB --local -c wrangler.local.jsonc  # ローカル D1 を作る
npm run build && npx wrangler dev -c wrangler.local.jsonc
```
