"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLanguage } from "./LanguageProvider";

// 카페 안에서 마우스(손가락)를 졸졸 따라다니는 한국어 친구.
// 캐릭터 그림(public/friend.png)은 사용자가 Gemini로 만든 그림이다 (실제 사람 아님).
export default function CafeFriend() {
  const friendRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const friend = friendRef.current;
    const area = friend?.parentElement;
    if (!friend || !area) return;

    // 처음에는 계산대 왼쪽 바닥에 서 있는다
    const pos = { x: 10, y: area.clientHeight - friend.offsetHeight - 10 };
    const target = { ...pos };

    const onMove = (e: PointerEvent) => {
      const rect = area.getBoundingClientRect();
      // 카페 그림은 화면 크기에 맞춰 줄거나 커져 있으니(CafeStage), 마우스 위치를 원래 크기로 되돌려 계산한다
      const s = rect.width / area.offsetWidth;
      const x = (e.clientX - rect.left) / s;
      const y = (e.clientY - rect.top) / s;
      // 마우스 바로 위가 아니라 살짝 옆에 서도록 띄우고, 카페 밖으로 나가지 않게 막는다
      target.x = Math.min(Math.max(x + 20, 0), area.offsetWidth - friend.offsetWidth);
      target.y = Math.min(Math.max(y - friend.offsetHeight / 2, 0), area.offsetHeight - friend.offsetHeight);
    };

    let frame = 0;
    const step = () => {
      // 한 번에 가지 않고 조금씩 다가가서 '쫓아오는' 느낌을 준다
      pos.x += (target.x - pos.x) * 0.06;
      pos.y += (target.y - pos.y) * 0.06;
      friend.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      frame = requestAnimationFrame(step);
    };

    area.addEventListener("pointermove", onMove);
    frame = requestAnimationFrame(step);
    return () => {
      area.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={friendRef} className="pointer-events-none absolute left-0 top-0 z-40">
      <div className="flex flex-col items-center animate-[bob_3s_ease-in-out_infinite]">
        <div className="mb-2 whitespace-nowrap rounded-2xl bg-white px-3 py-1 text-sm text-gray-800 shadow-lg">
          같이 주문해 볼까? ☕
          <br />
          <span className="text-xs text-gray-500">{t.friendBubble}</span>
        </div>
        <Image
          src="/friend.png"
          alt="한국어 친구"
          width={122}
          height={250}
          className="h-[250px] w-auto drop-shadow-[0_10px_12px_rgba(0,0,0,0.3)]"
        />
      </div>
      <div className="mx-auto -mt-2 h-3 w-24 rounded-full bg-black/25 blur-sm" />
    </div>
  );
}
