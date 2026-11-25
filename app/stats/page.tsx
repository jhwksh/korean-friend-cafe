"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

// 📊 카페 기록 현황: 이름 없는 합계 숫자만 보여 준다 (supabase/stats.sql 의 cafe_stats 함수).
// 10초마다 새로 불러온다. 방문자·세션 번호 같은 개별 줄은 가져오지 않는다.
type Stats = {
  total: number;
  visitors: number;
  sessions: number;
  last: string | null;
  events: Record<string, number>;
  countries: Record<string, number>;
  days: Record<string, number>;
};

const LABEL: Record<string, string> = {
  entrance: "입장 (로그인 화면)",
  visit: "카페에 들어옴",
  stay: "머문 시간 기록",
  cart: "메뉴 담기",
  pay_start: "결제 시작",
  paid: "결제 완료",
  pickup: "쟁반 받기",
  upstairs: "위층",
  sit: "자리에 앉기",
};

function Bars({ data, label }: { data: Record<string, number>; label?: (k: string) => string }) {
  const rows = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <ul className="mt-3 space-y-2">
      {rows.map(([k, n]) => (
        <li key={k} className="grid grid-cols-[9rem_1fr_4rem] items-center gap-3 text-sm">
          <span className="truncate text-stone-700">{label ? label(k) : k}</span>
          <span className="h-4 rounded bg-stone-200">
            <span className="block h-4 rounded bg-amber-500" style={{ width: `${(n / max) * 100}%` }} />
          </span>
          <span className="text-right font-semibold tabular-nums">{n.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  const [why, setWhy] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!supabase) {
        if (alive) {
          setWhy("Supabase 연결값이 이 배포에 없어요");
          setFailed(true);
        }
        return;
      }
      const { data, error } = await supabase.rpc("cafe_stats");
      if (!alive) return;
      if (error || !data) {
        setWhy(error ? error.message : "빈 응답");
        setFailed(true);
        return;
      }
      setFailed(false);
      setStats(data as Stats);
    }
    load();
    const t = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (failed && !stats) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-stone-800">
        <h1 className="text-2xl font-bold">📊 카페 기록 현황</h1>
        <p className="mt-4 text-stone-600">숫자를 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</p>
        <p className="mt-2 text-xs text-stone-400">이유: {why}</p>
      </main>
    );
  }
  if (!stats) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-stone-800">
        <h1 className="text-2xl font-bold">📊 카페 기록 현황</h1>
        <p className="mt-4 text-stone-600">불러오는 중…</p>
      </main>
    );
  }

  const stayless = Object.fromEntries(Object.entries(stats.events).filter(([k]) => k !== "stay"));
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-stone-800">
      <h1 className="text-2xl font-bold">📊 카페 기록 현황</h1>
      <p className="mt-1 text-sm text-stone-500">
        이름 없는 합계 숫자만 보여요 · 10초마다 새로 고침
        {stats.last ? ` · 마지막 기록 ${new Date(stats.last).toLocaleString("ko-KR")}` : ""}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[
          ["전체 기록", stats.total],
          ["방문자", stats.visitors],
          ["방문 횟수", stats.sessions],
        ].map(([k, n]) => (
          <div key={k as string} className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="text-xs text-stone-500">{k}</div>
            <div className="mt-1 text-3xl font-bold tabular-nums">{(n as number).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold">행동별 기록 수 (머문 시간 기록 제외)</h2>
        <Bars data={stayless} label={(k) => LABEL[k] ?? k} />
        <p className="mt-2 text-xs text-stone-500">머문 시간 기록(stay)은 {(stats.events.stay ?? 0).toLocaleString()}건이라 따로 뺐어요.</p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">나라별</h2>
        <Bars data={stats.countries} />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">날짜별</h2>
        <Bars data={Object.fromEntries(Object.entries(stats.days).sort())} />
      </section>
    </main>
  );
}
