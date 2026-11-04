"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { menu } from "./menu";
import { rewards } from "./rewards";
import { supabase } from "./supabase";
import { words } from "./words";

// 공부 기록: 써서 맞힌 단어(found)와, 미션 문장을 말해서 받은 도장(stamps).
// 2D 카페와 360 카페를 모두 센다. 이 브라우저에 기억하고(localStorage),
// 구글로 로그인하면 Supabase 표(cafe_progress, 회원마다 한 줄)에도 저장해서 다른 컴퓨터에서도 이어진다.
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
// ☁️ Supabase 저장 상태 (로그인 줄에 보인다). off = 로그인 안 함
export type CloudState = "off" | "loading" | "saving" | "saved" | "error";
const TABLE = "cafe_progress";

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
  cloud: CloudState;
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
  cloud: "off",
});

function load(key: string): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(saved) ? saved.filter((k) => typeof k === "string") : [];
  } catch {
    return [];
  }
}

function loadNumber(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    const n = Number(raw);
    return raw !== null && Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

// 두 목록을 겹치지 않게 합친다 (이 컴퓨터에서 한 것 + 계정에 저장된 것)
function union(a: string[], b: unknown): string[] {
  const more = Array.isArray(b) ? b.filter((k): k is string => typeof k === "string") : [];
  return [...new Set([...a, ...more])];
}

function useSavedList(key: string): [string[], (item: string) => void, (all: string[]) => void] {
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
  // 목록을 통째로 바꾼다 (계정에서 불러올 때, 로그아웃할 때)
  function replace(all: string[]) {
    setList(all);
    try {
      localStorage.setItem(key, JSON.stringify(all));
    } catch {}
  }
  return [list, add, replace];
}

export function FoundProvider({ children }: { children: React.ReactNode }) {
  const [found, markFound, replaceFound] = useSavedList(FOUND_KEY);
  const [stamps, addStampToList, replaceStamps] = useSavedList(STAMP_KEY);
  const [chances, setChances] = useState(START_CHANCES);
  const [buyStamps, setBuyStamps] = useState(0);
  const [used, markUsed, replaceUsed] = useSavedList(USED_KEY);
  const [gain, setGain] = useState<StampGain | null>(null);
  const userId = useAuth().user?.id ?? null;
  const [cloud, setCloud] = useState<CloudState>("off");
  // 계정에서 다 불러온 뒤에만 저장한다 (불러오기 전에 빈 기록으로 덮어쓰지 않게)
  const syncedFor = useRef<string | null>(null);
  const prevUser = useRef<string | null>(null);

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

  function saveBuyStamps(n: number) {
    setBuyStamps(n);
    try {
      localStorage.setItem(BUY_KEY, String(n));
    } catch {}
  }

  // 🔐 로그인하면: 계정의 기록을 불러와 이 컴퓨터 기록과 합친다 → 합친 것을 계정에 저장.
  // 🚪 로그아웃하면: 이 컴퓨터의 기록을 비운다 (다음 사람이 내 도장을 이어 쓰지 않게). 계정에는 남아 있다.
  useEffect(() => {
    const before = prevUser.current;
    prevUser.current = userId;
    syncedFor.current = null;
    const db = supabase;
    if (!db || !userId) {
      if (before) {
        replaceFound([]);
        replaceStamps([]);
        replaceUsed([]);
        saveBuyStamps(0);
        saveChances(START_CHANCES);
      }
      return;
    }
    let cancelled = false;
    async function pull(db: NonNullable<typeof supabase>, id: string) {
      setCloud("loading");
      const { data, error } = await db
        .from(TABLE)
        .select("found, stamps, buy_stamps, coupons_used, chances")
        .eq("user_id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("cafe_progress 불러오기 실패", error.message);
        setCloud("error");
        return;
      }
      const merged = {
        found: union(load(FOUND_KEY), data?.found),
        stamps: union(load(STAMP_KEY), data?.stamps),
        coupons_used: union(load(USED_KEY), data?.coupons_used),
        buy_stamps: Math.max(loadNumber(BUY_KEY) ?? 0, data?.buy_stamps ?? 0),
        chances: data?.chances ?? loadNumber(CHANCE_KEY) ?? START_CHANCES,
      };
      replaceFound(merged.found);
      replaceStamps(merged.stamps);
      replaceUsed(merged.coupons_used);
      saveBuyStamps(merged.buy_stamps);
      saveChances(merged.chances);
      syncedFor.current = id;
      push(db, id, merged);
    }
    pull(db, userId);
    return () => {
      cancelled = true;
    };
    // 로그인한 사람이 바뀔 때만 다시 불러온다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 기록이 바뀌면 0.8초 뒤에 계정에 저장한다 (연달아 바뀌면 마지막 것 한 번만)
  useEffect(() => {
    const db = supabase;
    if (!db || !userId || syncedFor.current !== userId) return;
    const timer = setTimeout(() => {
      push(db, userId, { found, stamps, coupons_used: used, buy_stamps: buyStamps, chances });
    }, 800);
    return () => clearTimeout(timer);
  }, [found, stamps, used, buyStamps, chances, userId]);

  async function push(
    db: NonNullable<typeof supabase>,
    id: string,
    row: { found: string[]; stamps: string[]; coupons_used: string[]; buy_stamps: number; chances: number },
  ) {
    setCloud("saving");
    // upsert = 내 줄이 없으면 새로 만들고, 있으면 고친다
    const { error } = await db.from(TABLE).upsert({ user_id: id, ...row, updated_at: new Date().toISOString() });
    if (syncedFor.current !== id) return; // 그 사이 로그아웃함
    if (error) console.error("cafe_progress 저장 실패", error.message);
    setCloud(error ? "error" : "saved");
  }

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
      value={{ found, markFound, stamps, addStamp, chances, spendChance, totalStamps, addBuyStamps, coupons, spendCoupons, gain, cloud: userId ? cloud : "off" }}
    >
      {children}
    </FoundContext.Provider>
  );
}

export function useFound() {
  return useContext(FoundContext);
}
