"use client";

import { useLanguage } from "./LanguageProvider";
import { menu } from "./menu";
import WordTag from "./WordTag";

// 칠판 메뉴판. 한국어 이름 아래에 고른 언어 이름을 보여 준다.
export default function MenuBoard() {
  const { lang, t } = useLanguage();

  return (
    <div className="w-full max-w-xs rounded-xl border-8 border-[#6b4423] bg-[#2f3b2f] p-5 text-[#f1f5e9] shadow-[0_25px_40px_rgba(0,0,0,0.4)] transition-transform duration-500 [transform:rotateY(-14deg)_rotateX(4deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)]">
      <WordTag word="menuBoard" className="-right-4 -top-5" />
      <h2 className="mb-3 text-center text-lg font-semibold tracking-widest">
        메뉴 <span className="text-sm font-normal text-white/60">· {t.menu}</span>
      </h2>
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
