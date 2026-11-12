import { isLangCode, languages } from "../../i18n";
import { isSceneId, scenePrompt, scenes } from "../../scenes";

// 이 파일은 서버에서만 돈다. 그래서 키(GEMINI_API_KEY)가 브라우저로 가지 않는다.
const MAX_LENGTH = 200;
const MAX_HISTORY = 6; // 친구가 앞 이야기를 기억하도록 최근 대화 6개만 같이 보낸다 (많이 보낼수록 토큰을 많이 쓴다)
// 답 길이 상한 (생각하는 데 쓰는 토큰도 여기에 포함된다). 보통 답은 200토큰 안팎이라 넉넉하게 둔다
const MAX_OUTPUT_TOKENS = 2048;
// 무료 키로 쓰는 Flash 계열 모델. 앞에서부터 차례로 시도한다.
// 무료 키는 모델마다 하루 쓸 수 있는 횟수가 따로 있어서(예: gemini-3.5-flash는 하루 20번), 여러 모델을 두면 더 오래 버틴다.
const MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-flash-latest"];

type Turn = { role: "user" | "friend"; text: string };

// 친구(챗봇)의 성격. 어느 장면에서나 똑같다. 장면마다 다른 내용은 app/scenes.ts의 장면 카드에서 온다.
// 영어로 쓴다: 가벼운 모델은 한국어 설명을 받으면 고른 언어 대신 한국어로 답해 버리는 일이 많았다.
// (한국어 요약) 명동을 같이 다니는 다정한 한국인 친구. 상황 따라 대화를 이어 가고, 친구가 직접 말하고
// "이게 뭐예요?"라고 묻게 이끌고, 질문엔 먼저 답하고, 설명은 고른 언어로 짧게, 한국어는 가르치는 문장에만.
const FRIEND_PERSONA = `You are the learner's "Korean friend". You are travelling around Myeongdong, Seoul with them, a foreign visitor. Where you are right now is described in the scene card below.
You are not a teacher. You are a warm Korean friend hanging out with them. Chat naturally, like real friends.

[Keep the conversation going]
- Remember what was said: what they chose, what they like, what they just said.
- First react to what they said (empathy, a short "wow!"), then move the story one small step forward.
- Let the visit flow naturally, roughly like the flow in the scene card. Do not force it. Go to the most natural next moment for what they said.
- If they change the topic, follow them and listen, then gently bring it back to the scene.
- End with one thing they will want to answer (a question, a suggestion, "shall we try?"). Do not repeat the same question every time.

[Listen well]
- If they ask a question (a recommendation, a meaning, how to do something), answer it directly and concretely first. Teaching comes after.
- If their reply is short or unclear ("うん", "ok"), do not guess. Ask briefly what they mean. Remember what they already chose and do not change it.
- We only chat in text. You cannot hear them, so never praise their pronunciation. Praise their Korean only when they actually wrote Korean.

[Get them to speak]
- The learner is the main character. Never act for them, skip scenes, or narrate things like "(we got our drinks)".
- After teaching a Korean phrase, invite them to type it themselves ("Want to try typing it?").
- When they try in Korean: praise them warmly, gently fix mistakes by showing wrong -> right in Hangul (e.g. 주새요 -> 주세요), then assume it worked and continue the scene (e.g. tell them what the staff replied).

[Make them curious]
- Do not explain everything. Hint at something new in the scene (see the scene card) so they want to ask "what is that?". Use your own words each time.
- When they are curious, first teach how to ask in Korean: 이게 뭐예요? (KR: ige mwoyeyo?) / 저건 뭐예요? (KR: jeogeon mwoyeyo?)
- When they ask in Korean, praise them and answer briefly, like a friend: a little story, a joke, a reaction. No textbook explanations.

[How to teach Korean]
- Teach at most 1-2 new Korean phrases at a time, the ones they can use right now.
- Format every Korean phrase as: Korean (KR: romanization) = meaning in the learner's language. Put "KR:" only right before the romanization.
- Use the Revised Romanization of Korean and check it matches the Hangul letter by letter (저게 = jeoge, 저건 = jeogeon).
- Translate meanings into words people really use in that language.
- Prefer the real Korean heard in this place (see the scene card) over textbook Korean.
- Mention Korean culture only when it fits the moment, in one line.

[Rules]
- The chat shows plain text, so never use markdown symbols (**, *, #). Use quotes for emphasis.`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // 키가 없다는 사실만 서버 로그에 남기고, 화면에는 일반 안내만 보낸다
    console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
    return Response.json({ error: "친구가 지금 대답할 수 없어요. / Your friend can't reply right now." }, { status: 500 });
  }

  // 🔐 하루 사용 제한: 구글 로그인한 사람만, 한 사람당 하루 정해진 횟수까지 (횟수는 supabase/schema.sql의 use_chat_turn에서 정한다)
  const limit = await countChatTurn(request);
  if (limit !== "ok") return limit;

  let body: { message?: unknown; history?: unknown; lang?: unknown; scene?: unknown };
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
  const lang = isLangCode(body.lang) ? body.lang : "en";
  const langLabel = languages.find((l) => l.code === lang)!.label;
  // 지금 장면. 목록에 없는 값이 오면 카페로 한다
  const scene = scenes[isSceneId(body.scene) ? body.scene : "cafe"];
  // 언어 규칙은 가장 중요해서 맨 앞과 맨 뒤에 영어로 한 번 더 쓴다 (한국어 설명에 끌려가 한국어로 답하는 것을 막는다)
  const languageRule = `LANGUAGE RULE (most important): The learner speaks ${langLabel}. Write every explanation, reaction and question in ${langLabel}. Use Korean ONLY for the short Korean phrases you teach, each followed by (KR: romanization) = meaning in ${langLabel}. Never write your explanations in Korean.`;
  const systemText = `${languageRule}

${FRIEND_PERSONA}

${scenePrompt(scene, lang, langLabel)}

${languageRule} Keep it under 5 lines.`;

  // 가벼운 모델은 친구가 쓴 말(예: 한국어)을 따라 답하려고 해서, 마지막 말 끝에 답할 언어를 살짝 붙여 보낸다 (화면에는 안 보인다)
  const reminder = `

(Reply in ${langLabel}. Korean only for the phrases you teach.)`;
  const contents = [...history, { role: "user", text: message + reminder }].map((t) => ({
    role: t.role === "friend" ? "model" : "user",
    parts: [{ text: t.text }],
  }));

  try {
    const first = await askGemini(apiKey, systemText, contents);
    if (!first.ok) return failure(first.status);
    let reply = first.reply;

    // 고른 언어로 설명하지 않고 한국어로만 길게 답했으면, 고른 언어로 다시 써 달라고 한 번 더 부탁한다
    if (hangulRatio(reply) > 0.6) {
      console.error("답이 거의 한국어라서 고른 언어로 다시 부탁함");
      const retry = await askGemini(apiKey, systemText, [
        ...contents,
        { role: "model", parts: [{ text: reply }] },
        { role: "user", parts: [{ text: `(Rewrite your last answer in ${langLabel}. Keep Korean only for the phrases you teach. Do not apologize or mention this request.)` }] },
      ]);
      if (retry.ok && hangulRatio(retry.reply) < hangulRatio(reply)) reply = retry.reply;
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

type Content = { role: string; parts: { text: string }[] };

// Gemini에게 묻는다. 모델이 붐비거나(503) 너무 오래 걸리면(12초) 다음 Flash 모델로 넘어간다
async function askGemini(
  apiKey: string,
  systemText: string,
  contents: Content[],
): Promise<{ ok: true; reply: string } | { ok: false; status?: number }> {
  let res: Response | undefined;
  for (const model of MODELS) {
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemText }] },
          contents,
          generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
        }),
        signal: AbortSignal.timeout(12000),
      });
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") {
        console.error(`Gemini ${model} 시간 초과, 다음 모델로 시도`);
        continue;
      }
      throw err;
    }
    if (res.ok) {
      const data = await res.json();
      const reply: string =
        data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim() ?? "";
      // 어느 모델이 답했는지만 서버 로그에 남긴다 (키는 남기지 않는다)
      console.log(`Gemini ${model} 답함`);
      return reply ? { ok: true, reply } : { ok: false, status: 502 };
    }
    if (![404, 429, 503].includes(res.status)) break;
    console.error(`Gemini ${model} 응답 ${res.status}, 다음 모델로 시도`);
  }
  // 자세한 이유는 서버 로그에만 남긴다 (키나 내부 정보는 화면에 보내지 않는다)
  console.error("Gemini 요청 실패:", res?.status);
  return { ok: false, status: res?.status };
}

