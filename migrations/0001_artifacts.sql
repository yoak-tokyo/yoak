-- アーティファクト共有（B-1）。claude.ai のリンクにタイトル・説明・タグを付けて保存する。
-- 分類の仕方（Q-2）は未決のため、いまは汎用のタグだけを持つ。

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,                 -- ランダムな ID（crypto.randomUUID）
  url TEXT NOT NULL,                   -- https://claude.ai/ で始まるリンク
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  author_email TEXT NOT NULL,          -- 登録した人（Access でログインしたメール、小文字）
  created_at TEXT NOT NULL,            -- ISO 8601（UTC）
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_artifacts_created_at ON artifacts (created_at DESC);
CREATE INDEX idx_artifacts_author_email ON artifacts (author_email);

CREATE TABLE tags (
  artifact_id TEXT NOT NULL REFERENCES artifacts (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  PRIMARY KEY (artifact_id, name)
);

CREATE INDEX idx_tags_name ON tags (name);
