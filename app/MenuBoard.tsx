"use client";

import { useState } from "react";
import { languages, menu, type LangCode } from "./menu";

// 칠판 메뉴판. 한국어 이름 아래에 고른 외국어 이름을 보여 준다.
export default function MenuBoard() {
  const [lang, setLang] = useState<LangCode>("en");

  return (
    <div className="w-full max-w-xs rounded-xl border-8 border-[#6b4423] bg-[#2f3b2f] p-5 text-[#f1f5e9] shadow-[0_25px_40px_rgba(0,0,0,0.4)] transition-transform duration-500 [transform:rotateY(-14deg)_rotateX(4deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-widest">메뉴</h2>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as LangCode)}
          aria-label="Language"
          className="rounded-md bg-white/10 px-2 py-1 text-sm text-[#f1f5e9] outline-none focus:ring-2 focus:ring-amber-200"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code} className="text-gray-900">
              🌐 {l.label}
            </option>
          ))}
        </select>
      </div>
      <ul className="space-y-2 font-mono">
        {menu.map((item) => (
          <li key={item.name} className="flex justify-between border-b border-dashed border-white/20 pb-1">
            <span className="flex flex-col leading-tight">
              <span>{item.name}</span>
              <span className="text-xs text-white/60">{item.names[lang] ?? item.names.en}</span>
            </span>
            <span className="text-amber-200">{item.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
