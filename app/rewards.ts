import type { LangCode } from "./i18n";

// 스탬프 카드 상품. 도장 수(goal)에 닿으면 쿠폰을 받는다 (게임 속 쿠폰이라 실제로 쓸 수는 없다).
// 한국 카페 스탬프 카드처럼 10개를 모으면 음료 한 잔이 무료다.
// 도장 5개마다 쿠폰이 하나 생긴다: 5, 15, 25…번째는 사이즈 업, 10, 20, 30…번째는 아이스 아메리카노 (FoundProvider의 coupons)
// 쿠폰은 계산할 때 "쿠폰 쓸게요"로 진짜 쓴다 (OrderProvider의 applyCoupon).
export type RewardKind = "sizeup" | "americano";
export const rewards: { goal: number; kind: RewardKind; emoji: string; ko: string; names: Record<LangCode, string> }[] = [
  {
    goal: 5,
    kind: "sizeup",
    emoji: "🥤⬆️",
    ko: "음료 사이즈 업 무료",
    names: {
      en: "Free size upgrade",
      de: "Gratis Größen-Upgrade",
      ja: "サイズアップ無料",
      zh: "免费升杯",
      es: "Tamaño más grande gratis",
      vi: "Nâng size miễn phí",
    },
  },
  {
    goal: 10,
    kind: "americano",
    emoji: "🧊☕",
    ko: "아이스 아메리카노 1잔 무료",
    names: {
      en: "One free iced americano",
      de: "Ein Eis-Americano gratis",
      ja: "アイスアメリカーノ1杯無料",
      zh: "免费冰美式一杯",
      es: "Un americano con hielo gratis",
      vi: "Miễn phí 1 ly americano đá",
    },
  },
];
