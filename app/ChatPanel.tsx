"use client";

import { useEffect, useRef, useState } from "react";
import LoginBar from "./LoginBar";
import LanguagePicker from "./LanguagePicker";
import { useFound } from "./FoundProvider";
import { useLanguage } from "./LanguageProvider";
import { useOrders } from "./OrderProvider";
import { practiceParts } from "./sound";
import SpeakLine, { FriendText } from "./SpeakLine";
import { scenes } from "./scenes";
import { supabase } from "./supabase";

const MAX_LENGTH = 200;
// 지금 장면 (나중에 장면이 늘어나면 바꿔 끼운다)
const scene = scenes.cafe;
// 대화를 이 브라우저(localStorage)에 저장할 때 쓰는 이름. 장면마다 따로 저장한다. 서버나 DB에는 저장하지 않는다
const STORAGE_KEY = `kfc-chat-${scene.id}`;

type Message = { id: number; role: "user" | "friend"; text: string };

// 메뉴를 눌러 고르면 "○○로/으로 할게요"라고 말한다. 받침이 있으면 "으로"(ㄹ받침은 "로")
function choose(name: string) {
  const code = name.charCodeAt(name.length - 1) - 0xac00;
  const batchim = code >= 0 && code <= 11171 ? code % 28 : 0;
  return `${name}${batchim === 0 || batchim === 8 ? "로" : "으로"} 할게요`;
}

