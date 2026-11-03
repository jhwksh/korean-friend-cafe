"use client";

import { speak } from "./sound";

// 🔊 누르면 한국어를 소리 내어 읽어 준다 (브라우저 기능이라 AI 찬스를 쓰지 않는다)
export default function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation(); // 카드가 닫히거나 화면이 돌아가지 않게
        speak(text);
      }}
      aria-label={`${text} 듣기`}
      className={`inline-grid h-5 w-5 place-items-center rounded-full bg-amber-100 align-middle text-[11px] hover:bg-amber-200 ${className}`}
    >
      🔊
    </button>
  );
}
