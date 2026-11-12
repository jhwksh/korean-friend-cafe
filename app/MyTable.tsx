"use client";

import { useState } from "react";
import type { UiKey } from "./i18n";
import { useLanguage } from "./LanguageProvider";
import { menu } from "./menu";
import { useOrders, type Order } from "./OrderProvider";
import { playBread, playChew, playGulp, playToast } from "./sound";
import SpeakLine from "./SpeakLine";
import AfterMeal from "./AfterMeal";
import { KioskPay } from "./Checkout";

// 🪑 360° 카페에서 자리에 앉으면 보이는 내 탁자.
// 채팅에서 주문한 것이 놓이고, 누를 때마다 먹는 소리가 나며 조금씩 줄어든다.
// 먹을 때 한국어 소리 흉내말(꿀꺽꿀꺽, 바삭바삭, 오물오물)과 "마셔요/먹어요"를 보여 주고, 그 아래에 내 언어로 뜻을 적는다.
const TOAST = ["🍞"];
const BREAD = ["🥖", "🥐"];
const SOFT = ["🍰"];

// 뜻(내 언어)은 i18n 글자: soundMean + verbMean("{x}"에 메뉴 이름), doneMean
// KR 발음: soundRoman, verbRoman (메뉴 이름 발음은 menu.ts의 roman)
type HowToEat = {
  play: () => void;
  sound: string;
  soundRoman: string;
  verb: string;
  verbRoman: string;
  done: string;
  soundMean: UiKey;
  verbMean: UiKey;
  doneMean: UiKey;
};
function howToEat(o: Order): HowToEat {
  const eatIt = { verb: "먹어요", verbRoman: "meogeoyo", done: "다 먹었어요", verbMean: "eatIt", doneMean: "ateAll" } as const;
  if (TOAST.includes(o.emoji)) return { play: playToast, sound: "바삭바삭!", soundRoman: "basakbasak!", soundMean: "soundCrunch", ...eatIt };
  if (BREAD.includes(o.emoji)) return { play: playBread, sound: "바삭!", soundRoman: "basak!", soundMean: "soundCrunch", ...eatIt };
  if (SOFT.includes(o.emoji)) return { play: playChew, sound: "오물오물!", soundRoman: "omulomul!", soundMean: "soundYum", ...eatIt };
  return {
    play: playGulp,
    sound: "꿀꺽꿀꺽!",
    soundRoman: "kkulkkeokkkulkkeok!",
    verb: "마셔요",
    verbRoman: "masyeoyo",
    done: "다 마셨어요",
    soundMean: "soundSip",
    verbMean: "drinkIt",
    doneMean: "drankAll",
  };
}

