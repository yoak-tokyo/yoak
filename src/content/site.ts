// サイトの文言はすべてここで管理する。
// コーポレートメッセージ・ミッション・バリューはドラフト段階なので、
// 文言の調整はこのファイルだけ触れば反映される。

export const kv = {
  catch: ["欲から、", "はじめる。"],
  sub: "Start with desire. Stay curious.",
  reading: "Yoak — 欲（yoku）",
};

export const about = {
  label: "About",
  heading: ["「欲」は、", "いちばん正直な", "原動力だ。"],
  body: [
    ["社名の Yoak は、「欲（よく）」から来ています。"],
    [
      "欲は、どこか隠すべきもののように扱われてきました。",
      "こうなりたいと夢を語るのは、少し恥ずかしい。",
      "成功したい、稼ぎたいと口にするのは、もっと恥ずかしい。",
      "けれど、何かを本気でつくる人の根っこには、いつも",
      "「これが欲しい」という正直な欲があります。",
    ],
    [
      "AIの急速な進化で、思い描いたものを",
      "誰もが驚くほど速くつくれるようになりました。",
      "差を生むのは、どれだけ好奇心を持ち、どれだけ欲しがれるか、です。",
    ],
    [
      "だから私たちは、欲を隠さない。",
      "自分たちが心から欲しいものを、かたちにする。",
      "同じものを欲しがる誰かが、世界のどこかにきっといる。",
      "その人に届けば、それでいい。",
    ],
    ["Yoak は、欲を原動力に、事業をつくる会社です。"],
  ],
};

export type ServiceItem = {
  no: string;
  name: string;
  logo?: "nightbrew";
  category: string;
  yoku: string;
  description: string;
  status: string;
  image?: string;
  link?: { label: string; href: string };
};

export const service = {
  label: "Service",
  heading: "欲から生まれた、事業たち。",
  lead: "メンバーそれぞれの「欲しい」と「やってみたい」から、ひとつずつ事業が生まれていきます。",
  items: [
    {
      no: "01",
      name: "night brew",
      logo: "nightbrew",
      category: "カフェインレスコーヒーブランド",
      yoku: "夜にも、おいしいコーヒーが飲みたい。",
      description:
        "時間帯や体調に関わらずスペシャルティコーヒーを楽しめるよう、浅煎りの豊かな風味にこだわって豆を選び、焙煎しています。夜でも、妊娠中でも、カフェインが気になる日でも。",
      status: "Now available",
      image: "/images/nb-moon.jpg",
      link: { label: "Online store", href: "https://nightbrew.jp/" },
    },
    {
      no: "02",
      name: "コーヒーノミタイ",
      category: "スペシャルティコーヒーのマップ & 記録アプリ",
      yoku: "どこにいても、信頼できる一杯に出会いたい。",
      description:
        "家の近くでも、旅先でも、「ここに行けばおいしいスペシャルティコーヒーが飲める」と信頼できるマップ。自分が飲んだ一杯の記録が、そのマップを育てていきます。",
      status: "In development",
    },
    {
      no: "03",
      name: "Next",
      category: "次の事業",
      yoku: "メンバーの、次の欲から。",
      description:
        "Yoak では、メンバーが本気で「欲しい」と思えるものを事業にしていきます。次は何が生まれるか、私たち自身も楽しみにしています。",
      status: "Coming someday",
    },
  ] satisfies ServiceItem[],
};

export const mission = {
  label: "Mission",
  statement: "欲を、かたちに。",
  en: "Want it. Make it.",
  body: "自分たちが心から欲しいものを、事業としてかたちにし、世に出しつづける。",
};

export const values = {
  label: "Value",
  items: [
    {
      no: "01",
      en: "Want it first.",
      title: "まず、自分が欲しいか",
      body: "セオリーより、自分の「欲しい」を信じる。自分が本気で欲しいものは、きっと誰かも欲しい。",
    },
    {
      no: "02",
      en: "Stay curious.",
      title: "好奇心に、正直に",
      body: "気になったら、とりあえず手を伸ばす。知らないことにのめり込むのを、おもしろがる。次の欲は、そこから生まれる。",
    },
    {
      no: "03",
      en: "Just make it.",
      title: "考えるより、つくる",
      body: "AIを使い倒して、とにかく手を動かす。考えるのは、かたちにしてから。いい答えは、つくりながら見つかる。",
    },
  ],
};

export const member = {
  label: "Member",
  heading: "欲に正直な、メンバーたち。",
  items: [
    {
      name: "弘松 陸",
      en: "Riku Hiromatsu",
      role: "代表社員",
      // TODO: プロフィール・いまの欲を記入
      yoku: "（いまの欲を記入）",
      bio: "（プロフィールを記入）",
    },
    {
      name: "三井 聡一郎",
      en: "Soichiro Mitsui",
      role: "代表社員",
      // TODO: プロフィール・いまの欲を記入
      yoku: "（いまの欲を記入）",
      bio: "（プロフィールを記入）",
    },
  ],
};

export const company = {
  label: "Company",
  rows: [
    { th: "社名", td: ["Yoak合同会社（Yoak, LLC.）"] },
    { th: "創業日", td: ["2025年11月11日"] },
    { th: "代表社員", td: ["弘松 陸", "三井 聡一郎"] },
    { th: "資本金", td: ["50万円"] },
    {
      th: "事業内容",
      td: [
        "カフェインレスコーヒー商品の企画・開発",
        "ドリップバッグおよび焙煎豆の製造・販売",
        "ECサイトを通じたオンライン販売",
      ],
    },
    {
      th: "本店所在地",
      td: ["〒154-0004", "東京都世田谷区太子堂4丁目18番15号", "マガザン三軒茶屋2 3F-3"],
    },
  ],
};

export const nav = [
  { label: "About", href: "#about" },
  { label: "Service", href: "#service" },
  { label: "Mission", href: "#mission" },
  { label: "Member", href: "#member" },
  { label: "Company", href: "#company" },
];
