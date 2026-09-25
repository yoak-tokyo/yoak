import type { Metadata } from "next";
import { DaiyokuLab } from "@/components/daiyoku-lab";
import { MotionProvider } from "@/components/motion-provider";

// 大欲モードの方向性の比較用。決まったら消す
export const metadata: Metadata = {
  title: "大欲 direction preview | Yoak, LLC.",
  robots: { index: false, follow: false },
};

export default function DaiyokuPreviewPage() {
  return (
    <MotionProvider>
      <DaiyokuLab />
    </MotionProvider>
  );
}
