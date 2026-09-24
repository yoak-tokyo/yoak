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
