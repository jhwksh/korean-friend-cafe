import type { LangCode } from "./i18n";
import type { WordKey } from "./words";

// 스탬프 미션 10개. 한 번에 하나씩 열린다 (지금 미션을 하면 다음 미션이 열린다).
// 미션 자리를 찾아서, 그 자리에서 쓸 한국어 문장을 직접 써야 도장을 받는다 (찾기만 하면 공부가 안 되니까).
// 미션을 하나씩 주면 무엇을 할지 알기 쉬워서, 친구(AI)에게 덜 물어보게 된다 (무료 사용량 절약).
// 자리는 page.tsx, Barista.tsx, MenuBoard.tsx, CounterFood.tsx, CafeView.tsx에서 <MissionButton id="…" />로 놓는다.
export type Mission = {
  id: string;
  emoji: string; // 어디인지 알려 주는 그림
  place: WordKey; // 어디로 가야 하는지 (지금 미션 안내에 쓴다)
  in360?: boolean; // 🌀 둘러보기(360) 안에 있는 미션
  ko: string; // 말해야 할 한국어 문장
  roman: string; // KR 발음
  names: Record<LangCode, string>; // 뜻
};

export const missions: Mission[] = [
  {
    id: "hello",
    place: "staff",
    emoji: "🧑‍🍳",
    ko: "안녕하세요!",
    roman: "annyeonghaseyo!",
    names: { en: "Hello!", de: "Hallo!", ja: "こんにちは！", zh: "你好！", es: "¡Hola!", vi: "Xin chào!" },
  },
  {
    id: "order",
    place: "menuBoard",
    emoji: "📋",
    ko: "아이스 아메리카노 하나 주세요",
    roman: "aiseu amerikano hana juseyo",
    names: {
      en: "One iced americano, please.",
      de: "Einen Eis-Americano, bitte.",
      ja: "アイスアメリカーノを一つください。",
      zh: "请给我一杯冰美式。",
      es: "Un americano con hielo, por favor.",
      vi: "Cho tôi một ly americano đá.",
    },
  },
  {
    id: "what",
    place: "showcase",
    emoji: "🍰",
    ko: "이거 뭐예요?",
    roman: "igeo mwoyeyo?",
    names: { en: "What is this?", de: "Was ist das?", ja: "これは何ですか？", zh: "这是什么？", es: "¿Qué es esto?", vi: "Cái này là gì?" },
  },
  {
    id: "card",
    place: "counter",
    emoji: "💳",
    ko: "카드로 할게요",
    roman: "kadeuro halgeyo",
    names: {
      en: "I'll pay by card.",
      de: "Ich zahle mit Karte.",
      ja: "カードで払います。",
      zh: "我用卡支付。",
      es: "Pago con tarjeta.",
      vi: "Tôi trả bằng thẻ.",
    },
  },
  {
    id: "sea",
    place: "window",
    emoji: "🪟",
    ko: "바다가 정말 예뻐요",
    roman: "badaga jeongmal yeppeoyo",
    names: {
      en: "The sea is really beautiful.",
      de: "Das Meer ist wirklich schön.",
      ja: "海が本当にきれいです。",
      zh: "大海真漂亮。",
      es: "El mar es precioso.",
      vi: "Biển đẹp quá.",
    },
  },
  {
    id: "trash",
    place: "trash",
    emoji: "🗑️",
    ko: "여기에 버리면 돼요?",
    roman: "yeogie beorimyeon dwaeyo?",
    names: {
      en: "Can I throw it away here?",
      de: "Kann ich das hier wegwerfen?",
      ja: "ここに捨ててもいいですか？",
      zh: "可以扔在这里吗？",
      es: "¿Puedo tirarlo aquí?",
      vi: "Tôi bỏ vào đây được không?",
    },
  },
  {
    id: "sit",
    place: "sofa",
    in360: true,
    emoji: "🛋️",
    ko: "여기 앉아도 돼요?",
    roman: "yeogi anjado dwaeyo?",
    names: {
      en: "May I sit here?",
      de: "Darf ich mich hier hinsetzen?",
      ja: "ここに座ってもいいですか？",
      zh: "我可以坐这里吗？",
      es: "¿Me puedo sentar aquí?",
      vi: "Tôi ngồi đây được không?",
    },
  },
  {
    id: "picture",
    place: "frame",
    in360: true,
    emoji: "🖼️",
    ko: "새가 있어요",
    roman: "saega isseoyo",
    names: {
      en: "There is a bird.",
      de: "Da ist ein Vogel.",
      ja: "鳥がいます。",
      zh: "有一只鸟。",
      es: "Hay un pájaro.",
      vi: "Có một con chim.",
    },
  },
  {
    id: "restroom",
    place: "stairs",
    in360: true,
    emoji: "🚻",
    ko: "화장실이 어디예요?",
    roman: "hwajangsiri eodiyeyo?",
    names: {
      en: "Where is the restroom?",
      de: "Wo ist die Toilette?",
      ja: "トイレはどこですか？",
      zh: "洗手间在哪里？",
      es: "¿Dónde está el baño?",
      vi: "Nhà vệ sinh ở đâu?",
    },
  },
  {
    id: "bye",
    place: "door",
    in360: true,
    emoji: "🚪",
    ko: "안녕히 계세요!",
    roman: "annyeonghi gyeseyo!",
    names: { en: "Goodbye!", de: "Auf Wiedersehen!", ja: "さようなら！", zh: "再见！", es: "¡Adiós!", vi: "Tạm biệt!" },
  },
];

export type MissionId = (typeof missions)[number]["id"];