export default function ChatPanel() {
  const { lang, picked, t } = useLanguage();
  const { chances, spendChance } = useFound();
  const { addToCart, paidCount } = useOrders();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // 계산이 끝나면 주문하며 나눈 대화를 정리하고 새로 시작한다 (첫인사만 남는다). 대화가 줄줄이 쌓이지 않게
  const [seenPaid, setSeenPaid] = useState(paidCount);
  if (paidCount !== seenPaid) {
    setSeenPaid(paidCount);
    setMessages([]);
  }

  // 🌐 언어를 직접 바꾸면 새 대화로 시작한다. 예전 말은 그때 언어로 저장돼 있어서, 남겨 두면 언어가 섞여 보인다
  // (새로고침으로 저장된 언어를 불러올 때는 picked가 늘지 않아서 대화가 그대로 남는다)
  const [seenPicked, setSeenPicked] = useState(picked);
  if (picked !== seenPicked) {
    setSeenPicked(picked);
    setMessages([]);
    setNotice("");
  }

  // 🔄 새 대화: 계산하지 않고 주문만 했어도, 쌓인 대화를 지우고 첫인사부터 다시 시작한다
  function resetChat() {
    if (loading) return;
    setMessages([]);
    setInput("");
    setNotice("");
  }

  // 새 말이 오면 대화창을 맨 아래로 내려서 최신 말이 보이게 한다
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, loading]);

  // 처음 열 때: 이 브라우저에 저장해 둔 대화를 불러온다 (새로고침해도 대화가 남는다)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) {
        // 브라우저 저장소는 화면이 뜬 뒤에만 읽을 수 있어서(서버엔 없음) 여기서 불러오는 것이 맞다
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(
          saved.filter(
            (m): m is Message =>
              typeof m?.id === "number" && (m.role === "user" || m.role === "friend") && typeof m.text === "string",
          ),
        );
      }
    } catch {
      // 저장된 내용이 망가졌거나 브라우저가 저장을 막으면 빈 대화로 시작한다
    }
    setLoaded(true);
  }, []);

  // 대화가 바뀔 때마다 저장한다. 불러오기 전에는 저장하지 않는다 (빈 대화로 덮어쓰지 않게)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages, loaded]);

  // free: 메뉴 버튼처럼 찬스를 쓰지 않는 말
  async function send(raw: string, free = false) {
    if (loading) return;
    const text = raw.trim();
    if (!text) {
      setNotice(t.errEmpty);
      return;
    }
    if (text.length > MAX_LENGTH) {
      setNotice(t.errLong);
      return;
    }
    // 직접 쓴 말은 친구 찬스를 하나 쓴다 (무료 사용량 절약)
    if (!free && !spendChance()) {
      setNotice(t.noChance);
      return;
    }
    // 지금까지의 대화를 같이 보내야 친구가 앞 이야기를 기억한다
    const history = messages.map(({ role, text }) => ({ role, text }));
    setMessages((prev) => [...prev, { id: prev.length, role: "user", text }]);
    setInput("");
    setNotice("");
    setLoading(true);

    try {
      // 키는 브라우저에 없다. 우리 서버(/api/chat)에 부탁하면 서버가 Gemini에게 묻는다.
      // lang을 같이 보내서 친구가 고른 언어로 설명하게 한다.
      // 로그인 표를 같이 보낸다. 서버가 이걸로 "누구인지"와 오늘 사용 횟수를 확인한다
      const token = (await supabase?.auth.getSession())?.data.session?.access_token;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ message: text, history, lang, scene: scene.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) {
        // 401(로그인 필요), 403(오늘 횟수 다 씀)은 서버가 보낸 안내를 그대로 보여 준다
        setNotice(res.status === 401 || res.status === 403 ? data.error : res.status === 429 ? t.errBusy : t.errFriend);
        return;
      }
      setMessages((prev) => [...prev, { id: prev.length, role: "friend", text: data.reply }]);
    } catch {
      // 인터넷이 끊기는 등 서버에 닿지 못했을 때
      setNotice(t.errNetwork);
    } finally {
      setLoading(false);
    }
  }

  return (
    // 창 높이를 화면에 맞춰 고정한다. 대화가 쌓여도 창은 길어지지 않고 안에서 스크롤된다
    <div className="flex h-[75vh] min-h-[420px] flex-1 flex-col self-start overflow-hidden rounded-3xl md:sticky md:top-6 md:h-[calc(100vh-3rem)] bg-white/95 text-gray-900 shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
      <header className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
        {/* 프로필: 한국어 친구 그림(public/friend.png)에서 얼굴 부분만 동그랗게 보여 준다 */}
        <div
          className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-pink-200 to-amber-200 bg-no-repeat shadow-md"
          style={{ backgroundImage: "url(/friend.png)", backgroundSize: "240%", backgroundPosition: "62% 6%" }}
          role="img"
          aria-label="한국어 친구"
        />
        <div>
          <p className="font-semibold">
            한국어 친구 <span className="text-xs font-normal text-gray-500">· {t.friend}</span>
          </p>
          <p className="text-xs text-emerald-600">● {t.online}</p>
        </div>
        {/* 🌐 언어 고르기 (카페 위에 있는 것과 같은 설정을 함께 쓴다) */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={resetChat}
            disabled={loading}
            title={`새 대화 · ${t.newChat}`}
            aria-label={`새 대화 · ${t.newChat}`}
            // 옆의 🌐 언어 고르기와 같은 모양(둥근 흰 알약, 같은 높이)으로 맞춘다
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 shadow-lg hover:bg-amber-50 disabled:opacity-50"
          >
            🔄 새 대화
          </button>
          <LanguagePicker />
        </div>
      </header>
      {/* 🔐 구글 로그인 줄: 로그인하면 도장·쿠폰·미션이 계정에 저장된다 */}
      <LoginBar />

      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-gradient-to-b from-amber-50/60 to-white p-4">
        {/* 친구가 먼저 묻는다. 서버에는 보내지 않고 화면에만 보인다 */}
        <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-gray-800 shadow">
          {/* 🔊 누르면 형광펜이 한국어와 KR 발음을 같이 따라간다 */}
          <SpeakLine ko={scene.greeting.ko} roman={scene.greeting.roman} mean={`= ${scene.greeting.meanings[lang]}`} />
        </div>
        {messages.map((m) =>
            m.role === "user" ? (
              <div
                key={m.id}
                className="max-w-[80%] self-end break-words rounded-2xl rounded-br-sm bg-amber-400 px-3 py-2 text-sm text-white shadow"
              >
                {m.text}
              </div>
            ) : (
              <div
                key={m.id}
                className="max-w-[85%] self-start whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-gray-800 shadow"
              >
                {/* 🔊 설명 중간의 한국어 자리에 형광펜이 칠해진다. 아래에는 연습할 말 모음 */}
                <FriendText text={m.text} extra={practiceParts(m.text)} />
              </div>
            ),
        )}
        {loading && (
          <div className="self-start rounded-2xl bg-white px-3 py-2 text-sm text-gray-400 shadow">{t.typing}</div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-gray-100 p-3"
      >
        {/* 메뉴를 눌러서 고르기: 누르면 "아메리카노로 할게요"라고 말한다 */}
        <p className="mb-1 px-1 text-xs text-gray-500">{t.pick}</p>
        {/* 버튼은 한 줄로 두고 옆으로 밀어서 본다. 여러 줄이면 대화칸이 너무 작아진다 */}
        <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
          {scene.items.map((item) => (
            <button
              key={item.name}
              type="button"
              disabled={loading}
              onClick={() => {
                // 고른 것은 🧾 주문서에 담긴다. 계산하고 진동벨이 울리면 받아서 내 탁자에서 먹는다
                addToCart(item);
                send(choose(item.name), true);
              }}
              className="shrink-0 whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-[#5c3a1c] hover:bg-amber-100 disabled:opacity-50"
            >
              {item.emoji} {item.name}{" "}
              <span className="text-[10px] text-gray-500">{item.names[lang] ?? item.names.en}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setNotice("");
            }}
            maxLength={MAX_LENGTH}
            placeholder={t.placeholder}
            className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-500 disabled:opacity-50"
          >
            {t.send}
          </button>
        </div>
        <div className="mt-1 flex justify-between px-2 text-xs">
          <span className="text-red-500">{notice}</span>
          <span className="whitespace-nowrap text-gray-400">
            🙋 {chances} · {t.chances} · {input.length}/{MAX_LENGTH}
          </span>
        </div>
      </form>
    </div>
  );
}
