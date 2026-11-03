import type { LangCode } from "./i18n";

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
    names: { en: "Americano", de: "Americano", ja: "アメリカーノ", zh: "美式咖啡", es: "Americano", vi: "Cà phê Americano" },
  },
  {
    name: "카페라테", price: "5,000원", emoji: "🥛", hot: true,
    names: { en: "Caffe Latte", de: "Milchkaffee (Latte)", ja: "カフェラテ", zh: "拿铁咖啡", es: "Café latte", vi: "Cà phê latte" },
  },
  {
    name: "녹차라테", price: "5,500원", emoji: "🍵", hot: true,
    names: { en: "Green Tea Latte", de: "Grüntee-Latte", ja: "抹茶ラテ", zh: "绿茶拿铁", es: "Latte de té verde", vi: "Latte trà xanh" },
  },
  {
    name: "치즈케이크", price: "6,000원", emoji: "🍰", hot: false,
    names: { en: "Cheesecake", de: "Käsekuchen", ja: "チーズケーキ", zh: "芝士蛋糕", es: "Tarta de queso", vi: "Bánh phô mai" },
  },
];
