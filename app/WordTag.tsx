"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { words, type WordKey } from "./words";

// 물건 옆 이름표 버튼. 처음엔 한국어만 보이고, 누르면 발음과 내 나라 말이 펼쳐진다.
export default function WordTag({ word, className = "" }: { word: WordKey; className?: string }) {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const w = words[word];

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      className={`absolute z-30 whitespace-nowrap rounded-lg border border-amber-300 bg-white/95 px-2 py-0.5 text-left text-xs text-[#5c3a1c] shadow-md transition hover:scale-105 ${className}`}
    >
      <span className="font-bold">🏷️ {w.ko}</span>
      {open && (
        <span className="block text-[10px] leading-tight text-gray-600">
          <span className="italic">KR: {w.roman}</span>
          <br />= {w.names[lang] ?? w.names.en}
        </span>
      )}
    </button>
  );
}
