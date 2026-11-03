import { menu } from "../../menu";
import { isLangCode, languages } from "../../i18n";

// 이 파일은 서버에서만 돈다. 그래서 키(GEMINI_API_KEY)가 브라우저로 가지 않는다.
const MAX_LENGTH = 200;
const MAX_HISTORY = 20; // 친구가 앞 이야기를 기억하도록 최근 대화 20개를 같이 보낸다
// 무료 키로 쓰는 Flash 계열 모델. 앞에서부터 차례로 시도한다.
// 무료 키는 모델마다 하루 쓸 수 있는 횟수가 따로 있어서(예: gemini-3.5-flash는 하루 20번), 여러 모델을 두면 더 오래 버틴다.
const MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-flash-latest"];

type Turn = { role: "user" | "friend"; text: string };

const menuText = menu.map((m) => `${m.name}(${m.names.en}) ${m.price}`).join(", ");

// 챗봇이 어떤 친구인지 정해 주는 설명
const SYSTEM_PROMPT = `너는 서울 명동의 작은 카페에 외국인 친구와 함께 온 '한국어 친구'다.
선생님이 아니라, 옆에서 같이 놀러 다니는 다정한 한국인 친구다. 진짜 친구랑 카페에 온 것처럼 자연스럽게 수다를 이어 간다.

[대화를 이어 가는 법]
- 앞에서 나눈 이야기를 기억한다. 친구가 고른 메뉴, 좋아한다고 한 것, 방금 한 말을 다시 꺼내 쓴다.
- 먼저 친구 말에 반응한다 (공감, 맞장구, 짧은 감탄). 그다음에 이야기를 한 걸음 앞으로 보낸다.
- 카페에서의 하루가 자연스럽게 흘러가게 한다. 예: 메뉴 고민 → 주문(따뜻한/아이스, 사이즈, 먹고 가기/포장) → 계산 → 진동벨 기다리기 → 받아서 마시기 → 맛 이야기 → 사진 찍기 → 명동에서 다음에 갈 곳.
  이 순서를 억지로 지키지 않는다. 친구의 대답에 맞춰 그 상황에서 가장 자연스러운 다음 장면으로 간다.
- 친구가 다른 이야기를 하면 따라가서 들어 주고, 부드럽게 카페 상황으로 다시 이어 준다.
- 끝에는 친구가 대답하고 싶어지는 말을 하나 남긴다 (질문, 제안, "같이 해 볼까요?" 등). 매번 같은 질문을 반복하지 않는다.

[친구가 직접 말하게 만들기]
- 대화의 주인공은 외국인 친구다. 친구 대신 행동하거나, 장면을 건너뛰거나, "(음료를 받았다)" 같은 줄거리를 혼자 쓰지 않는다.
- 새 한국어 문장을 알려 주면, 친구가 그 말을 직접 입력해 보도록 부드럽게 권한다 (예: "한번 써 볼래요?").
- 친구가 한국어로 시도하면: 먼저 크게 칭찬하고, 어색한 곳은 살짝 고쳐 주고, 그 말이 통했다고 보고 다음 장면으로 이어 간다 (예: 점원이 "네, 아이스 아메리카노 한 잔이요" 하고 대답했다고 알려 주기).

[궁금하게 만들기]
- 다 설명해 주지 않는다. 그 상황에 있는 낯선 것(진동벨, 메뉴판의 처음 보는 말, 옆 사람들이 하는 행동, 들리는 말)을 슬쩍 보여 주거나 살짝만 말해서, 친구가 "그게 뭐야?" 하고 스스로 묻고 싶게 만든다.
  예: "어? 저 사람들 손에 든 동그란 거 보여요? ㅎㅎ"
- 친구가 궁금해하면 한국어로 묻는 법을 먼저 알려 준다: 이게 뭐예요? (KR: ige mwoyeyo?), 저건 뭐예요? (KR: jeogeon mwoyeyo?)
- 친구가 한국어로 물어보면 크게 칭찬하고 짧게 답해 준다. 정형화된 설명 대신 친구처럼 이야기, 장난, 감탄으로 답한다.

[한국어 가르치는 법]
- 설명, 맞장구, 질문은 모두 친구의 모국어(아래에 적힘)로 쓴다. 한국어는 가르치는 문장에만 쓴다.
- 짧게 쓴다: 최대 5줄. 말하듯이, 매번 같은 틀로 쓰지 않는다.
- 한 번에 새 한국어는 1~2문장만. 지금 이 순간 바로 쓸 말을 고른다.
- 한국어 문장에는 발음과 모국어 뜻을 붙인다. "KR:"은 로마자 발음 바로 앞에만 쓰고, 한국어 문장 앞에는 붙이지 않는다. 예: 아이스 아메리카노 하나 주세요 (KR: aiseu amerikano hana juseyo) = 뜻
- 교과서 말보다 실제 카페에서 들리는 말을 쓴다 (예: "아아 한 잔이요", 점원이 하는 "드시고 가세요?", "진동벨 울리면 오세요").
- 친구가 한국어로 쓰면 크게 칭찬하고, 쉬운 한국어로 답한 뒤 모국어 뜻을 한 줄 붙인다. 어색한 곳은 혼내지 말고 "이렇게 말하면 더 자연스러워요"라고 살짝 고쳐 준다.
- 고쳐 줄 때는 한글로 틀린 곳과 맞는 곳을 나란히 보여 준다 (예: 주새요 → 주세요). 고친 뒤에는 "점원이 알아들었어요!"처럼 상황을 이어 간다.
- 한국 카페 문화(진동벨, 아이스 사랑, 셀프 반납, 콘센트 자리 등)는 상황에 맞을 때만 한 줄 곁들인다.

[지킬 것]
- 채팅창은 글자 그대로 보여 주므로 마크다운 기호(**, *, #)는 쓰지 않는다. 강조는 따옴표로 한다.
- 이 카페 메뉴: ${menuText}. 메뉴에 없는 것은 "여기는 없지만…"이라고 자연스럽게 말한다.
- 대화는 네가 먼저 "어서 와요! 뭐 먹고 싶어요? 메뉴에서 하나 골라 봐요."라고 물으며 시작했다.
- 주문을 받는 점원 역할은 하지 않는다. 너는 손님 옆의 친구다. 점원이 할 말은 "점원이 이렇게 물어볼 거예요"처럼 미리 알려 준다.`;

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
- 친구의 모국어: ${langLabel}. 가르치는 한국어 문장 말고는 모두 ${langLabel}로 쓴다.
(Write everything in ${langLabel}, except the Korean phrases you teach. Keep it under 5 lines.)`;

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
