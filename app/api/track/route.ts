import { EVENTS } from "../../tracking";

// 📊 카페 기록 받기: 정해진 이름의 기록만 받아서 Supabase 표(cafe_events)에 넣는다.
// 나라는 Vercel이 알려 주는 두 글자(예: US)만 붙인다. IP 주소는 저장하지 않는다.
// 공개용 키로는 "남기기"만 된다 (표의 RLS 규칙). 읽기는 아무도 못 한다.
const ID = /^[A-Za-z0-9-]{8,64}$/;

export async function POST(request: Request) {
  const done = new Response(null, { status: 204 });
  let body: { name?: unknown; data?: unknown; visitor?: unknown; session?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const { name, visitor, session } = body;
  const data = body.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : {};
  if (typeof name !== "string" || !(name in EVENTS)) return new Response(null, { status: 400 });
  if (typeof visitor !== "string" || !ID.test(visitor) || typeof session !== "string" || !ID.test(session)) {
    return new Response(null, { status: 400 });
  }
  if (JSON.stringify(data).length > 1000) return new Response(null, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return done; // Supabase 키가 없는 내 컴퓨터 연습용: 받기만 하고 저장하지 않는다

  const country = request.headers.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() || null;
  try {
    const res = await fetch(`${url}/rest/v1/cafe_events`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ name, data, visitor, session, country }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("기록 저장 실패:", res.status, await res.text());
  } catch (e) {
    console.error("기록 저장 실패:", e);
  }
  return done;
}
