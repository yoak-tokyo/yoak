import { About } from "@/components/about";
import { Company, Footer } from "@/components/company";
import { Contact } from "@/components/contact";
import { DaiyokuSite } from "@/components/daiyoku/site";
import { Header } from "@/components/header";
import { Kv } from "@/components/kv";
import { Member } from "@/components/member";
import { MissionValue } from "@/components/mission-value";
import { ModeProvider, ModeView } from "@/components/mode";
import { MotionProvider } from "@/components/motion-provider";
import { News } from "@/components/news";
import { Opening } from "@/components/opening";
import { Service } from "@/components/service";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getMembers, getNews } from "@/lib/cms";

export default function Home() {
  const members = getMembers();
  const news = getNews();

  return (
    <MotionProvider>
      <ModeProvider>
        <SmoothScroll />
        <Opening />
        {/* ヘッダーの「Yoak / 大欲」で、同じコンテンツを別の見た目に切り替える */}
        <ModeView
          yoak={
            <>
              <Header />
              <main>
                <Kv />
                <About />
                <Service />
                <MissionValue />
                <Member items={members} />
                <News items={news} />
                <Company />
                <Contact />
              </main>
              <Footer />
            </>
          }
          daiyoku={<DaiyokuSite members={members} news={news} />}
        />
      </ModeProvider>
    </MotionProvider>
  );
}
