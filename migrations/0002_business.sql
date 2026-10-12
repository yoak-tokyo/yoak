-- 事業の項目（B-3、AD-10）。事業は Yoak / nightbrew / nomitai / LAMP / CaseMatch / その他 から1つ必須。
-- 値の一覧は worker/artifacts.ts の BUSINESSES で持ち、検証もそちらでする（ここでは CHECK を付けない。
-- 事業が増えたときにテーブルを作り直さずに済むように）。既存の行は「その他」になる。

ALTER TABLE artifacts ADD COLUMN business TEXT NOT NULL DEFAULT 'その他';

-- 事業での絞り込み（新しい順で並べる）用
CREATE INDEX idx_artifacts_business_created_at ON artifacts (business, created_at DESC);