// "커피를", "빵을": 받침이 있으면 "을", 없으면 "를". 발음도 같이 (amerikanoreul, sogeumppangeul)
function hasBatchim(name: string) {
  const code = name.charCodeAt(name.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}
function withObject(name: string) {
  return `${name}${hasBatchim(name) ? "을" : "를"}`;
}
function withObjectRoman(name: string) {
  const roman = menu.find((m) => m.name === name)?.roman ?? "";
  return `${roman}${hasBatchim(name) ? "eul" : "reul"}`;
}

// 한 입 먹을 때마다 작아진다 (남은 입: 3, 2, 1)
const SIZE = ["", "text-5xl", "text-6xl", "text-7xl"];

export default function MyTable({ onStand, onHiddenPicture }: { onStand: () => void; onHiddenPicture: () => void }) {
  const { lang, t } = useLanguage();
  const { orders, eat, carrying, putDown, step, alertBy, openPickup } = useOrders();
  // 패드로 시킨 메뉴가 나오면 탁자 위 패드가 울린다
  const padRinging = step === "ready" && alertBy === "pad";
  const [padOpen, setPadOpen] = useState(false);
  const [said, setSaid] = useState<{ id: number; ko: string; roman: string; mean: string } | null>(null);

  // 탁자 위 것을 다 먹었고, 들고 온 쟁반도 없을 때
  const allEaten = orders.length > 0 && orders.every((o) => o.bites === 0) && carrying.length === 0;

  // 메뉴 이름을 내 언어로 (예: 소금빵 → Salt Bread)
  const nameIn = (name: string) => {
    const item = menu.find((m) => m.name === name);
    return item ? (item.names[lang] ?? item.names.en) : name;
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-[42] flex flex-col items-center gap-2 p-3">
      {/* 🧺 들고 온 쟁반: 내려놓으면 탁자에 놓인다 */}
      {carrying.length > 0 && (
        <button
          type="button"
          onClick={putDown}
          className="rounded-2xl border-4 border-[#8b5a2b] bg-[#c8a27a] px-4 py-2 text-[#4a2e17] shadow-lg hover:brightness-105"
        >
          <span className="block text-3xl">{carrying.map((c) => c.emoji).join(" ")}</span>
          <span className="block text-sm font-bold">🧺 쟁반 내려놓기</span>
          <span className="block text-xs italic">KR: jaengban naeryeonoki</span>
          <span className="block text-xs">{t.putDown}</span>
        </button>
      )}

      {/* 🍽️ 다 먹으면: 이제 카페를 구경해 볼까요? (📸 인증샷, 🖼️ 숨은 그림, 👀 구경하기) */}
      {allEaten && <AfterMeal onHiddenPicture={onHiddenPicture} onLookAround={onStand} onOrderMore={() => setPadOpen(true)} />}
      {padOpen && <KioskPay pad onClose={() => setPadOpen(false)} />}

      {/* 방금 먹은 것의 소리 흉내말 */}
      {said && (
        <SpeakLine
          key={said.id}
          ko={said.ko}
          roman={said.roman}
          mean={said.mean}
          className="rounded-2xl bg-white/95 px-4 py-1 text-center text-lg text-[#5c3a1c] shadow-lg"
        />
      )}

      {/* 동그란 나무 탁자 */}
      <div className="flex min-h-[160px] w-full max-w-[600px] flex-wrap items-center justify-center gap-3 rounded-[50%] border-[6px] border-[#4a2e17] bg-[radial-gradient(circle,#8a5a33,#5e3b1f)] px-10 py-5 shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
        {orders.length === 0 ? (
          <p className="text-center text-xs text-amber-100">{t.noOrder}</p>
        ) : (
          orders.map((o) => {
            const how = howToEat(o);
            const empty = o.bites === 0;
            return (
              <button
                key={o.id}
                type="button"
                disabled={empty}
                onClick={() => {
                  how.play();
                  eat(o.id);
                  setSaid({
                    id: Date.now(),
                    ko: `${how.sound} ${withObject(o.name)} ${how.verb}`,
                    roman: `${how.soundRoman} ${withObjectRoman(o.name)} ${how.verbRoman}`,
                    mean: `${t[how.soundMean]}! ${t[how.verbMean].replace("{x}", nameIn(o.name))}`,
                  });
                }}
                className="flex w-24 flex-col items-center rounded-full transition-transform hover:scale-110 disabled:hover:scale-100"
              >
                {/* 하얀 접시 위에 놓는다. 다 먹으면 빈 접시만 남는다 */}
                <span className="grid h-24 w-24 place-items-center rounded-full border-2 border-gray-200 bg-[radial-gradient(circle,#ffffff_55%,#e9e6e1)] shadow-[0_3px_6px_rgba(0,0,0,0.35)]">
                  {!empty && <span className={SIZE[o.bites]}>{o.emoji}</span>}
                </span>
                <span className="text-sm font-bold text-amber-50">{empty ? how.done : o.name}</span>
                <span className="text-xs font-medium leading-tight text-amber-200">{empty ? t[how.doneMean] : nameIn(o.name)}</span>
              </button>
            );
          })
        )}
      </div>
      <div className="flex items-center gap-2">
        <p className="rounded-full bg-black/50 px-3 py-1 text-xs text-white">👆 {t.tapToEat}</p>
        {/* 📱 탁자 위 테이블 패드: 더 먹고 싶으면 여기서 주문한다. 패드로 시킨 메뉴가 나오면 패드가 울린다 */}
        {padRinging ? (
          <button
            type="button"
            onClick={openPickup}
            className="animate-[bell-shake_0.4s_ease-in-out_infinite] rounded-xl border-2 border-amber-400 bg-[#1f3b57] px-3 py-1 text-left text-xs font-bold text-white shadow"
          >
            📱 메뉴 나왔어요! <span className="block text-xs font-medium text-amber-200">받으러 가기 · {t.pickUp}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPadOpen(true)}
            disabled={step !== "ordering"}
            className="rounded-xl border-2 border-gray-800 bg-[#1f3b57] px-3 py-1 text-left text-xs font-bold text-white shadow hover:brightness-110 disabled:opacity-50"
          >
            📱 테이블 패드 <span className="block text-xs font-medium text-gray-300">{t.orderMore}</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onStand}
        className="rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-[#5c3a1c] shadow-lg hover:bg-white"
      >
        🚶 일어나기 · {t.standUp}
      </button>
    </div>
  );
}
