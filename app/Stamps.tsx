"use client";

import { useEffect, useState } from "react";
import { useFound } from "./FoundProvider";
import { useLanguage } from "./LanguageProvider";
import { useOrders } from "./OrderProvider";

// 📇 적립 규칙을 쉽게: 긴 설명 대신 그림 4줄 + 도장을 받는 순간 "+1 도장!"을 크게 보여 준다.

// 그림 4줄 규칙 카드 (스탬프 카드, 적립 묻는 화면에서 같이 쓴다)
export function StampRules({ dark = false }: { dark?: boolean }) {
  const { t } = useLanguage();
  const box = dark ? "bg-white/10 text-white" : "bg-amber-50 text-[#5c3a1c]";
  const sub = dark ? "text-gray-200" : "text-gray-600";
  return (
    <div className={`rounded-xl p-2 text-left text-sm ${box}`}>
      <p className="mb-1 text-center font-bold">📇 적립 규칙 · {t.ruleTitle}</p>
      <ul className="space-y-1">
        <li>
          <b>☕ +1</b> 🖼️⭐ 미션 성공 <span className={`block text-xs font-medium ${sub}`}>{t.ruleMission}</span>
        </li>
        <li>
          <b>☕ +1</b> 💳 계산할 때 &quot;적립해 주세요&quot; <span className={`block text-xs font-medium ${sub}`}>{t.ruleDrink}</span>
        </li>
        <li>
          <b>🎟️</b> ☕×5 사이즈 업 · ☕×10 아이스 아메리카노 무료 <span className={`block text-xs font-medium ${sub}`}>{t.ruleCoupons}</span>
        </li>
        <li>
          <b>🎟️</b> 계산할 때 &quot;쿠폰 쓸게요&quot; <span className={`block text-xs font-medium ${sub}`}>{t.ruleUse}</span>
        </li>
      </ul>
      <p className={`mt-1 text-center text-xs font-medium ${sub}`}>🇰🇷 {t.ruleCulture}</p>
    </div>
  );
}

// 🎟️ 계산할 때 쓸 수 있는 쿠폰 (점원, 키오스크, 테이블 패드에서 같이 쓴다)
export function CouponPicker({ dark = false }: { dark?: boolean }) {
  const { t } = useLanguage();
  const { coupons } = useFound();
  const { applied, applyCoupon } = useOrders();
  const [noDrink, setNoDrink] = useState(false);
  const ready = coupons.filter((c) => !c.used);
  if (ready.length === 0) return null;
  return (
    <div className={`mt-3 rounded-xl border-2 border-dashed border-amber-400 p-2 ${dark ? "bg-white/10 text-white" : "bg-amber-50 text-[#5c3a1c]"}`}>
      <p className="text-sm font-bold">
        🎟️ 쿠폰 쓸게요 <span className="text-xs font-medium italic">KR: kupon sseulgeyo</span>{" "}
        <span className="text-xs font-medium">· {t.useCoupon}</span>
      </p>
      <div className="mt-1 flex flex-wrap gap-2">
        {ready.map((c) => {
          const on = applied.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              disabled={on}
              onClick={() => setNoDrink(!applyCoupon(c))}
              className={`rounded-lg px-2 py-1 text-left text-xs font-bold ${on ? "bg-green-500 text-white" : "bg-white text-[#5c3a1c] hover:bg-amber-100"}`}
            >
              {c.reward.emoji} {c.reward.ko} {on ? "✅" : ""}
            </button>
          );
        })}
      </div>
      {noDrink && <p className="mt-1 text-xs font-medium text-rose-500">{t.couponNeedsDrink}</p>}
    </div>
  );
}

// ☕ 도장을 받는 순간 크게 "+1 도장!"과 이유를 2.5초 보여 준다
export function StampToast() {
  const { t } = useLanguage();
  const { gain, totalStamps } = useFound();
  const [hiddenAt, setHiddenAt] = useState(0);
  useEffect(() => {
    if (!gain) return;
    const timer = setTimeout(() => setHiddenAt(gain.at), 2500);
    return () => clearTimeout(timer);
  }, [gain]);
  if (!gain || gain.at === hiddenAt) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-[90px] z-[60] -translate-x-1/2 animate-[stamp-pop_0.5s_ease-out] rounded-2xl border-4 border-rose-400 bg-white px-5 py-2 text-center text-[#5c3a1c] shadow-2xl">
      <p className="text-2xl font-extrabold">☕ +{gain.n} 도장!</p>
      <p className="text-sm font-bold">{gain.why === "mission" ? "🖼️⭐ 미션 성공" : `💳 음료 ${gain.n}잔 적립`}</p>
      <p className="text-xs font-medium text-gray-600">
        {gain.why === "mission" ? t.gainMission : t.gainBuy} · 📇 {totalStamps}
      </p>
    </div>
  );
}