function failure(status?: number) {
  const busy = status === 429 || status === 503;
  return Response.json(
    {
      error: busy
        ? "지금 대화가 많아요. 잠시 후 다시 해 주세요. / Too many requests. Please try again soon."
        : "친구가 지금 대답할 수 없어요. / Your friend can't reply right now.",
    },
    { status: busy ? 429 : 502 },
  );
}

// 글자 중 한글이 차지하는 비율 (0~1). 가르치는 한국어 문장이 섞여도 보통 0.5보다 작다
function hangulRatio(text: string) {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return 0;
  return letters.filter((c) => /\p{Script=Hangul}/u.test(c)).length / letters.length;
}

// 로그인한 사람의 오늘 사용 횟수를 Supabase에서 하나 올린다. 넘었으면 막는다.
// 브라우저가 보낸 로그인 표(access token)로 Supabase에 묻기 때문에, 다른 사람 횟수는 건드릴 수 없다.
async function countChatTurn(request: Request): Promise<"ok" | Response> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return "ok"; // Supabase 키가 없는 내 컴퓨터 연습용: 제한 없이 쓴다
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const needLogin = Response.json(
    { error: "구글로 로그인하면 친구와 이야기할 수 있어요. / Please log in with Google to chat." },
    { status: 401 },
  );
  if (!token) return needLogin;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/use_chat_turn`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401) return needLogin;
    if (!res.ok) {
      console.error("사용 횟수 확인 실패:", res.status);
      return failure();
    }
    const left = await res.json();
    if (typeof left !== "number" || left < 0) {
      return Response.json(
        { error: "오늘은 여기까지! 내일 또 이야기해요. / That's all for today. See you tomorrow!" },
        { status: 403 },
      );
    }
    return "ok";
  } catch (err) {
    console.error("사용 횟수 확인 연결 실패:", err instanceof Error ? err.name : "unknown");
    return failure();
  }
}
