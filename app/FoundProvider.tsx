"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { menu } from "./menu";
import { words } from "./words";

// 공부 기록: 써서 맞힌 단어(found)와, 미션 문장을 말해서 받은 도장(stamps).
// 2D 카페와 360 카페를 모두 센다. 이 브라우저에만 기억한다(localStorage).
const FOUND_KEY = "kfc-found";
const STAMP_KEY = "kfc-stamps";
const CHANCE_KEY = "kfc-chances";
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
};

const FoundContext = createContext<Ctx>({
  found: [],
  markFound: () => {},
  stamps: [],
  addStamp: () => {},
  chances: START_CHANCES,
  spendChance: () => true,
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

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(CHANCE_KEY));
      // 브라우저 저장소는 화면이 뜬 뒤에만 읽을 수 있어서(서버엔 없음) 여기서 불러오는 것이 맞다
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(CHANCE_KEY) !== null && Number.isFinite(saved)) setChances(saved);
    } catch {}
  }, []);

  function saveChances(n: number) {
    setChances(n);
    try {
      localStorage.setItem(CHANCE_KEY, String(n));
    } catch {}
  }

  // 새 도장을 받으면 찬스도 하나 더 준다
  function addStamp(id: string) {
    if (!stamps.includes(id)) saveChances(chances + 1);
    addStampToList(id);
  }

  // 찬스를 하나 쓴다. 남은 찬스가 없으면 false
  function spendChance() {
    if (chances <= 0) return false;
    saveChances(chances - 1);
    return true;
  }

  return (
    <FoundContext.Provider value={{ found, markFound, stamps, addStamp, chances, spendChance }}>{children}</FoundContext.Provider>
  );
}

export function useFound() {
  return useContext(FoundContext);
}
