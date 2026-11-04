"use client";

import { menu } from "./menu";
import MissionButton from "./MissionButton";
import { useOrders } from "./OrderProvider";
import WordTag, { WordButton } from "./WordTag";

// 계산대 위 음식. 메뉴판과 같은 목록에서 그려서 항상 메뉴와 맞는다.
// 음식마다 투명한 단어 버튼이 있어서, 누르면 한국어·KR 발음·내 나라 말이 나온다.
// 음식은 계산대 위 유리 쇼케이스 안에 놓여서 떠 보이지 않는다.
// 🛒 담기: 채팅창까지 가지 않고 여기서 바로 주문서에 담는다.
export default function CounterFood() {
  const { addToCart } = useOrders();
  return (
    <div className="relative z-20 -mb-3 flex justify-center">
      {/* 유리 쇼케이스: 반투명 유리 + 반짝이는 빛 줄 + 아래 선반 */}
      <div className="relative grid grid-cols-5 gap-x-6 gap-y-3 rounded-t-2xl border-2 border-b-0 border-white/80 bg-gradient-to-b from-white/50 to-sky-100/30 px-6 pb-3 pt-9 shadow-[inset_0_0_24px_rgba(255,255,255,0.7),0_10px_18px_rgba(0,0,0,0.25)]">
        {/* 유리에 비친 빛 줄 (진열장 밖으로 삐져나가지 않게 따로 자른다. 단어 카드는 밖으로 나와도 된다) */}
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-2xl">
          <span className="absolute -left-6 top-0 h-full w-10 rotate-12 bg-white/40 blur-[2px]" />
          <span className="absolute left-1/3 top-0 h-full w-3 rotate-12 bg-white/30" />
        </span>
        <WordTag word="showcase" className="right-2 top-1" />
        {/* ⭐ 미션 3: 진열장 음식 보고 "이거 뭐예요?" */}
        <MissionButton id="what" className="left-2 top-1" />
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
          <button
            type="button"
            onClick={() => addToCart(item)}
            aria-label={`${item.name} 담기`}
            className="mt-0.5 rounded-full bg-amber-400 px-2 text-[10px] font-bold text-white shadow hover:bg-amber-500"
          >
            🛒 담기
          </button>
          <WordButton ko={item.name} roman={item.roman} names={item.names} foundKey={`menu:${item.name}`} className="-right-3 -top-2" />
        </div>
      ))}
      </div>
    </div>
  );
}
