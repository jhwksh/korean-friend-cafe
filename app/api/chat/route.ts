import { menu } from "../../menu";
import { isLangCode, languages } from "../../i18n";

// 이 파일은 서버에서만 돈다. 그래서 키(GEMINI_API_KEY)가 브라우저로 가지 않는다.
const MAX_LENGTH = 200;
const MAX_HISTORY = 10;
// 무료 키로 쓰는 Flash 계열 모델. 앞에서부터 차례로 시도한다 (답이 정확한 flash 먼저, 붐비면 lite)
const MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];

type Turn = { role: "user" | "friend"; text: string };

const menuText = menu.map((m) => `${m.name}(${m.names.en}) ${m.price}`).join(", ");

// 챗봇이 어떤 친구인지 정해 주는 설명
const SYSTEM_PROMPT = `너는 서울 명동의 작은 카페에 외국인 친구와 함께 온 '한국어 친구'다.
선생님이 아니라 옆에서 같이 다니는 다정한 한국인 친구처럼 말한다.
- 친구의 모국어(아래에 적힘)로 설명하고, 그 자리에서 바로 쓸 한국어 문장을 가르친다. 짧게(3~5줄) 답한다.
- 한국어 문장에는 발음(로마자)과 모국어 뜻을 꼭 붙인다. 발음 앞에는 반드시 "KR:"을 쓴다. 예: 아이스 아메리카노 하나 주세요 (KR: aiseu amerikano hana juseyo) = 뜻
- 채팅창은 글자 그대로 보여 주므로 마크다운 기호(**, *, #)는 쓰지 않는다. 강조는 따옴표로 한다.
- 친구가 한국어로 쓰면 칭찬하고 쉬운 한국어로 답한 뒤, 모국어 뜻을 한 줄 붙인다.
- 한국어가 어색하면 혼내지 말고 자연스러운 표현을 살짝 알려 준다.
- 카페에서 실제로 쓰는 말과 한국 카페 문화(예: 진동벨, 아이스/핫, 사이즈, 포장/매장)를 곁들인다.
- 이 카페 메뉴: ${menuText}
- 대화는 네가 먼저 "어서 와요! 뭐 먹고 싶어요? 메뉴에서 하나 골라 봐요."라고 물으며 시작했다.
- 친구가 메뉴를 고르면: 그 메뉴를 주문하는 한국어 문장을 알려 주고, 이어서 다음에 정할 것을 하나만 물어 대화를 이끈다 (예: 따뜻한 거/아이스, 사이즈, 먹고 가기/포장).
- 답 끝에는 늘 친구가 대답할 수 있는 짧은 질문을 하나 남긴다.
- 주문을 받는 점원 역할은 하지 않는다. 너는 손님 옆의 친구다.`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // 키가 없다는 사실만 서버 로그에 남기고, 화면에는 일반 안내만 보낸다
    console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
    return Response.json({ error: "친구가 지금 대답할 수 없어요. / Your friend can't reply right now." }, { status: 500 });
  }

  let body: { message?: unknown; history?: unknown; lang?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청이에요. / Bad request." }, { status: 400 });
  }

  // 화면에서 막아도 서버에서 한 번 더 막는다 (빈 입력, 200자 초과)
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return Response.json({ error: "메시지를 입력해 주세요. / Please type a message." }, { status: 400 });
  }
  if (message.length > MAX_LENGTH) {
    return Response.json({ error: `${MAX_LENGTH}자 이하로 써 주세요. / Max ${MAX_LENGTH} characters.` }, { status: 400 });
  }

  const history: Turn[] = Array.isArray(body.history)
    ? body.history
        .filter((t): t is Turn => (t?.role === "user" || t?.role === "friend") && typeof t?.text === "string")
        .slice(-MAX_HISTORY)
        .map((t) => ({ role: t.role, text: t.text.slice(0, 1000) }))
    : [];

  // 배우는 사람이 고른 언어. 목록에 없는 값이 오면 영어로 한다
  const langLabel = languages.find((l) => l.code === (isLangCode(body.lang) ? body.lang : "en"))!.label;
  const systemText = `${SYSTEM_PROMPT}
- 친구의 모국어: ${langLabel}. 설명은 반드시 이 언어로 한다.`;

  const contents = [...history, { role: "user", text: message }].map((t) => ({
    role: t.role === "friend" ? "model" : "user",
    parts: [{ text: t.text }],
  }));

  try {
    // 모델이 붐비거나(503) 너무 오래 걸리면(25초) 다음 Flash 모델로 넘어간다
    let res: Response | undefined;
    for (const model of MODELS) {
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: systemText }] }, contents }),
          signal: AbortSignal.timeout(25000),
        });
      } catch (err) {
        if (err instanceof Error && err.name === "TimeoutError") {
          console.error(`Gemini ${model} 시간 초과, 다음 모델로 시도`);
          continue;
        }
        throw err;
      }
      if (res.ok || ![404, 429, 503].includes(res.status)) break;
      console.error(`Gemini ${model} 응답 ${res.status}, 다음 모델로 시도`);
    }

    if (!res || !res.ok) {
      // 자세한 이유는 서버 로그에만 남긴다 (키나 내부 정보는 화면에 보내지 않는다)
      console.error("Gemini 요청 실패:", res?.status);
      const busy = res?.status === 429 || res?.status === 503;
      return Response.json(
        {
          error: busy
            ? "지금 대화가 많아요. 잠시 후 다시 해 주세요. / Too many requests. Please try again soon."
            : "친구가 지금 대답할 수 없어요. / Your friend can't reply right now.",
        },
        { status: busy ? 429 : 502 },
      );
    }

    const data = await res.json();
    const reply: string =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim() ?? "";

    if (!reply) {
      return Response.json({ error: "친구가 대답을 못 찾았어요. 다르게 말해 볼래요? / Please try saying it differently." }, { status: 502 });
    }
    return Response.json({ reply });
  } catch (err) {
    console.error("Gemini 연결 실패:", err instanceof Error ? err.name : "unknown");
    return Response.json(
      { error: "연결이 불안정해요. 잠시 후 다시 해 주세요. / Connection problem. Please try again." },
      { status: 504 },
    );
  }
}
