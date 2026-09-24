// お問い合わせセクションの文言・フィールド定義はすべてここで管理する。
// site.ts と同じ方針：文言の調整はこのファイルだけ触れば反映される。

export const contact = {
  label: "contact",
  heading: ["お気軽に、", "ご連絡ください。"],
  lead: "事業やサービスに関するご相談、取材・メディア掲載のご依頼、採用に関するお問い合わせなど、どうぞお気軽にご連絡ください。",
  categories: [
    "事業・協業について",
    "取材・メディアについて",
    "採用について",
    "その他",
  ],
  privacyHref: "/privacy",
  submitLabel: "send",
  submittingLabel: "送信中…",
  errorMessage: "送信に失敗しました。",
  errorHint: "時間をおいて、もう一度お試しください。入力内容はこのまま保持されます。",
  turnstileMessage: "送信前の確認が完了していません。少し待ってから、もう一度お試しください。",
  // 送信後に表示するサンクスページ（/contact/thanks）
  thanksHref: "/contact/thanks",
  successHeading: "お問い合わせありがとうございます。",
  successBody: "内容を確認のうえ、担当者よりご連絡いたします。今しばらくお待ちください。",
};
