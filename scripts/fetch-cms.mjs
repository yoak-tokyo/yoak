// ビルド前に Notion から News / Member を取得し、.cms/cms.json に書き出す。
// 画像は Notion の署名付き URL が約1時間で失効するため、public/cms/ にダウンロードして同梱する。
//
// - NOTION_TOKEN が未設定なら何もしない（src/content/site.ts の仮データでビルドされる）
// - CMS_REQUIRED=1 のときは、NOTION_TOKEN 未設定や取得失敗でビルドを止める（本番用）

import { Client } from "@notionhq/client";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const NEWS_DATA_SOURCE_ID = "c0009285-c3b5-462b-9da4-1c9d87bfe03e";
const MEMBER_DATA_SOURCE_ID = "c77258d3-67c3-4ce1-8cdd-a4c00cddf9bd";

const OUT_DIR = ".cms";
const OUT_FILE = path.join(OUT_DIR, "cms.json");
const IMAGE_DIR = path.join("public", "cms");
const IMAGE_URL_BASE = "/cms";
// 画像はこの幅に収めて WebP に変換する（スマホで重くならないように）
const IMAGE_MAX_WIDTH = 1600;

const required = process.env.CMS_REQUIRED === "1";
const token = process.env.NOTION_TOKEN;

function fail(message) {
  console.error(`[cms] ${message}`);
  process.exit(1);
}

if (!token) {
  if (required) fail("CMS_REQUIRED=1 ですが NOTION_TOKEN が設定されていません。");
  console.warn("[cms] NOTION_TOKEN が未設定のため、site.ts の仮データでビルドします。");
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  process.exit(0);
}

const notion = new Client({ auth: token });

// ---------- プロパティの取り出し ----------

const plain = (richText = []) => richText.map((t) => t.plain_text).join("").trim();

function prop(page, name) {
  const p = page.properties[name];
  if (!p) return undefined;
  switch (p.type) {
    case "title":
      return plain(p.title);
    case "rich_text":
      return plain(p.rich_text);
    case "url":
      return p.url ?? undefined;
    case "select":
      return p.select?.name;
    case "number":
      return p.number ?? undefined;
    case "date":
      return p.date?.start;
    case "checkbox":
      return p.checkbox;
    case "files":
      return p.files;
    default:
      return undefined;
  }
}

async function queryAll(dataSourceId, sorts) {
  const results = [];
  let cursor;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: "公開", checkbox: { equals: true } },
      sorts,
      start_cursor: cursor,
    });
    results.push(...res.results.filter((r) => r.object === "page" && "properties" in r));
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

// ---------- 画像のダウンロード ----------

const EXT_BY_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

async function download(url, baseName) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`画像の取得に失敗しました (${res.status}): ${baseName}`);
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const original = Buffer.from(await res.arrayBuffer());

  // GIF はアニメーションを壊さないようそのまま。それ以外は縮小して WebP にする
  let buf = original;
  let ext = EXT_BY_TYPE[type] ?? (path.extname(new URL(url).pathname) || ".jpg");
  if (type !== "image/gif") {
    buf = await sharp(original)
      .rotate() // スマホ写真の EXIF の向きを反映
      .resize({ width: IMAGE_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    ext = ".webp";
  }

  // 内容のハッシュをファイル名に含め、差し替え時にキャッシュが残らないようにする
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 8);
  const fileName = `${baseName}-${hash}${ext}`;
  await fs.writeFile(path.join(IMAGE_DIR, fileName), buf);
  return `${IMAGE_URL_BASE}/${fileName}`;
}

const fileUrl = (f) => (f.type === "external" ? f.external.url : f.file.url);

// ---------- 本文（ブロック）→ HTML ----------

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function richTextToHtml(richText = []) {
  return richText
    .map((t) => {
      let html = escapeHtml(t.plain_text).replace(/\n/g, "<br>");
      const a = t.annotations;
      if (a.code) html = `<code>${html}</code>`;
      if (a.bold) html = `<strong>${html}</strong>`;
      if (a.italic) html = `<em>${html}</em>`;
      if (a.strikethrough) html = `<s>${html}</s>`;
      if (a.underline) html = `<u>${html}</u>`;
      if (t.href) {
        const href = escapeHtml(t.href);
        const external = /^https?:\/\//.test(t.href);
        html = `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${html}</a>`;
      }
      return html;
    })
    .join("");
}

async function listChildren(blockId) {
  const blocks = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor });
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

