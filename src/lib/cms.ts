// News / Member のデータ取得（ビルド時にサーバー側でだけ使う）。
// scripts/fetch-cms.mjs が Notion から書き出した .cms/cms.json を読む。
// ファイルがなければ（NOTION_TOKEN なしの手元開発など）site.ts の仮データを使う。

import fs from "node:fs";
import path from "node:path";
import { member, news, type MemberItem, type NewsItem } from "@/content/site";

export type NewsEntry = NewsItem & {
  slug?: string;
  html?: string;
};

type CmsData = {
  news: NewsEntry[];
  members: MemberItem[];
};

let cache: CmsData | undefined;

function load(): CmsData {
  if (cache) return cache;
  const file = path.join(process.cwd(), ".cms", "cms.json");
  cache = fs.existsSync(file)
    ? (JSON.parse(fs.readFileSync(file, "utf8")) as CmsData)
    : { news: news.items, members: member.items };
  return cache;
}

export const getNews = () => load().news;
export const getMembers = () => load().members;

// 詳細ページを持つ News（本文があり、外部リンクでないもの）
export const getNewsWithBody = () =>
  getNews().filter((item): item is NewsEntry & { slug: string; html: string } =>
    Boolean(item.slug && item.html),
  );
