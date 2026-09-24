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

`worker/index.ts` で Basic 認証をかけている。ユーザー名は `wrangler.jsonc` の `vars.BASIC_AUTH_USER`、パスワードは Cloudflare のシークレットに保存している。

```sh
npx wrangler secret put BASIC_AUTH_PASSWORD     # 変更
npx wrangler secret delete BASIC_AUTH_PASSWORD  # 削除すると認証なしで公開される
```
