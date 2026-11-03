"use client";

import { useEffect, useState } from "react";
import { TOTAL_WORDS, useFound } from "./FoundProvider";
import { useLanguage } from "./LanguageProvider";
import { missions } from "./missions";
import { rewards } from "./rewards";
import { words } from "./words";

// 스탬프 카드 점수판 + 상품 쿠폰.
// 한국 카페의 "도장 10개 모으면 음료 1잔 무료" 스탬프 카드처럼,
// 카페 곳곳의 미션 자리(⭐)를 찾아 한국어 문장을 말하면 도장을 하나 찍는다.
// 단어 버튼(동그라미)은 연습용이라 따로 센다.
const SEEN_KEY = "kfc-reward-seen"; // 이미 창을 보여 준 상품 (새로고침해도 다시 안 뜨게)

export default function FoundScore() {
  const { lang, t } = useLanguage();
  const { found, stamps } = useFound();
  const count = stamps.length;
  const earned = rewards.filter((r) => count >= r.goal);
  // 지금 해야 할 미션 (미션은 하나씩 열린다)
  const current = missions.find((m) => !stamps.includes(m.id));

  const [seen, setSeen] = useState<number[] | null>(null);
  const [showCard, setShowCard] = useState(false);

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

  // 새로 받은 상품 중 아직 창을 안 보여 준 것
  const fresh = seen ? earned.find((r) => !seen.includes(r.goal)) : undefined;

  function closeFresh() {
    if (!fresh || !seen) return;
    const next = [...seen, fresh.goal];
    setSeen(next);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    } catch {}
  }

  return (
    <>
      {/* 점수판 */}
      <button
        type="button"
        onClick={() => setShowCard(true)}
        className="absolute right-3 top-3 z-40 w-[170px] rounded-xl bg-white/90 px-3 py-1.5 text-left text-[#5c3a1c] shadow-lg hover:bg-white"
      >
        <span className="block text-sm font-semibold">📇 스탬프 {count} / {missions.length}</span>
        <span className="block text-[10px] text-gray-500">{t.found}</span>
        {current && (
          <span className="mt-1 block rounded-md bg-amber-50 px-1.5 py-1 text-[11px] leading-tight">
            📜 {t.nowMission}: {current.emoji} <b>{words[current.place].ko}</b>
            <span className="block text-[10px] text-gray-500">
              = {words[current.place].names[lang] ?? words[current.place].names.en}
              {current.in360 && ` · ${t.in360}`}
            </span>
          </span>
        )}
        <span className="mt-1 flex gap-0.5">
          {missions.map((m, i) => (
            <span key={m.id} className={`h-2 flex-1 rounded-full ${i < count ? "bg-rose-400" : "bg-amber-100"}`} />
          ))}
        </span>
        <span className="mt-1 block text-[10px] text-gray-600">
          📝 {found.length} / {TOTAL_WORDS} · {t.wordsPracticed}
        </span>
      </button>

      {/* 새 상품을 받았을 때 한 번 뜨는 쿠폰 창 */}
      {fresh && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-[320px] rounded-2xl bg-white p-5 text-center text-[#3b2a1a] shadow-2xl">
            <p className="text-4xl">🎉</p>
            <p className="mt-1 text-lg font-bold">축하해요! 도장 {fresh.goal}개를 모았어요!</p>
            <p className="text-xs text-gray-500">{t.congrats}</p>
            <div className="my-3 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-3">
              <p className="text-3xl">{fresh.emoji}</p>
              <p className="font-bold">{fresh.ko}</p>
              <p className="text-xs text-gray-500">{fresh.names[lang]}</p>
            </div>
            <p className="text-[10px] text-gray-400">{t.couponNote}</p>
            <button type="button" onClick={closeFresh} className="mt-3 rounded-full bg-amber-400 px-5 py-1.5 text-sm font-semibold text-white hover:bg-amber-500">
              닫기 · {t.close}
            </button>
          </div>
        </div>
      )}

      {/* 스탬프 카드 */}
      {showCard && !fresh && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-[360px] rounded-2xl bg-[#fffaf0] p-5 text-[#3b2a1a] shadow-2xl">
            <p className="text-center text-lg font-bold">📇 스탬프 카드 · {t.stampCard}</p>
            <p className="text-center text-[11px] text-gray-500">{t.found}</p>
            {/* 도장 10칸: 미션을 하면 ☕ 도장이 찍힌다. 아직 안 한 미션은 어디인지(그림)만 보여 준다 */}
            <div className="my-3 grid grid-cols-5 gap-2">
              {missions.map((m, i) => {
                const done = stamps.includes(m.id);
                return (
                  <div key={m.id} className="flex flex-col items-center">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-full border-2 text-xl ${
                        done ? "-rotate-12 border-rose-500 bg-rose-50" : "border-dashed border-amber-300 bg-white"
                      }`}
                    >
                      {done ? "☕" : m.emoji}
                    </span>
                    <span className="mt-0.5 text-center text-[9px] leading-tight text-gray-600">
                      {done ? m.ko : `${i + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm font-semibold">🎟️ {t.myCoupons}</p>
            <ul className="my-2 space-y-2">
              {rewards.map((r) => (
                <li
                  key={r.goal}
                  className={`rounded-lg border-2 border-dashed p-2 ${count >= r.goal ? "border-amber-400 bg-amber-50" : "border-gray-200 opacity-50"}`}
                >
                  <span className="text-xl">{r.emoji}</span> <span className="font-semibold">{r.ko}</span>
                  <span className="block text-[11px] text-gray-500">
                    {r.names[lang]} · {count >= r.goal ? "✅" : `🔒 ☕×${r.goal}`}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-center text-[10px] text-gray-400">{t.couponNote}</p>
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
