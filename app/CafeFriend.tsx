"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";

// 카페 바닥에 서서, 마우스(손가락)를 따라 좌우로 걸어 다니는 한국어 친구.
// 캐릭터 그림(public/friend.png)은 사용자가 Gemini로 만든 그림이다 (실제 사람 아님).
export default function CafeFriend() {
  const friendRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const facingRef = useRef<HTMLButtonElement>(null);
  // 누를 때마다 숫자가 바뀌어서, 한 바퀴 도는 움직임을 처음부터 다시 보여 준다
  const [spinCount, setSpinCount] = useState(0);
  const { t } = useLanguage();
  // 머리 위 말풍선: 처음엔 숨겨 두고, 친구를 누르면 보였다가 다시 누르면 사라진다
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const friend = friendRef.current;
    const body = bodyRef.current;
    const facing = facingRef.current;
    const area = friend?.parentElement;
    if (!friend || !body || !facing || !area) return;

    // 늘 바닥에 서 있다 (위아래로는 움직이지 않는다). 처음에는 계산대 왼쪽에 있다
    const floorY = area.clientHeight - friend.offsetHeight - 6;
    let x = 10;
    let targetX = x;
    // 마우스가 한동안 가만히 있으면 혼자 이리저리 걸어 다닌다
    let lastMouse = 0;
    let nextWander = 0;

    const onMove = (e: PointerEvent) => {
      const rect = area.getBoundingClientRect();
      // 카페 그림은 화면 크기에 맞춰 줄거나 커져 있으니(CafeStage), 마우스 위치를 원래 크기로 되돌려 계산한다
      const s = rect.width / area.offsetWidth;
      const mouseX = (e.clientX - rect.left) / s;
      // 마우스 바로 옆으로 걸어가고, 카페 밖으로 나가지 않게 막는다
      targetX = Math.min(Math.max(mouseX + 20, 0), area.offsetWidth - friend.offsetWidth);
      lastMouse = performance.now();
    };

    let frame = 0;
    const step = (time: number) => {
      if (time - lastMouse > 4000 && time > nextWander) {
        targetX = Math.random() * (area.offsetWidth - friend.offsetWidth);
        nextWander = time + 4000 + Math.random() * 4000;
      }
      // 한 번에 가지 않고 조금씩 다가가서 '쫓아오는' 느낌을 준다
      const dx = (targetX - x) * 0.05;
      x += dx;
      friend.style.transform = `translate(${x}px, ${floorY}px)`;
      // 걷는 중에만 발걸음처럼 살짝 위아래로 흔들린다
      const walking = Math.abs(dx) > 0.3;
      body.style.transform = walking ? `translateY(${-Math.abs(Math.sin(time / 110)) * 4}px)` : "";
      // 가는 방향이 바뀌면 그쪽으로 몸을 돌린다 (그림을 세로축으로 돌려서 입체로 도는 것처럼 보인다)
      if (dx < -0.3) facing.style.transform = "rotateY(180deg)";
      else if (dx > 0.3) facing.style.transform = "rotateY(0deg)";
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
      <div ref={bodyRef} className="flex flex-col items-center [perspective:700px]">
        <div
          className={`mb-2 whitespace-nowrap rounded-2xl bg-white px-3 py-1 text-sm text-gray-800 shadow-lg transition-opacity ${showBubble ? "opacity-100" : "invisible opacity-0"}`}
        >
          같이 주문해 볼까? ☕
          <br />
          <span className="text-xs text-gray-500">{t.friendBubble}</span>
        </div>
        <button
          ref={facingRef}
          type="button"
          onClick={() => {
            setShowBubble((v) => !v);
            setSpinCount((n) => n + 1);
          }}
          aria-pressed={showBubble}
          aria-label="한국어 친구"
          className="pointer-events-auto cursor-pointer transition-transform duration-500 ease-in-out [transform-style:preserve-3d]"
        >
        {/* 누르면 한 바퀴 빙글 돈다 */}
        <span key={spinCount} className={`block ${spinCount > 0 ? "animate-[friend-spin_0.9s_ease-in-out]" : ""}`}>
        <Image
          src="/friend.png"
          alt="한국어 친구"
          width={122}
          height={250}
          className="h-[250px] w-auto drop-shadow-[0_10px_12px_rgba(0,0,0,0.3)]"
        />
        </span>
        </button>
      </div>
      <div className="mx-auto -mt-2 h-3 w-24 rounded-full bg-black/25 blur-sm" />
    </div>
  );
}
