"use client";

import { useState } from "react";
import { useFound } from "./FoundProvider";
import { useLanguage } from "./LanguageProvider";
import SpeakButton from "./SpeakButton";
import type { LangCode } from "./i18n";
import { words, type WordKey } from "./words";

type Names = { en: string } & Partial<Record<LangCode, string>>;

// 띄어쓰기는 맞든 틀리든 괜찮게 비교한다 (예: "커피 머신" = "커피머신")
const normalize = (s: string) => s.replace(/\s+/g, "").trim();

// 숨은 단어 버튼 (보물찾기).
// 처음엔 거의 투명한 작은 동그라미만 살짝 반짝인다 (화면을 가리지 않게).
// 누르면 단어 카드(한국어, KR 발음, 내 나라 말)가 나오고, 한국어로 직접 써서 맞혀야 "찾은 단어"가 된다.
// foundKey: 보물찾기에서 이 단어를 구별하는 이름 (같은 단어가 여러 곳에 있어도 한 번만 센다)
export function WordButton({
  ko,
  roman,
  names,
  foundKey,
  className = "",
}: {
  ko: string;
  roman: string;
  names: Names;
  foundKey: string;
  className?: string;
}) {
  const { lang, t } = useLanguage();
  const { found, markFound } = useFound();
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const isFound = found.includes(foundKey);

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (normalize(answer) === normalize(ko)) {
      markFound(foundKey);
      setWrong(false);
    } else {
      setWrong(true);
    }
  }

  return (
    <div className={`absolute z-30 ${className}`}>
      {open ? (
        <div className="relative w-max max-w-[170px] rounded-lg border border-amber-300 bg-white/95 py-1 pl-2 pr-7 text-left text-xs text-[#5c3a1c] shadow-md">
          <SpeakButton text={ko} className="absolute right-1 top-1" />
          <button type="button" onClick={() => setOpen(false)} aria-expanded className="block w-full text-left">
            <span className="font-bold">
              {isFound ? "✅" : "🏷️"} {ko}
            </span>
            <span className="block text-[10px] leading-tight text-gray-600">
              <span className="italic">KR: {roman}</span>
              <br />= {names[lang] ?? names.en}
            </span>
          </button>
          {isFound ? (
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
              {/* 스탬프 도장 쾅! */}
              <span className="grid h-6 w-6 -rotate-12 place-items-center rounded-full border-2 border-rose-500 text-xs animate-[stamp-pop_0.4s_ease-out]">☕</span>
              {t.correct}
            </p>
          ) : (
            <form onSubmit={check} className="mt-1">
              <input
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setWrong(false);
                }}
                placeholder={t.typePrompt}
                aria-label={t.typePrompt}
                className="w-full rounded border border-amber-300 px-1 py-0.5 text-[11px] outline-none focus:border-amber-500"
              />
              {wrong && <p className="mt-0.5 text-[10px] text-red-500">{t.tryAgain}</p>}
            </form>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label={ko}
          className={`block h-5 w-5 rounded-full border shadow-[0_0_6px_rgba(255,255,255,0.6)] hover:bg-white/40 ${
            isFound ? "border-emerald-300 bg-emerald-300/30" : "animate-[word-glow_2.4s_ease-in-out_infinite] border-white/70 bg-white/15"
          }`}
        />
      )}
    </div>
  );
}

// 카페 안 물건 단어 버튼 (단어는 app/words.ts에서 가져온다)
export default function WordTag({ word, className = "" }: { word: WordKey; className?: string }) {
  const w = words[word];
  return <WordButton ko={w.ko} roman={w.roman} names={w.names} foundKey={`word:${word}`} className={className} />;
}
