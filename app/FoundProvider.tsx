"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { menu } from "./menu";
import { rewards } from "./rewards";
import { words } from "./words";

// 공부 기록: 써서 맞힌 단어(found)와, 미션 문장을 말해서 받은 도장(stamps).
// 2D 카페와 360 카페를 모두 센다. 이 브라우저에만 기억한다(localStorage).
const FOUND_KEY = "kfc-found";
const STAMP_KEY = "kfc-stamps";
const CHANCE_KEY = "kfc-chances";
const BUY_KEY = "kfc-buy-stamps"; // 계산할 때 "적립해 주세요"로 받은 도장 수 (음료 1잔 = 1개)
const USED_KEY = "kfc-coupons-used"; // 이미 쓴 쿠폰
// 📇 적립 규칙 (쉽게 하나로):
// ☕ 도장을 받는 때: ① 🖼️⭐ 미션(숨은 그림 찾기 등) 성공 = 1개 ② 💳 계산할 때 "적립해 주세요" = 음료 1잔에 1개
// 🎟️ 도장 5개마다 쿠폰 1장 (5개 사이즈 업, 10개 아이스 아메리카노 무료) → 계산할 때 "쿠폰 쓸게요"
export const STAMPS_PER_COUPON = 5;
export type Coupon = { id: string; reward: (typeof rewards)[number]; used: boolean };
// 방금 받은 도장: 화면에 "+1 도장!"을 잠깐 띄운다 (언제 받는지 눈으로 알게)
export type StampGain = { at: number; n: number; why: "mission" | "buy" };
// 친구(AI)에게 직접 말을 걸 수 있는 횟수. 친구가 답할 때마다 무료 사용량(토큰)이 줄어서,
// 정말 모를 때만 쓰게 한다. 미션을 하나 깨면 하나 더 받는다. 메뉴 버튼(☕ 아메리카노 등)은 공짜다.
export const START_CHANCES = 5;
export const TOTAL_WORDS = Object.keys(words).length + menu.length;

type Ctx = {
  found: string[];
  markFound: (key: string) => void;
  stamps: string[];
  addStamp: (id: string) => void;
  chances: number;
  spendChance: () => boolean;
  totalStamps: number;
  addBuyStamps: (n: number) => void;
  coupons: Coupon[];
  spendCoupons: (ids: string[]) => void;
  gain: StampGain | null;
};

const FoundContext = createContext<Ctx>({
  found: [],
  markFound: () => {},
  stamps: [],
  addStamp: () => {},
  chances: START_CHANCES,
  spendChance: () => true,
  totalStamps: 0,
  addBuyStamps: () => {},
  coupons: [],
  spendCoupons: () => {},
  gain: null,
});

function load(key: string): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(saved) ? saved.filter((k) => typeof k === "string") : [];
  } catch {
    return [];
  }
}

function useSavedList(key: string): [string[], (item: string) => void] {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    // 브라우저 저장소는 화면이 뜬 뒤에만 읽을 수 있어서(서버엔 없음) 여기서 불러오는 것이 맞다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setList(load(key));
  }, [key]);
  function add(item: string) {
    setList((prev) => {
      if (prev.includes(item)) return prev;
      const next = [...prev, item];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  }
  return [list, add];
}

export function FoundProvider({ children }: { children: React.ReactNode }) {
  const [found, markFound] = useSavedList(FOUND_KEY);
  const [stamps, addStampToList] = useSavedList(STAMP_KEY);
  const [chances, setChances] = useState(START_CHANCES);
  const [buyStamps, setBuyStamps] = useState(0);
  const [used, markUsed] = useSavedList(USED_KEY);
  const [gain, setGain] = useState<StampGain | null>(null);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(CHANCE_KEY));
      // 브라우저 저장소는 화면이 뜬 뒤에만 읽을 수 있어서(서버엔 없음) 여기서 불러오는 것이 맞다
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(CHANCE_KEY) !== null && Number.isFinite(saved)) setChances(saved);
      const buy = Number(localStorage.getItem(BUY_KEY));
      if (Number.isFinite(buy) && buy > 0) setBuyStamps(buy);
    } catch {}
  }, []);

  // 💳 계산할 때 적립: 음료 n잔 = 도장 n개
  function addBuyStamps(n: number) {
    if (n <= 0) return;
    setBuyStamps((prev) => {
      const next = prev + n;
      try {
        localStorage.setItem(BUY_KEY, String(next));
      } catch {}
      return next;
    });
    setGain({ at: Date.now(), n, why: "buy" });
  }

  function spendCoupons(ids: string[]) {
    ids.forEach(markUsed);
  }

  function saveChances(n: number) {
    setChances(n);
    try {
      localStorage.setItem(CHANCE_KEY, String(n));
    } catch {}
  }

  // 새 도장을 받으면 찬스도 하나 더 준다
  function addStamp(id: string) {
    if (!stamps.includes(id)) {
      saveChances(chances + 1);
      setGain({ at: Date.now(), n: 1, why: "mission" });
    }
    addStampToList(id);
  }

  // 찬스를 하나 쓴다. 남은 찬스가 없으면 false
  function spendChance() {
    if (chances <= 0) return false;
    saveChances(chances - 1);
    return true;
  }

  // 도장 5개마다 쿠폰 1장: 1번째(5개) 사이즈 업, 2번째(10개) 아이스 아메리카노, 3번째(15개) 사이즈 업 …
  const totalStamps = stamps.length + buyStamps;
  const coupons: Coupon[] = Array.from({ length: Math.floor(totalStamps / STAMPS_PER_COUPON) }, (_, i) => ({
    id: `c${i + 1}`,
    reward: rewards[i % 2],
    used: used.includes(`c${i + 1}`),
  }));

  return (
    <FoundContext.Provider
      value={{ found, markFound, stamps, addStamp, chances, spendChance, totalStamps, addBuyStamps, coupons, spendCoupons, gain }}
    >
      {children}
    </FoundContext.Provider>
  );
}

export function useFound() {
  return useContext(FoundContext);
}