async function blocksToHtml(blocks, imagePrefix) {
  const out = [];
  let list = null; // { tag: "ul" | "ol", items: string[] }

  const flush = () => {
    if (list) out.push(`<${list.tag}>${list.items.join("")}</${list.tag}>`);
    list = null;
  };

  for (const block of blocks) {
    const type = block.type;
    const data = block[type];

    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      const tag = type === "bulleted_list_item" ? "ul" : "ol";
      if (list?.tag !== tag) {
        flush();
        list = { tag, items: [] };
      }
      const children = block.has_children
        ? await blocksToHtml(await listChildren(block.id), imagePrefix)
        : "";
      list.items.push(`<li>${richTextToHtml(data.rich_text)}${children}</li>`);
      continue;
    }
    flush();

    switch (type) {
      case "paragraph": {
        const html = richTextToHtml(data.rich_text);
        if (html) out.push(`<p>${html}</p>`);
        break;
      }
      case "heading_1":
      case "heading_2":
        out.push(`<h2>${richTextToHtml(data.rich_text)}</h2>`);
        break;
      case "heading_3":
        out.push(`<h3>${richTextToHtml(data.rich_text)}</h3>`);
        break;
      case "quote":
        out.push(`<blockquote>${richTextToHtml(data.rich_text)}</blockquote>`);
        break;
      case "callout":
        out.push(`<aside>${richTextToHtml(data.rich_text)}</aside>`);
        break;
      case "divider":
        out.push("<hr>");
        break;
      case "code":
        out.push(`<pre><code>${escapeHtml(plain(data.rich_text))}</code></pre>`);
        break;
      case "image": {
        const src = await download(fileUrl(data), `${imagePrefix}-${block.id.replace(/-/g, "").slice(-8)}`);
        const caption = richTextToHtml(data.caption);
        const alt = escapeHtml(plain(data.caption));
        out.push(
          `<figure><img src="${src}" alt="${alt}" loading="lazy">${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`,
        );
        break;
      }
      default:
        console.warn(`[cms] 未対応のブロックを読み飛ばしました: ${type}`);
    }
  }
  flush();
  return out.join("\n");
}

// ---------- News / Member ----------

const formatDate = (iso) => (iso ? iso.slice(0, 10).replace(/-/g, ".") : "");

async function fetchNews() {
  const pages = await queryAll(NEWS_DATA_SOURCE_ID, [{ property: "公開日", direction: "descending" }]);
  const items = [];
  for (const page of pages) {
    const title = prop(page, "タイトル");
    if (!title) continue;
    const id = page.id.replace(/-/g, "");
    const external = prop(page, "外部リンク");
    const rawSlug = prop(page, "スラッグ");
    if (rawSlug && !/^[a-z0-9-]+$/.test(rawSlug)) {
      console.warn(`[cms] スラッグ「${rawSlug}」は半角英小文字・数字・ハイフン以外を含むため、ページIDを使います。`);
    }
    const slug = rawSlug && /^[a-z0-9-]+$/.test(rawSlug) ? rawSlug : id;

    const html = external ? "" : await blocksToHtml(await listChildren(page.id), `news-${id.slice(-8)}`);
    items.push({
      date: formatDate(prop(page, "公開日")),
      category: prop(page, "カテゴリ") ?? "",
      title,
      ...(external ? { href: external } : html ? { href: `/news/${slug}`, slug, html } : {}),
    });
  }
  return items;
}

const LINK_PROPS = [
  ["X", "x"],
  ["note", "note"],
  ["Instagram", "instagram"],
  ["ポートフォリオ", "portfolio"],
];

async function fetchMembers() {
  const pages = await queryAll(MEMBER_DATA_SOURCE_ID, [{ property: "並び順", direction: "ascending" }]);
  const items = [];
  for (const page of pages) {
    const name = prop(page, "名前");
    if (!name) continue;
    const files = prop(page, "写真") ?? [];
    const photo = files[0]
      ? await download(fileUrl(files[0]), `member-${page.id.replace(/-/g, "").slice(-8)}`)
      : undefined;
    items.push({
      name,
      en: prop(page, "英語名") ?? "",
      role: prop(page, "肩書") ?? "",
      ...(photo ? { photo } : {}),
      yoku: prop(page, "いまの欲") ?? "",
      bio: prop(page, "プロフィール") ?? "",
      links: LINK_PROPS.flatMap(([propName, type]) => {
        const href = prop(page, propName);
        return href ? [{ type, href }] : [];
      }),
    });
  }
  return items;
}

try {
  await fs.rm(IMAGE_DIR, { recursive: true, force: true });
  await fs.mkdir(IMAGE_DIR, { recursive: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const [news, members] = await Promise.all([fetchNews(), fetchMembers()]);
  await fs.writeFile(
    OUT_FILE,
    JSON.stringify({ fetchedAt: new Date().toISOString(), news, members }, null, 2),
  );
  console.log(`[cms] Notion から取得しました: News ${news.length}件 / Member ${members.length}名`);
} catch (err) {
  // 取得に失敗したら空のページを公開しないよう、ビルドを止める
  fail(`Notion からの取得に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
}
