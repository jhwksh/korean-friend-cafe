"use client";

import { useLanguage } from "./LanguageProvider";
import { menu } from "./menu";

// 계산대 위 음식. 메뉴판과 같은 목록에서 그려서 항상 메뉴와 맞는다.
// 이름표는 한국어 아래에 고른 언어 이름을 작게 붙인다.
// 음식은 계산대 위 유리 쇼케이스 안에 놓여서 떠 보이지 않는다.
export default function CounterFood() {
  const { lang } = useLanguage();
  return (
    <div className="relative z-20 -mb-3 flex justify-center">
      {/* 유리 쇼케이스: 반투명 유리 + 반짝이는 빛 줄 + 아래 선반 */}
      <div className="relative flex gap-3 overflow-hidden rounded-t-2xl border-2 border-b-0 border-white/80 bg-gradient-to-b from-white/50 to-sky-100/30 px-4 pb-3 pt-9 shadow-[inset_0_0_24px_rgba(255,255,255,0.7),0_10px_18px_rgba(0,0,0,0.25)] sm:gap-6 sm:px-6">
        <span className="pointer-events-none absolute -left-6 top-0 h-full w-10 rotate-12 bg-white/40 blur-[2px]" />
        <span className="pointer-events-none absolute left-1/3 top-0 h-full w-3 rotate-12 bg-white/30" />
        <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-b from-white/80 to-[#d9b48a]" />
      {menu.map((item) => (
        <div key={item.name} className="relative flex flex-col items-center">
          {item.hot && (
            <>
              <span className="absolute -top-6 left-2 h-6 w-2 rounded-full bg-white/70 blur-[2px] animate-[steam_2.5s_ease-out_infinite]" />
              <span className="absolute -top-6 left-5 h-6 w-2 rounded-full bg-white/70 blur-[2px] animate-[steam_2.5s_ease-out_0.8s_infinite]" />
            </>
          )}
          <span className="text-4xl drop-shadow-[0_6px_4px_rgba(0,0,0,0.35)]">{item.emoji}</span>
          <span className="text-[11px] font-semibold text-[#5c3a1c]">{item.name}</span>
          <span className="max-w-[80px] text-center text-[10px] leading-tight text-[#7a5230]">
            {item.names[lang] ?? item.names.en}
          </span>
        </div>
      ))}
      </div>
    </div>
  );
}
