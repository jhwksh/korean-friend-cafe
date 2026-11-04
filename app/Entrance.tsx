"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useLanguage } from "./LanguageProvider";

// 이 브라우저에서 "로그인 없이 둘러보기"를 눌렀는지 기억하는 이름
const GUEST_KEY = "kfc-guest";

// 🏖️ 카페 입구. 처음에는 카페를 보여 주지 않고 부산 바닷가 테라스 사진과 가운데 로그인만 보인다.
// 로그인하거나 "로그인 없이 둘러보기"를 누르면 카페로 들어간다.
export default function Entrance({ children }: { children: React.ReactNode }) {
  const { enabled, ready, user, signIn } = useAuth();
  const { t } = useLanguage();
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    try {
      // 브라우저 저장소는 화면이 뜬 뒤에만 읽을 수 있어서 여기서 읽는다
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(GUEST_KEY) === "1") setGuest(true);
    } catch {}
  }, []);

  function enterAsGuest() {
    setGuest(true);
    try {
      localStorage.setItem(GUEST_KEY, "1");
    } catch {}
  }

  // 로그인 기능이 꺼져 있거나(키 없음), 로그인했거나, 손님으로 들어왔으면 카페를 보여 준다
  if (!enabled || user || guest) return <>{children}</>;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1f2a44] p-4">
      {/* 입구 사진: 부산 광안대교가 보이는 카페 테라스 (Unsplash 무료 사진, note thanun) */}
      <Image src="/entrance.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
      {/* 글자가 잘 읽히도록 사진 위아래를 살짝 어둡게 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* 로그인 상자: 뒤의 바다가 비쳐 보이는 반투명 유리창 */}
      <div className="relative w-full max-w-xs rounded-2xl border border-white/50 bg-white/30 p-5 text-center shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-md [&_.text-gray-500]:text-gray-800">
        <p className="text-xl font-extrabold text-[#3b2416]">☕ 한국어 친구 카페</p>
        <p className="text-xs tracking-widest text-gray-500">KOREAN FRIEND CAFE</p>
        <p className="mt-3 text-lg font-bold text-[#3b2416]">어서 오세요!</p>
        <p className="mb-3 text-xs text-gray-500">{t.welcome}</p>
        {ready ? (
          <>
            <button
              type="button"
              onClick={signIn}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
            >
              <span aria-hidden className="font-bold text-[#4285f4]">G</span>
              구글로 계속하기
              <span className="text-xs font-normal text-gray-500">· {t.loginGoogle}</span>
            </button>
            <p className="mt-2 text-[11px] leading-snug text-gray-500">{t.loginWhy}</p>
            <button
              type="button"
              onClick={enterAsGuest}
              className="mt-2 text-xs font-medium text-amber-800 underline underline-offset-2 hover:text-amber-600"
            >
              로그인 없이 둘러보기 · {t.enterGuest}
            </button>
          </>
        ) : (
          <p className="py-3 text-sm text-gray-400">⏳</p>
        )}
      </div>
    </main>
  );
}
