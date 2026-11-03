import type { LangCode } from "./i18n";

// 카페 메뉴 목록 하나. 메뉴판과 계산대가 모두 이 목록을 보고 그린다.
export const menu: {
  name: string;
  price: string;
  roman: string; // 한국어 발음 (로마자)
  emoji: string;
  hot: boolean;
  names: { en: string } & Partial<Record<LangCode, string>>; // 영어는 꼭 있어야 하고, 나머지는 빠져도 된다
}[] = [
  {
    name: "아메리카노", roman: "amerikano", price: "4,500원", emoji: "☕", hot: true,
    names: { en: "Americano", de: "Americano", ja: "アメリカーノ", zh: "美式咖啡", es: "Americano", vi: "Cà phê Americano" },
  },
  {
    name: "카페라테", roman: "kapeurate", price: "5,000원", emoji: "🥛", hot: true,
    names: { en: "Caffe Latte", de: "Milchkaffee (Latte)", ja: "カフェラテ", zh: "拿铁咖啡", es: "Café latte", vi: "Cà phê latte" },
  },
  {
    name: "녹차라테", roman: "nokcharate", price: "5,500원", emoji: "🍵", hot: true,
    names: { en: "Green Tea Latte", de: "Grüntee-Latte", ja: "抹茶ラテ", zh: "绿茶拿铁", es: "Latte de té verde", vi: "Latte trà xanh" },
  },
  {
    name: "치즈케이크", roman: "chijeukeikeu", price: "6,000원", emoji: "🍰", hot: false,
    names: { en: "Cheesecake", de: "Käsekuchen", ja: "チーズケーキ", zh: "芝士蛋糕", es: "Tarta de queso", vi: "Bánh phô mai" },
  },
  {
    name: "소금빵", roman: "sogeumppang", price: "3,500원", emoji: "🥖", hot: false,
    names: { en: "Salt Bread", de: "Salzbrötchen", ja: "塩パン", zh: "盐面包", es: "Pan de sal", vi: "Bánh mì muối" },
  },
  {
    name: "크루아상", roman: "keuruasang", price: "4,000원", emoji: "🥐", hot: false,
    names: { en: "Croissant", de: "Croissant", ja: "クロワッサン", zh: "可颂", es: "Cruasán", vi: "Bánh sừng bò" },
  },
  {
    name: "오렌지주스", roman: "orenjijuseu", price: "5,500원", emoji: "🍊", hot: false,
    names: { en: "Orange Juice", de: "Orangensaft", ja: "オレンジジュース", zh: "橙汁", es: "Zumo de naranja", vi: "Nước cam" },
  },
  {
    name: "딸기주스", roman: "ttalgijuseu", price: "6,000원", emoji: "🍓", hot: false,
    names: { en: "Strawberry Juice", de: "Erdbeersaft", ja: "いちごジュース", zh: "草莓汁", es: "Zumo de fresa", vi: "Nước ép dâu" },
  },
];
