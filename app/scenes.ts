import type { LangCode } from "./i18n";
import { menu } from "./menu";
import { words } from "./words";

// 장면 카드. 친구(챗봇)의 성격은 그대로 두고, 장면마다 이 카드만 바꿔 준다.
// 새 장면(예: 화장품 가게)을 만들려면 아래 scenes에 카드를 하나 더 쓰면 된다.
// 친구에게 보여 주는 설명(place, flow 등)은 영어로 쓴다. 가벼운 모델이 영어 설명을 더 잘 따른다.
export type Scene = {
  id: string;
  name: string; // 장면의 한국어 이름
  place: string; // 지금 어디에 있는지
  greeting: { ko: string; roman: string; meanings: Record<LangCode, string> }; // 친구의 첫 말
  items: { name: string; emoji?: string; hot?: boolean; price?: string; names: { en: string } & Partial<Record<LangCode, string>> }[]; // 고를 수 있는 것
  words: { ko: string; roman: string; en: string }[]; // 이 장소의 물건 이름
  flow: string; // 보통 흘러가는 순서 (억지로 지키지 않는다)
  onScreen: string; // 이 화면에서 실제로 하는 방법 (친구가 "어디를 보면 되는지" 알려 줄 수 있게)
  curiosity: string[]; // 친구가 "이게 뭐예요?" 하고 궁금해할 만한 것
  realPhrases: string[]; // 이곳에서 실제로 들리는 한국어
  culture: string[]; // 때가 맞으면 곁들일 한국 문화
  staff: string; // 이곳의 직원 (친구는 직원 역할을 하지 않는다)
  translationNotes: string[]; // 번역할 때 조심할 것
};

const cafe: Scene = {
  id: "cafe",
  name: "카페",
  place: "a small cafe in Myeongdong, Seoul",
  greeting: {
    // 처음 온 사람이 어떻게 주문하는지 알게: 친구가 돕겠다고 하고, 아래 메뉴 버튼을 눌러도 되고 글로 써도 된다고 알려 준다
    ko: "어서 와요! 뭐 먹고 싶어요? 내가 도와줄게요. 아래 메뉴 버튼을 눌러도 되고, 원하면 글로 써도 돼요. ☕",
    roman: "eoseo wayo! mwo meokgo sipeoyo? naega dowajulgeyo. arae menyu beoteuneul nulleodo doego, wonhamyeon geullo sseodo dwaeyo.",
    meanings: {
      en: "Welcome! What would you like to have? I'll help you. You can tap the menu buttons below, or type if you like.",
      de: "Willkommen! Was möchtest du haben? Ich helfe dir. Du kannst unten auf die Menü-Knöpfe tippen oder, wenn du willst, schreiben.",
      ja: "いらっしゃい！何が食べたい？手伝うね。下のメニューボタンを押してもいいし、書いてもいいよ。",
      zh: "欢迎！你想吃点什么？我来帮你。可以点下面的菜单按钮，也可以直接打字。",
      es: "¡Bienvenido! ¿Qué te apetece? Te ayudo. Puedes tocar los botones del menú de abajo o escribir si quieres.",
      vi: "Chào bạn! Bạn muốn ăn uống gì? Mình sẽ giúp bạn. Bạn có thể bấm nút menu bên dưới, hoặc viết cũng được.",
    },
  },
  items: menu,
  words: Object.values(words).map((w) => ({ ko: w.ko, roman: w.roman, en: w.names.en })),
  flow: "choosing a drink, bread or juice -> ordering (hot/iced, size, for here/to go) -> paying -> waiting for the buzzer -> getting the drink -> talking about the taste -> taking photos -> where to go next in Myeongdong",
  onScreen:
    "IMPORTANT: the screen itself handles ordering, paying and the buzzer. When they choose a menu item (a message like 크루아상으로 할게요), reply in 2-3 short sentences: react to their choice, then tell them to look at the 🧾 order slip (주문서) on the right of the cafe picture, where the staff will ask 더 주문하실 거 있으세요? and then how they will pay (counter or kiosk). Do NOT act out the staff's questions yourself (for here / to go, payment) and do not ask them to type those answers. After paying they get a buzzer (📳), sit at the round table in 🌀 Look around (360°), pick up the tray when it rings, and eat. If they want more, there is a 📱 table pad on their table to order more.",
  curiosity: ["the vibrating buzzer (진동벨)", "unfamiliar words on the menu board", "people taking photos of their drinks", "the self tray-return shelf"],
  realPhrases: ["아아 한 잔이요", "드시고 가세요? (staff)", "진동벨 울리면 오세요 (staff)", "먹고 갈게요", "포장해 주세요"],
  culture: ["buzzers in almost every cafe", "Koreans love iced americano even in winter (얼죽아)", "returning your own tray", "seats with power outlets", "cafe stamp cards (collect 10 stamps, get a free drink)"],
  staff: "a barista behind the counter who greets with 어서 오세요",
  translationNotes: ['iced americano in German is "Eis-Americano", not "Eiskaffee"'],
};

export const scenes = { cafe } satisfies Record<string, Scene>;

export type SceneId = keyof typeof scenes;

export function isSceneId(value: unknown): value is SceneId {
  return typeof value === "string" && value in scenes;
}

// 친구에게 줄 "지금 장면" 설명을 만든다 (서버에서 쓴다)
export function scenePrompt(scene: Scene, lang: LangCode, langLabel: string) {
  const items = scene.items
    .map((i) => `${i.name} = ${i.names[lang] ?? i.names.en}${i.price ? ` (${i.price})` : ""}`)
    .join(", ");
  return `[Current scene: ${scene.place}]
- You started this scene by saying: "${scene.greeting.ko}"
- Things they can choose here (meanings in ${langLabel}): ${items}. For anything else, say naturally that this place does not have it.
- Objects in this place: ${scene.words.map((w) => `${w.ko} (${w.en})`).join(", ")}
- How a visit here usually flows (do not force it): ${scene.flow}
- How it works on this screen: ${scene.onScreen}
- Things that can make them curious: ${scene.curiosity.join("; ")}
- Real Korean heard here: ${scene.realPhrases.join("; ")}
- Local culture to mention only when it fits: ${scene.culture.join("; ")}
- Staff here: ${scene.staff}. You are not the staff. Tell them in advance what the staff will say.
- Translation notes: ${scene.translationNotes.join("; ") || "none"}`;
}
