// 메뉴판에서 고를 수 있는 외국어. 한국어는 항상 크게 보이고, 고른 언어는 작게 보인다.
//
// 언어를 늘리는 방법 (두 군데만 고치면 된다)
// 1. 아래 languages에 한 줄을 넣는다. 예: { code: "fr", label: "Français" },
// 2. 메뉴마다 names에 그 언어 이름을 넣는다. 예: fr: "Café américain",
//    아직 번역하지 못한 메뉴는 비워 둬도 된다. 그 메뉴는 영어(en)로 보인다.
export const languages = [
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "vi", label: "Tiếng Việt" },
] as const;

export type LangCode = (typeof languages)[number]["code"];

// 카페 메뉴 목록 하나. 메뉴판과 계산대가 모두 이 목록을 보고 그린다.
export const menu: {
  name: string;
  price: string;
  emoji: string;
  hot: boolean;
  names: { en: string } & Partial<Record<LangCode, string>>; // 영어는 꼭 있어야 하고, 나머지는 빠져도 된다
}[] = [
  {
    name: "아메리카노", price: "4,500원", emoji: "☕", hot: true,
    names: { en: "Americano", ja: "アメリカーノ", zh: "美式咖啡", es: "Americano", vi: "Cà phê Americano" },
  },
  {
    name: "카페라테", price: "5,000원", emoji: "🥛", hot: true,
    names: { en: "Caffe Latte", ja: "カフェラテ", zh: "拿铁咖啡", es: "Café latte", vi: "Cà phê latte" },
  },
  {
    name: "녹차라테", price: "5,500원", emoji: "🍵", hot: true,
    names: { en: "Green Tea Latte", ja: "抹茶ラテ", zh: "绿茶拿铁", es: "Latte de té verde", vi: "Latte trà xanh" },
  },
  {
    name: "치즈케이크", price: "6,000원", emoji: "🍰", hot: false,
    names: { en: "Cheesecake", ja: "チーズケーキ", zh: "芝士蛋糕", es: "Tarta de queso", vi: "Bánh phô mai" },
  },
];
