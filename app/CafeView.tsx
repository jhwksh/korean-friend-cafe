"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import Panorama from "./Panorama";

// 카페 화면을 두 가지로 볼 수 있다: 지금의 2D 카페, 또는 360° 둘러보기.
// 360 사진: Poly Haven "Comfy Cafe" (CC0, 누구나 무료로 사용 가능)
export default function CafeView({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [look360, setLook360] = useState(false);

  return (
    <>
      {look360 ? (
        <div className="absolute inset-0 z-30 select-none bg-black">
          <Panorama src="/cafe-360.jpg" />
          <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            👆 {t.dragHint}
          </p>
        </div>
      ) : (
        children
      )}

      <button
        type="button"
        onClick={() => setLook360((v) => !v)}
        className="absolute left-3 top-3 z-40 rounded-full bg-white/90 px-3 py-1 text-left text-sm font-semibold text-[#5c3a1c] shadow-lg hover:bg-white"
      >
        {look360 ? "↩ 카페로 돌아가기" : "🌀 둘러보기"}
        <span className="block text-[10px] font-normal text-gray-500">{look360 ? t.back2d : t.look360}</span>
      </button>
    </>
  );
}
