// 📊 카페 성과 보드: 카페에서 일어난 일을 이름 없이 센다 (Supabase 표 cafe_events, supabase/schema.sql 맨 아래).
// 이름·이메일·IP는 남기지 않는다. 방문자 번호는 이 브라우저가 만든 무작위 번호다.
// 기록을 못 보내도(인터넷이 끊김 등) 카페는 아무 일 없이 그대로 돌아간다.

// 🔧 무엇을 셀지 스위치: true면 세고 false면 안 센다 (지우는 게 아니라서 다시 켤 수 있다)
export const TRACK = {
  visit: true, // 🚪 로그인 화면까지 온 사람(entrance), 카페에 들어온 사람(visit), 다시 온 사람
  stay: true, // ⏱️ 머문 시간
  funnel: true, // 🧾 주문 단계: 메뉴 담기 → 계산 방법 고르기 → 결제 완료 → 쟁반 받기 → 위층 → 앉기
  route: true, // 👆🧩📱 주문 방법(버튼·블록·키오스크)과 받은 별
  promise: true, // 🤙 "다음엔 진짜 한국에서" 약속 카드 대답
  lang: true, // 🌐 고른 언어
  surprise: true, // 🧑‍🍳 점원의 깜짝 질문에 무엇이라고 대답했나
  game: true, // 🖼️ 친구랑 숨은 그림 찾기 (몇 번 틀렸나, 끝까지 했나)
};

// 기록 이름 → 어느 스위치에 속하는지. 서버도 이 목록에 있는 이름만 받는다 (엉뚱한 기록이 쌓이지 않게)
export const EVENTS = {
  entrance: "visit",
  visit: "visit",
  stay: "stay",
  cart: "funnel",
  pay_start: "funnel",
  paid: "funnel",
  leave_ask: "funnel",
  pickup: "funnel",
  upstairs: "funnel",
  sit: "funnel",
  talk_way: "route",
  stars: "route",
  promise: "promise",
  lang: "lang",
  surprise: "surprise",
  hidden_picture: "game",
} as const satisfies Record<string, keyof typeof TRACK>;
export type EventName = keyof typeof EVENTS;

const VISITOR_KEY = "kfc-visitor";
const SESSION_KEY = "kfc-session";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

let ids: { visitor: string; session: string; returning: boolean } | null = null;
// 이름 없는 번호 두 개: 방문자 번호(이 브라우저에 계속 남음), 이번 방문 번호(창을 닫으면 사라짐)
export function trackIds() {
  if (ids) return ids;
  let visitor: string | null = null;
  let session: string | null = null;
  try {
    visitor = localStorage.getItem(VISITOR_KEY);
    session = sessionStorage.getItem(SESSION_KEY);
  } catch {}
  const returning = !!visitor; // 번호가 이미 있으면 전에 와 본 사람
  visitor ??= newId();
  session ??= newId();
  try {
    localStorage.setItem(VISITOR_KEY, visitor);
    sessionStorage.setItem(SESSION_KEY, session);
  } catch {}
  ids = { visitor, session, returning };
  return ids;
}

// 이번 방문에서 한 번만 세는 기록 (예: 방문, 로그인 화면)
const sentOnce = new Set<string>();
export function trackOnce(name: EventName, data?: Record<string, unknown>) {
  if (sentOnce.has(name)) return;
  sentOnce.add(name);
  track(name, data);
}

// 기록 하나를 조용히 보낸다. beacon: 창을 닫는 순간에도 보내지게 (머문 시간)
export function track(name: EventName, data: Record<string, unknown> = {}, beacon = false) {
  if (typeof window === "undefined" || !TRACK[EVENTS[name]]) return;
  try {
    const { visitor, session } = trackIds();
    const body = JSON.stringify({ name, data, visitor, session });
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {}
}
