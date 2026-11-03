import type { LangCode } from "./i18n";

// 스탬프 카드 상품. 도장 수(goal)에 닿으면 쿠폰을 받는다 (게임 속 쿠폰이라 실제로 쓸 수는 없다).
// 한국 카페 스탬프 카드처럼 10개를 모으면 음료 한 잔이 무료다.
export const rewards: { goal: number; emoji: string; ko: string; names: Record<LangCode, string> }[] = [
  {
    goal: 5,
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
