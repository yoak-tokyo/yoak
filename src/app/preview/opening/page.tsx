import type { Metadata } from "next";
import { OpeningLab } from "@/components/opening-lab";

// オープニング案の比較用。方向性が決まったら消す
export const metadata: Metadata = {
  title: "Opening preview | Yoak, LLC.",
  robots: { index: false, follow: false },
};

export default function OpeningPreviewPage() {
  return <OpeningLab />;
}
