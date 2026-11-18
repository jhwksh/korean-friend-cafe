import { menu } from "./menu";

// 🗣️ 카운터에서 점원에게 말한 주문을 대본으로 판정한다 (AI 없이, 무료).
// 별 기준 (사용자와 정함):
//   ⭐⭐⭐ 완성 문장      "아메리카노 한 잔 주세요"
//   ⭐⭐   핵심 단어 + 요청 "아메리카노 주세요"
//   ⭐     단어만         "아메리카노"  → 점원이 "아~ 아메리카노요?" 하고 되받는다
//   0     메뉴가 없음     → 점원이 "네? 다시 한번 말씀해 주시겠어요?"
// 점원은 뜻만 통하면 주문을 받고, 별(평가)은 한국어 친구가 준다.
// 🧩 단어 블록(레벨 2)도, 나중의 🎤 말하기(레벨 3)도 이 함수 하나로 판정한다.

export type MenuEntry = (typeof menu)[number];
export const DRINKS = menu.filter((m) => m.kind !== "bakery");

export type Judged = { stars: 0 | 1 | 2 | 3; item?: MenuEntry; ice: boolean };

// 띄어쓰기·문장부호는 빼고 본다. "라떼"처럼 흔히 쓰는 다른 맞춤법도 메뉴 이름에 맞춘다
function squash(text: string) {
  return text.replace(/[\s.,!?~。？！]/g, "").replace(/라떼/g, "라테").replace(/쥬스/g, "주스");
}

export function judgeOrder(text: string): Judged {
  const s = squash(text);
  const ice = s.includes("아이스");
  // 긴 이름부터 찾는다 (녹차라테 안에 있는 "라테"를 카페라테로 잘못 보지 않게)
  const item = [...DRINKS].sort((a, b) => b.name.length - a.name.length).find((m) => s.includes(m.name));
  if (!item) return { stars: 0, ice };
  const count = /한잔|하나|한개/.test(s);
  const ask = /주세요|주시겠어요|줘요|부탁/.test(s);
  return { stars: count && ask ? 3 : ask ? 2 : 1, item, ice };
}
