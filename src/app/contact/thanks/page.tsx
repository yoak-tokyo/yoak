import type { Metadata } from "next";
import Link from "next/link";
import { contact } from "@/content/contact";
import { SubpageFooter, SubpageHeader } from "@/components/subpage-header";

export const metadata: Metadata = {
  title: "お問い合わせありがとうございます | Yoak, LLC.",
  robots: { index: false, follow: false },
};

export default function ContactThanksPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SubpageHeader />
      <main className="flex flex-1 items-center px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto w-full max-w-[720px]">
          <p className="label text-mute">thank you</p>
          <h1 className="mt-6 text-3xl leading-[1.5] font-medium tracking-tight md:text-4xl">
            {contact.successHeading}
          </h1>
          <p className="mt-6 text-[15px] leading-[2.1] text-ink/80">{contact.successBody}</p>

          <div className="mt-16 border-t border-line pt-8">
            <Link href="/" className="label text-mute transition-colors hover:text-ink">
              back to home
            </Link>
          </div>
        </div>
      </main>
      <SubpageFooter />
    </div>
  );
}
