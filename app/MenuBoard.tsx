"use client";

import { useLanguage } from "./LanguageProvider";
import { menu } from "./menu";
import MissionButton from "./MissionButton";
import WordTag from "./WordTag";

// 유리 메뉴판. 뒤의 나무 선반이 뿌옇게 비쳐 보인다. 한국어 이름 아래에 고른 언어 이름을 보여 준다.
export default function MenuBoard() {
  const { lang, t } = useLanguage();

  return (
    <div className="relative w-full overflow-visible rounded-2xl border border-white/70 bg-gradient-to-br from-white/45 via-white/20 to-white/35 p-4 text-[#2a1c10] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_30px_rgba(0,0,0,0.25)] backdrop-blur-[3px] transition-transform duration-700 ease-out [text-shadow:0_0_6px_rgba(255,255,255,0.95)] [transform:rotateY(-10deg)_rotateX(3deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)]">
      {/* 유리에 비친 빛 줄 */}
      <span className="pointer-events-none absolute inset-y-0 left-[18%] w-10 -skew-x-12 bg-white/25" />
      <WordTag word="menuBoard" className="-right-4 -top-5" />
      {/* 숨은 단어: 가격 (오른쪽 가격 줄 옆) */}
      <WordTag word="price" className="-right-3 top-14" />
      {/* ⭐ 미션 2: 메뉴판 보고 주문하기 */}
      <MissionButton id="order" className="-left-3 -top-3" />
      <h2 className="mb-3 text-center text-lg font-semibold tracking-widest">
        메뉴 <span className="text-sm font-normal text-[#6b5a4a]">· {t.menu}</span>
      </h2>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-2 font-mono">
        {menu.map((item) => (
          <li key={item.name} className="flex justify-between border-b border-dashed border-[#3b2a1a]/20 pb-1">
            <span className="flex flex-col leading-tight">
              <span>{item.name}</span>
              <span className="text-xs text-[#6b5a4a]">{item.names[lang] ?? item.names.en}</span>
            </span>
            <span className="whitespace-nowrap font-semibold text-[#9a4d0f]">{item.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
