# アーティファクト共有 決定ログ

新しいものを下に足す。番号は `AD-<連番>`。

## AD-1 コーポレートサイトのリポジトリの中に作る（2026-10-13・PO）

別リポジトリにはせず、yoak リポジトリの `/artifacts` として作る。

## AD-2 アーティファクトは URL を登録する（2026-10-13・PO）

本体は claude.ai に置いたまま、リンクにタイトル・説明・分類などを付けて一覧にする。HTML のアップロードはしない。

## AD-3 見られるのは Google アカウントでログインした人と、許可した人（2026-10-13・PO）

基本は Google アカウントでログインする。許可した別のアカウントも見られるようにする。

## AD-4 認証は Cloudflare Access のパス別 Application、データは D1（2026-10-13・PM）

- `/artifacts*` と `/api/artifacts*` だけを Access で保護し、コーポレートサイトの公開ページには影響させない
- Worker 単位の Access（`ctx.access`）は Worker 全体が保護されるので使わない
- Worker で `Cf-Access-Jwt-Assertion` を jose で検証する（署名・aud・iss・期限）。workers.dev など Access を通らない経路は JWT が無いので 401
- 許可メールの人は Access の One-time PIN で入れる
- 保存先は Cloudflare D1

## AD-5 `/artifacts` 配下には Basic 認証をかけない（2026-10-13・PM）

プレビュー用の Basic 認証と Access の二重ログインを避けるため、`/artifacts*` と `/api/artifacts*` は Access の JWT 検証だけにする。

## AD-6 PR で lint・型チェック・build を回す CI を足す（2026-10-13・PM）

マージの条件にするため。
