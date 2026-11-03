"use client";

import { useEffect, useRef } from "react";

// 카페 안에서 마우스(손가락)를 졸졸 따라다니는 한국어 친구
export default function CafeFriend() {
  const friendRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const friend = friendRef.current;
    const area = friend?.parentElement;
    if (!friend || !area) return;

    // 처음에는 계산대 왼쪽에 서 있는다
    const pos = { x: 40, y: area.clientHeight - 280 };
    const target = { ...pos };

    const onMove = (e: PointerEvent) => {
      const rect = area.getBoundingClientRect();
      // 마우스 바로 위가 아니라 살짝 옆에 서도록 띄우고, 카페 밖으로 나가지 않게 막는다
      target.x = Math.min(Math.max(e.clientX - rect.left + 30, 0), rect.width - 180);
      target.y = Math.min(Math.max(e.clientY - rect.top - 60, 0), rect.height - 140);
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
    <div ref={friendRef} className="pointer-events-none absolute left-0 top-0 z-20">
      <div className="flex flex-col items-center animate-[bob_2s_ease-in-out_infinite]">
        <div className="mb-2 whitespace-nowrap rounded-2xl bg-white px-3 py-1 text-sm text-gray-800 shadow-lg">
          같이 주문해 볼까? ☕
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-amber-400 text-3xl shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
          🙂
        </div>
      </div>
      <div className="mx-auto mt-1 h-2 w-10 rounded-full bg-black/20 blur-sm" />
    </div>
  );
}
