import type { Metadata } from "next";
import Link from "next/link";
import { privacy } from "@/content/privacy";
import { SubpageFooter, SubpageHeader } from "@/components/subpage-header";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Yoak, LLC.",
  description: "Yoak合同会社のプライバシーポリシーです。",
};

export default function PrivacyPage() {
  return (
    <>
      <SubpageHeader />
      <main className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[720px]">
          <p className="label text-mute">privacy policy</p>
          <h1 className="mt-4 font-en text-4xl font-medium tracking-tight md:text-5xl">
            {privacy.title}
          </h1>
          <p className="mt-6 text-sm text-mute">{privacy.updated}</p>

          <div className="mt-16 space-y-14">
            {privacy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-medium tracking-tight md:text-xl">{section.heading}</h2>
                {section.paragraphs && (
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((p, i) => (
                      <p key={i} className="text-[15px] leading-[2.1] text-ink/80">
                        {p}
                      </p>
                    ))}
                  </div>
                )}
                {section.list && (
                  <ul className="mt-4 list-disc space-y-2 pl-5">
                    {section.list.map((item, i) => (
                      <li key={i} className="text-[15px] leading-[2.1] text-ink/80">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-20 border-t border-line pt-8">
            <Link href="/" className="label text-mute transition-colors hover:text-ink">
              back to home
            </Link>
          </div>
        </div>
      </main>
      <SubpageFooter />
    </>
  );
}
