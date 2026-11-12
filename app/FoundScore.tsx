"use client";

import { useEffect, useState } from "react";
import { STAMPS_PER_COUPON, TOTAL_WORDS, useFound } from "./FoundProvider";
import { STAMPS_ON } from "./features";
import { useLanguage } from "./LanguageProvider";
import { missions } from "./missions";
import { StampRules } from "./Stamps";
import { words } from "./words";

// 스탬프 카드 점수판 + 쿠폰.
// 한국 카페의 "도장 10개 모으면 음료 1잔 무료" 스탬프 카드처럼 도장을 모은다.
// 도장 받는 때: 🖼️⭐ 미션 성공 / 💳 계산할 때 "적립해 주세요" (음료 1잔 = 1개). 5개마다 쿠폰 1장 (규칙은 Stamps.tsx).
// 단어 버튼(동그라미)은 연습용이라 따로 센다.
const SEEN_KEY = "kfc-coupon-seen"; // 이미 창을 보여 준 쿠폰 (새로고침해도 다시 안 뜨게)

export default function FoundScore() {
  const { lang, t } = useLanguage();
  const { found, stamps, totalStamps, coupons } = useFound();
  // 카드 한 장 = 도장 10칸. 10개를 채우면 새 카드
  const onCard = totalStamps % 10;
  const cardsDone = Math.floor(totalStamps / 10);
  const readyCoupons = coupons.filter((c) => !c.used).length;
  // 지금 해야 할 미션 (미션은 하나씩 열린다)
  const current = missions.find((m) => !stamps.includes(m.id));

  const [seen, setSeen] = useState<string[] | null>(null);
  const [showCard, setShowCard] = useState(false);
  // 점수판은 처음엔 동그란 도장 모양 버튼으로 접혀 있고, 누르면 펼쳐진다 (카페 화면을 가리지 않게)
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
      // 브라우저 저장소는 화면이 뜬 뒤에만 읽을 수 있어서(서버엔 없음) 여기서 불러오는 것이 맞다
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeen(Array.isArray(saved) ? saved : []);
    } catch {
      setSeen([]);
    }
  }, []);

  // 새로 받은 쿠폰 중 아직 창을 안 보여 준 것
  const fresh = seen ? coupons.find((c) => !seen.includes(c.id)) : undefined;

  function closeFresh() {
    if (!fresh || !seen) return;
    const next = [...seen, fresh.id];
    setSeen(next);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    } catch {}
  }

  return (
    <>
      {/* ⭐ 동그란 도장 모양 버튼: 누르면 점수판이 열리고 닫힌다 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="미션 · Missions"
        className="absolute right-3 top-3 z-40 grid h-14 w-14 -rotate-12 place-items-center rounded-full border-4 border-double border-rose-400 bg-white/95 text-center leading-none text-rose-500 shadow-lg hover:scale-105"
      >
        <span className="text-xl">⭐</span>
        <span className="text-[10px] font-bold">
          {stamps.length}/{missions.length}
        </span>
      </button>

      {/* 점수판 */}
      {open && (
      <button
        type="button"
        onClick={() => STAMPS_ON && setShowCard(true)}
        className="absolute right-3 top-[76px] z-40 w-[170px] rounded-xl bg-white/90 px-3 py-1.5 text-left text-[#5c3a1c] shadow-lg hover:bg-white"
      >
        {STAMPS_ON ? (
        <>
        <span className="block text-sm font-semibold">
          📇 스탬프 {onCard} / 10 {readyCoupons > 0 && <span className="text-rose-500">· 🎟️{readyCoupons}</span>}
        </span>
        <span className="block text-xs font-medium text-gray-600">☕ +1: 🖼️⭐ / 💳 &quot;적립해 주세요&quot;</span>
        </>
        ) : (
          <span className="block text-sm font-semibold">⭐ 미션 <span className="text-xs font-medium text-gray-500">{stamps.length} / {missions.length}</span></span>
        )}
        {current && (
          <span className="mt-1 block rounded-md bg-amber-50 px-1.5 py-1 text-[11px] leading-tight">
            📜 {t.nowMission}: {current.emoji} <b>{words[current.place].ko}</b>
            <span className="block text-[10px] text-gray-500">
              = {words[current.place].names[lang] ?? words[current.place].names.en}
              {current.in360 && ` · ${t.in360}`}
            </span>
          </span>
        )}
        {STAMPS_ON && <span className="mt-1 flex gap-0.5">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={`h-2 flex-1 rounded-full ${i < onCard ? "bg-rose-400" : "bg-amber-100"}`} />
          ))}
        </span>}
        <span className="mt-1 block text-[10px] text-gray-600">
          📝 {found.length} / {TOTAL_WORDS} · {t.wordsPracticed}
        </span>
      </button>
      )}

      {/* 새 상품을 받았을 때 한 번 뜨는 쿠폰 창 */}
      {STAMPS_ON && fresh && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-[320px] rounded-2xl bg-white p-5 text-center text-[#3b2a1a] shadow-2xl">
            <p className="text-4xl">🎉</p>
            <p className="mt-1 text-lg font-bold">축하해요! 쿠폰을 받았어요!</p>
            <p className="text-xs text-gray-500">{t.congrats}</p>
            <div className="my-3 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-3">
              <p className="text-3xl">{fresh.reward.emoji}</p>
              <p className="font-bold">{fresh.reward.ko}</p>
              <p className="text-xs text-gray-500">{fresh.reward.names[lang]}</p>
            </div>
            <p className="text-xs font-medium text-gray-600">🎟️ {t.ruleUse}</p>
            <button type="button" onClick={closeFresh} className="mt-3 rounded-full bg-amber-400 px-5 py-1.5 text-sm font-semibold text-white hover:bg-amber-500">
              닫기 · {t.close}
            </button>
          </div>
        </div>
      )}

      {/* 스탬프 카드 */}
      {showCard && !fresh && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/40">
          <div className="max-h-full w-[380px] overflow-y-auto rounded-2xl bg-[#fffaf0] p-5 text-[#3b2a1a] shadow-2xl">
            <p className="text-center text-lg font-bold">📇 스탬프 카드 · {t.stampCard}</p>
            {/* 도장 10칸 (5번째 칸은 쿠폰 칸). 10개를 채우면 새 카드 */}
            <div className="my-3 grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className={`grid h-12 w-12 place-items-center justify-self-center rounded-full border-2 text-xl ${
                    i < onCard ? "-rotate-12 border-rose-500 bg-rose-50" : "border-dashed border-amber-300 bg-white"
                  }`}
                >
                  {i < onCard ? "☕" : i === 4 || i === 9 ? "🎟️" : i + 1}
                </span>
              ))}
            </div>
            <p className="text-center text-xs font-medium text-gray-600">
              📇 ☕ {totalStamps} {cardsDone > 0 && `· ${cardsDone}✔️`} · 🖼️⭐ {stamps.length} / {missions.length} · {t.nextCoupon}{" "}
              ☕×{STAMPS_PER_COUPON - (totalStamps % STAMPS_PER_COUPON)}
            </p>
            <div className="my-2">
              <StampRules />
            </div>
            <p className="text-center text-sm font-semibold">🎟️ {t.myCoupons}</p>
            {coupons.length === 0 ? (
              <p className="text-center text-xs font-medium text-gray-500">🔒 ☕×{STAMPS_PER_COUPON}</p>
            ) : (
              <ul className="my-2 max-h-28 space-y-1 overflow-y-auto">
                {coupons.map((c) => (
                  <li key={c.id} className={`rounded-lg border-2 border-dashed p-1.5 text-sm ${c.used ? "border-gray-200 opacity-50" : "border-amber-400 bg-amber-50"}`}>
                    {c.reward.emoji} <span className="font-semibold">{c.reward.ko}</span>
                    <span className="block text-xs font-medium text-gray-600">
                      {c.reward.names[lang]} · {c.used ? `✔️ ${t.couponUsed}` : `✅ ${t.couponReady}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-center text-xs font-medium text-gray-500">{t.couponNote}</p>
            <div className="text-center">
              <button type="button" onClick={() => setShowCard(false)} className="mt-3 rounded-full bg-amber-400 px-5 py-1.5 text-sm font-semibold text-white hover:bg-amber-500">
                닫기 · {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
