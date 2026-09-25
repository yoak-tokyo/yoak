"use client";

import type { MemberItem, NewsItem } from "@/content/site";
import { DyAbout } from "./about";
import { DyCompany, DyContact, DyFooter } from "./company";
import { DyHeader } from "./header";
import { DyKv } from "./kv";
import { DyMember } from "./member";
import { DyMission } from "./mission";
import { DyNews } from "./news";
import { DyCursor, Grain, ScrollBar } from "./parts";
import { DyService } from "./service";

// スーパー大欲モードのトップページ。コンテンツは Yoak モードと同じものを使う
export function DaiyokuSite({ members, news }: { members: MemberItem[]; news: NewsItem[] }) {
  return (
    <>
      <ScrollBar />
      <DyHeader />
      <main>
        <DyKv />
        <DyAbout />
        <DyService />
        <DyMission />
        <DyMember items={members} />
        <DyNews items={news} />
        <DyCompany />
        <DyContact />
      </main>
      <DyFooter />
      <Grain />
      <DyCursor />
    </>
  );
}
