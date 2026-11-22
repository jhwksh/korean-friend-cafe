"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Hud from "../../Hud";
import LanguagePicker from "../../LanguagePicker";
import { useLanguage } from "../../LanguageProvider";
import { trackOnce } from "../../tracking";
import { pickBasket, STORE_NAME, type Basket } from "./data";
import StoreDialog from "./StoreDialog";
import { CALC_BTN, STORE_SUB } from "./text";

// 🏪 /place/store: 가상 명동의 편의점. 지금은 계산대에서 점원과 대답만 주고받는다.
// 카페와 같은 틀(CafeStage)을 쓰지만 로그인·음악·채팅 친구·주문서는 넣지 않는다.
export default function Store() {
  const { lang } = useLanguage();
  // 바구니는 계산 창을 열 때 고른다 (처음 그리는 동안에는 아직 없다 → 무작위가 화면 준비를 방해하지 않는다)
  const [basket, setBasket] = useState<Basket | null>(null);
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(0);

  // 📊 편의점에 온 사람을 이번 방문에 한 번 센다
  useEffect(() => {
    trackOnce("store_visit");
  }, []);

  function newBasket() {
    const next = pickBasket(basket?.id);
    setBasket(next);
    setRound((n) => n + 1);
  }

  function start() {
    newBasket();
    setOpen(true);
  }

  return (
    <>
      {/* 배경 사진: 지금은 카페 사진을 복사해 쓴다 (나중에 진짜 편의점 사진으로 바꾼다) */}
      <Image src="/store/counter.jpg" alt="" fill priority sizes="100vw" className="object-cover" />

      {/* 간판 */}
      <h1 className="absolute left-[400px] top-[44px] z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-[#8b5a2b] bg-white/90 px-5 py-1.5 text-center text-2xl font-extrabold text-[#5c3a1c] shadow-[0_6px_12px_rgba(0,0,0,0.25)]">
        🏪 {STORE_NAME}
        <span className="block text-sm font-semibold text-[#7a5230]">{STORE_SUB[lang]}</span>
      </h1>

      {/* 🌐 언어 고르기: 화면 오른쪽 위 (확대·밀기와 상관없이 그 자리에) */}
      <Hud>
        <div className="absolute right-3 top-3 z-40">
          <LanguagePicker />
        </div>
      </Hud>

      {/* 🧺 계산대 위 큰 버튼 */}
      <button
        type="button"
        onClick={start}
        className="absolute left-[400px] top-[590px] z-30 -translate-x-1/2 rounded-2xl border-4 border-[#8b5a2b] bg-amber-300 px-8 py-3 text-center text-2xl font-extrabold text-[#5c3a1c] shadow-[0_8px_20px_rgba(0,0,0,0.35)] hover:bg-amber-200"
      >
        🧺 {CALC_BTN.ko}
        <span className="block text-sm font-semibold text-[#7a5230]">{CALC_BTN.mean[lang]}</span>
      </button>

      {/* 계산 창: 열 때마다 새 바구니로 처음부터 */}
      {open && basket && (
        <StoreDialog
          key={round}
          basket={basket}
          onClose={() => setOpen(false)}
          onAgain={newBasket}
        />
      )}
    </>
  );
}
