"use client";

import { useLanguage } from "./LanguageProvider";

// 📱 휴대폰을 세로로 들고 있을 때만 보이는 안내: "가로로 돌리면 카페가 크게 보여요"
// (portrait: 세로 화면, md 미만: 휴대폰 크기. 가로로 돌리거나 컴퓨터에서는 숨는다)
export default function RotateHint() {
  const { t } = useLanguage();
  return (
    <div className="hidden px-6 py-10 text-center text-amber-50 portrait:block md:portrait:hidden">
      <p className="text-5xl">📱↻</p>
      <p className="mt-3 text-lg font-bold">휴대폰을 가로로 돌리면 카페가 크게 보여요</p>
      <p className="mt-1 text-sm text-amber-200">{t.rotateHint}</p>
    </div>
  );
}
