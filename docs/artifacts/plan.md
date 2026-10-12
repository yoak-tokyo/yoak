# アーティファクト共有 計画書

Yoak メンバーが作った Claude のアーティファクト（claude.ai のリンク）を登録し、一覧・検索・分類して共有するページ。
コーポレートサイト（このリポジトリ）の中に `/artifacts` として作る。

## ゴール（リリース1）

Yoak メンバーと許可した人だけがログインして、アーティファクトのリンクを登録・一覧・絞り込みできる状態で yoak.tokyo に出す。

## 全体の形

```
ブラウザ ──> Cloudflare Access（/artifacts*, /api/artifacts* だけ保護。Google ログイン＋許可メール）
          ──> Worker（worker/index.ts）
                ├─ /artifacts*, /api/artifacts* : Access の JWT を検証（Basic 認証はかけない）
                │     └─ /api/artifacts* : worker/artifacts.ts → D1
                ├─ /api/contact : 既存
                └─ それ以外 : 既存の Basic 認証 → 静的アセット
```

- 画面は Next.js の静的書き出し（`src/app/artifacts/`）。データはブラウザから `/api/artifacts` を呼んで取る
- データは Cloudflare D1。マイグレーションは `migrations/`
- ログインした人のメールアドレスを、Access の JWT（`Cf-Access-Jwt-Assertion`）を Worker で検証して取り出す。workers.dev からの直アクセスは JWT が無いので弾く

## 作業一覧（WBS）

担当は触るディレクトリで分ける。

| ID | 作業 | 担当 | 触る範囲 | 待つもの |
| --- | --- | --- | --- | --- |
| B-0 | PR で lint・型チェック・build を回す CI | 基盤 | `.github/workflows/ci.yml` | なし |
| B-1 | D1 のスキーマと登録・一覧 API、Access の JWT 検証 | 基盤 | `worker/`、`migrations/`、`wrangler.jsonc`、`package.json` | なし（分類の決定 Q-2 で列を足すことがある） |
| U-1 | 画面の方向性のモック（2〜3案） | デザイン | リポジトリは触らない（アーティファクトで公開） | なし |
| W-1 | 画面の実装（一覧・登録・編集） | Web | `src/app/artifacts/`、`src/components/artifacts/` | UX-1、Q-1、Q-2、B-1 |
| B-2 | Cloudflare の本番設定の確認とリリース | 基盤 | 設定手順書 | T-1、W-1 |

## PO が決めること

- 画面・見た目・文言（UX-1）
- 機能の取捨（Q-1）
- 分類の仕方（Q-2）
- 入れる人の範囲（Q-3）

## PO にしかできない作業

- T-1 Cloudflare の設定（Zero Trust の Access Application、Google ログイン、D1 の作成、シークレット）
