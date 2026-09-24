import { About } from "@/components/about";
import { Company, Footer } from "@/components/company";
import { Contact } from "@/components/contact";
import { Header } from "@/components/header";
import { Kv } from "@/components/kv";
import { Member } from "@/components/member";
import { MotionProvider } from "@/components/motion-provider";
import { MissionValue } from "@/components/mission-value";
import { News } from "@/components/news";
import { Opening } from "@/components/opening";
import { Service } from "@/components/service";
import { getMembers, getNews } from "@/lib/cms";
import { SmoothScroll } from "@/components/smooth-scroll";

export default function Home() {
  return (
    <MotionProvider>
      <SmoothScroll />
      <Opening />
      <Header />
      <main>
        <Kv />
        <About />
        <Service />
        <MissionValue />
        <Member items={getMembers()} />
        <News items={getNews()} />
        <Company />
        <Contact />
      </main>
      <Footer />
    </MotionProvider>
  );
}
