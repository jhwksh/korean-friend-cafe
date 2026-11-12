"use client";

import { useState } from "react";
import { useFound } from "./FoundProvider";
import { STAMPS_ON } from "./features";
import { useLanguage } from "./LanguageProvider";
import { missions, type MissionId } from "./missions";
import { playCoffee, speakAlong } from "./sound";
import { Words } from "./SpeakLine";

// 띄어쓰기와 문장부호는 빼고 비교한다 (예: "안녕하세요!" = "안녕하세요")
const normalize = (s: string) => s.replace(/[\s.,!?~。？！]/g, "");

// 두 글자열이 몇 글자 다른지 센다 (오타를 조금 봐주려고)
function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// 스탬프 미션 자리. 처음엔 살짝 반짝이는 별 동그라미만 보인다.
// 누르면 그 자리에서 쓸 한국어 문장이 나오고, 직접 써서 맞히면 도장을 받는다.
// 오타가 조금 있으면(긴 문장일수록 조금 더 봐준다) 맞는 문장을 보여 주고 도장을 준다.
export default function MissionButton({ id, className = "" }: { id: MissionId; className?: string }) {
  const { lang, t } = useLanguage();
  const { stamps, addStamp } = useFound();
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"" | "almost" | "wrong">("");
  const [at, setAt] = useState(-1); // 🖍️ 형광펜이 칠할 낱말 번호
  const index = missions.findIndex((m) => m.id === id);
  const m = missions[index];
  const done = stamps.includes(id);
  // 미션은 하나씩: 앞 미션을 다 해야 이 미션이 나타난다
  const current = missions.find((x) => !stamps.includes(x.id));
  if (!done && current?.id !== id) return null;

  function check(e: React.FormEvent) {
    e.preventDefault();
    const a = normalize(answer);
    const goal = normalize(m.ko);
    if (!a) return;
    const diff = distance(a, goal);
    // 주문 미션을 깨면 바리스타가 커피를 내린다 ☕
    if (diff <= Math.max(1, Math.floor(goal.length * 0.15)) && id === "order") playCoffee();
    if (diff === 0) {
      addStamp(id);
      setResult("");
    } else if (diff <= Math.max(1, Math.floor(goal.length * 0.15))) {
      addStamp(id);
      setResult("almost");
    } else {
      setResult("wrong");
    }
  }

  return (
    <div className={`absolute z-30 ${className}`}>
      {open ? (
        <div className="relative w-max max-w-[210px] rounded-xl border-2 border-amber-400 bg-white/95 py-1.5 pl-2.5 pr-8 text-left text-xs text-[#5c3a1c] shadow-lg">
          {/* 🔊 누르면 미션 문장을 읽고, 형광펜이 한국어와 KR 발음을 같이 따라간다 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speakAlong(m.ko.split(" "), setAt);
            }}
            aria-label={`${m.ko} 듣기`}
            className="absolute right-1.5 top-1.5 inline-grid h-5 w-5 place-items-center rounded-full bg-amber-100 text-[11px] hover:bg-amber-200"
          >
            🔊
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-expanded className="block w-full text-left">
            <span className="text-[10px] font-semibold text-amber-600">
              {m.emoji} 미션 {index + 1} · {t.mission}
            </span>
            <span className="block text-sm font-bold">
              <Words text={m.ko} at={at} />
            </span>
            <span className="block text-[10px] leading-tight text-gray-600">
              <span className="italic">
                KR: <Words text={m.roman} at={at} />
              </span>
              <br />= {m.names[lang]}
            </span>
          </button>
          {done ? (
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              {/* 스탬프 도장 쾅! */}
              <span className="grid h-8 w-8 -rotate-12 place-items-center rounded-full border-2 border-rose-500 bg-rose-50 text-base animate-[stamp-pop_0.4s_ease-out]">{STAMPS_ON ? "☕" : "✅"}</span>
              <span>
                {result === "almost" && (
                  <span className="block text-[10px] font-normal text-amber-700">
                    {t.almost} {m.ko}
                  </span>
                )}
                {t.correct}
              </span>
            </div>
          ) : (
            <form onSubmit={check} className="mt-1">
              <input
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setResult("");
                }}
                placeholder={t.typePrompt}
                aria-label={t.typePrompt}
                className="w-full rounded border border-amber-300 px-1.5 py-1 text-[12px] outline-none focus:border-amber-500"
              />
              {result === "wrong" && <p className="mt-0.5 text-[10px] text-red-500">{t.tryAgain}</p>}
            </form>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`미션 ${index + 1}`}
          className={`grid h-6 w-6 place-items-center rounded-full border-2 text-[11px] shadow-[0_0_8px_rgba(251,191,36,0.7)] ${
            done ? "border-rose-400 bg-rose-50/80" : "animate-[word-glow_2.4s_ease-in-out_infinite] border-amber-300 bg-amber-100/40"
          }`}
        >
          {done ? "☕" : "⭐"}
        </button>
      )}
    </div>
  );
}
