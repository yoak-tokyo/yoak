-- 登録者の名前（B-5、AD-16・AD-18）。メール → 表示名。
-- source は名前の出どころ：google（Access の get-identity から取った名前）か self（本人が入れた名前）。
-- self は google で上書きしない（worker/artifacts.ts で守る）。

CREATE TABLE profiles (
  email TEXT PRIMARY KEY CHECK (email = lower(email)),  -- Access でログインしたメール（小文字）
  name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('google', 'self')),
  updated_at TEXT NOT NULL                              -- ISO 8601（UTC）
);
