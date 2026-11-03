"use client";

import { useEffect, useState } from "react";
import LanguagePicker from "./LanguagePicker";
import { useLanguage } from "./LanguageProvider";
import { scenes } from "./scenes";

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
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

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

  async function send(raw: string) {
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
    // 지금까지의 대화를 같이 보내야 친구가 앞 이야기를 기억한다
    const history = messages.map(({ role, text }) => ({ role, text }));
    setMessages((prev) => [...prev, { id: prev.length, role: "user", text }]);
    setInput("");
    setNotice("");
    setLoading(true);

    try {
      // 키는 브라우저에 없다. 우리 서버(/api/chat)에 부탁하면 서버가 Gemini에게 묻는다.
      // lang을 같이 보내서 친구가 고른 언어로 설명하게 한다.
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, lang, scene: scene.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) {
        setNotice(res.status === 429 ? t.errBusy : t.errFriend);
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
    <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-3xl bg-white/95 text-gray-900 shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
      <header className="flex items-center gap-3 border-b border-gray-100 p-4">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-amber-400 text-2xl shadow-md">
          🙂
        </div>
        <div>
          <p className="font-semibold">
            한국어 친구 <span className="text-xs font-normal text-gray-500">· {t.friend}</span>
          </p>
          <p className="text-xs text-emerald-600">● {t.online}</p>
        </div>
        {/* 🌐 언어 고르기 (카페 위에 있는 것과 같은 설정을 함께 쓴다) */}
        <div className="ml-auto">
          <LanguagePicker />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-gradient-to-b from-amber-50/60 to-white p-4">
        {/* 친구가 먼저 묻는다. 서버에는 보내지 않고 화면에만 보인다 */}
        <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-gray-800 shadow">
          <p className="font-semibold">{scene.greeting.ko}</p>
          <p className="text-xs italic text-gray-500">KR: {scene.greeting.roman}</p>
          <p className="mt-1 text-xs text-gray-600">= {scene.greeting.meanings[lang]}</p>
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
                {m.text}
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
        <div className="mb-2 flex flex-wrap gap-1">
          {scene.items.map((item) => (
            <button
              key={item.name}
              type="button"
              disabled={loading}
              onClick={() => send(choose(item.name))}
              className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-[#5c3a1c] hover:bg-amber-100 disabled:opacity-50"
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
          <span className="text-gray-400">
            {input.length}/{MAX_LENGTH}
          </span>
        </div>
      </form>
    </div>
  );
}
