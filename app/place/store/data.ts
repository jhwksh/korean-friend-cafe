import type { Line } from "../../surprises";
import {
  BAG_ASK,
  BAG_ECHO,
  BAG_TIP,
  BAG_YES,
  HEAT_ASK,
  HEAT_ECHO,
  HEAT_TIP,
  HEAT_YES,
  NO_THANKS,
  POINTS_ASK,
  POINTS_ECHO,
  POINTS_TIP,
  POINTS_YES,
  RECEIPT_ASK,
  RECEIPT_DISCARD,
  RECEIPT_ECHO,
  RECEIPT_TIP,
  RECEIPT_YES,
  type Tr,
} from "./text";

// 🏪 가게 이름: 나중에 진짜 이름으로 바꿀 때 이 한 줄만 고치면 된다.
export const STORE_NAME = "한국어 친구 편의점";

// 바구니 물건: 이모지 + 한국어(발음·뜻) + 연습용 가격
export type BasketItem = { emoji: string; line: Line; price: number };
export type BasketId = "A" | "B" | "C";
export type Basket = { id: BasketId; heat: boolean; items: BasketItem[] };

const DOSIRAK: BasketItem = {
  emoji: "🍱",
  line: {
    ko: "도시락",
    roman: "dosirak",
    mean: { en: "lunch box", de: "Lunchbox", ja: "お弁当", zh: "便当", es: "fiambrera", vi: "cơm hộp", ru: "ланч-бокс" },
  },
  price: 4900,
};
const BANANA_MILK: BasketItem = {
  emoji: "🍌",
  line: {
    ko: "바나나우유",
    roman: "bananauyu",
    mean: { en: "banana milk", de: "Bananenmilch", ja: "バナナ牛乳", zh: "香蕉牛奶", es: "leche de plátano", vi: "sữa chuối", ru: "банановое молоко" },
  },
  price: 1700,
};
const TRIANGLE_KIMBAP: BasketItem = {
  emoji: "🍙",
  line: {
    ko: "삼각김밥",
    roman: "samgakgimbap",
    mean: {
      en: "triangle rice ball",
      de: "dreieckiges Reisbällchen",
      ja: "三角おにぎり",
      zh: "三角饭团",
      es: "triángulo de arroz",
      vi: "cơm nắm tam giác",
      ru: "треугольный кимбап",
    },
  },
  price: 1500,
};
const CUP_NOODLES: BasketItem = {
  emoji: "🍜",
  line: {
    ko: "컵라면",
    roman: "keomnamyeon",
    mean: { en: "cup noodles", de: "Instantnudeln im Becher", ja: "カップラーメン", zh: "杯面", es: "fideos instantáneos", vi: "mì ly", ru: "лапша в стакане" },
  },
  price: 1300,
};
const SNACKS: BasketItem = {
  emoji: "🍪",
  line: {
    ko: "과자",
    roman: "gwaja",
    mean: { en: "snacks", de: "Snacks", ja: "お菓子", zh: "零食", es: "aperitivos", vi: "bánh snack", ru: "снеки" },
  },
  price: 1800,
};
const COLA: BasketItem = {
  emoji: "🥤",
  line: {
    ko: "콜라",
    roman: "kolla",
    mean: { en: "cola", de: "Cola", ja: "コーラ", zh: "可乐", es: "cola", vi: "nước ngọt cola", ru: "кола" },
  },
  price: 2000,
};

// 세 바구니 중 하나를 무작위로 고른다 (한 번 더 할 때는 바로 전과 다른 바구니)
export const BASKETS: Basket[] = [
  { id: "A", heat: true, items: [DOSIRAK, BANANA_MILK] },
  { id: "B", heat: true, items: [TRIANGLE_KIMBAP, CUP_NOODLES] },
  { id: "C", heat: false, items: [SNACKS, COLA] },
];

export function pickBasket(exclude?: BasketId): Basket {
  const pool = BASKETS.filter((basket) => basket.id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

// 8000 → "8,000원" (카페 OrderProvider.won과 같은 모양)
export function won(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

// 계산대 순서: (데우기) → 포인트·봉투(매번 순서를 바꾼다) → 결제 → 영수증
export type StepId = "heat" | "points" | "bag" | "pay" | "receipt";
export type Way = "tap" | "blocks";

export function buildSeq(basket: Basket): StepId[] {
  const middle: StepId[] = Math.random() < 0.5 ? ["points", "bag"] : ["bag", "points"];
  const first: StepId[] = basket.heat ? ["heat"] : [];
  return [...first, ...middle, "pay", "receipt"];
}

// 🧩 블록 하나 (한국어 + 발음). 띄어쓰기는 1개라서 형광펜이 낱말마다 맞는다.
export type Block = { ko: string; roman: string };

// 질문 하나: 점원 말 + 버튼 대답 2개 + 블록 정답 + 별 판정에 쓰는 핵심 낱말 + 되받는 말 + 팁
export type AskId = "heat" | "points" | "bag" | "receipt";
export type Ask = {
  staff: Line;
  replies: [Line, Line];
  blocks: Block[];
  correct: string[];
  key: string;
  echo: Line;
  tip: Tr;
};

export const ASKS: Record<AskId, Ask> = {
  heat: {
    staff: HEAT_ASK,
    replies: [HEAT_YES, NO_THANKS],
    blocks: [
      { ko: "주세요.", roman: "juseyo." },
      { ko: "봉투", roman: "bongtu" },
      { ko: "네,", roman: "ne," },
      { ko: "하나", roman: "hana" },
      { ko: "데워", roman: "dewo" },
    ],
    correct: ["네,", "데워", "주세요."],
    key: "데워",
    echo: HEAT_ECHO,
    tip: HEAT_TIP,
  },
  points: {
    staff: POINTS_ASK,
    replies: [NO_THANKS, POINTS_YES],
    blocks: [
      { ko: "괜찮아요.", roman: "gwaenchanayo." },
      { ko: "주세요.", roman: "juseyo." },
      { ko: "아니요,", roman: "aniyo," },
    ],
    correct: ["아니요,", "괜찮아요."],
    key: "괜찮아요",
    echo: POINTS_ECHO,
    tip: POINTS_TIP,
  },
  bag: {
    staff: BAG_ASK,
    replies: [BAG_YES, NO_THANKS],
    blocks: [
      { ko: "하나", roman: "hana" },
      { ko: "데워", roman: "dewo" },
      { ko: "주세요.", roman: "juseyo." },
      { ko: "봉투", roman: "bongtu" },
    ],
    correct: ["봉투", "하나", "주세요."],
    key: "봉투",
    echo: BAG_ECHO,
    tip: BAG_TIP,
  },
  receipt: {
    staff: RECEIPT_ASK,
    replies: [RECEIPT_DISCARD, RECEIPT_YES],
    blocks: [
      { ko: "버려", roman: "beoryeo" },
      { ko: "하나", roman: "hana" },
      { ko: "영수증은", roman: "yeongsujeungeun" },
      { ko: "주세요.", roman: "juseyo." },
    ],
    correct: ["영수증은", "버려", "주세요."],
    key: "버려",
    echo: RECEIPT_ECHO,
    tip: RECEIPT_TIP,
  },
};
