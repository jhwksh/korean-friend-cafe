"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import MissionButton from "./MissionButton";
import { speak } from "./sound";
import WordTag from "./WordTag";

// 점원(바리스타): 앞 계산대 뒤에 서서 손을 흔든다. 키는 친구와 비슷하게 맞췄다.
// 아랫몸은 page.tsx에서 한 번 더 겹쳐 그린 계산대에 가려진다 (지금은 모습만, 대화는 나중 단계).
// 그림(public/barista.png)은 사용자가 Gemini로 만든 그림이다 (실제 사람 아님).
// 계산대 뒤를 천천히 왔다 갔다 하며, 방향이 바뀌면 몸을 돌린다.
// 누르면 한 바퀴 빙글 돌고, 머리 위 "어서 오세요!" 말풍선이 보이며 소리 내어 말한다. 다시 누르면 말풍선이 사라진다.
const RANGE = { left: -70, right: 40 }; // 처음 자리에서 왼쪽·오른쪽으로 움직일 수 있는 거리

export default function Barista() {
  const { t } = useLanguage();
  const [showBubble, setShowBubble] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const facingRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const body = bodyRef.current;
    const facing = facingRef.current;
    if (!wrap || !body || !facing) return;

    let x = 0;
    let targetX = 0;
    let nextMove = 2000;
    let frame = 0;
    const step = (time: number) => {
      // 몇 초마다 계산대 뒤 다른 자리로 걸어간다
      if (time > nextMove) {
        targetX = RANGE.left + Math.random() * (RANGE.right - RANGE.left);
        nextMove = time + 3500 + Math.random() * 3500;
      }
      const dx = Math.max(Math.min(targetX - x, 0.6), -0.6);
      x += dx;
      wrap.style.transform = `translateX(${x}px)`;
      const walking = Math.abs(dx) > 0.2;
      body.style.transform = walking ? `translateY(${-Math.abs(Math.sin(time / 120)) * 3}px)` : "";
      if (dx < -0.2) facing.style.transform = "rotateY(180deg)";
      else if (dx > 0.2) facing.style.transform = "rotateY(0deg)";
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={wrapRef} className="absolute left-[616px] top-[340px] z-20 flex flex-col items-center">
      <div
        className={`mb-1 whitespace-nowrap rounded-2xl bg-white px-3 py-1 text-center text-sm text-gray-800 shadow-lg transition-opacity ${showBubble ? "opacity-100" : "invisible opacity-0"}`}
      >
        <span className="font-semibold">어서 오세요! 😊</span>
        <br />
        <span className="text-xs text-gray-500">{t.welcome}</span>
      </div>
      <div ref={bodyRef} className="[perspective:700px]">
        <button
          ref={facingRef}
          type="button"
          onClick={() => {
            // 말풍선이 나타날 때 점원이 "어서 오세요!"라고 소리 내어 말한다
            if (!showBubble) speak("어서 오세요!");
            setShowBubble((v) => !v);
            setSpinCount((n) => n + 1);
          }}
          aria-pressed={showBubble}
          aria-label="바리스타"
          className="cursor-pointer transition-transform duration-500 ease-in-out [transform-style:preserve-3d]"
        >
          <span key={spinCount} className={`block ${spinCount > 0 ? "animate-[friend-spin_0.9s_ease-in-out]" : ""}`}>
            <Image src="/barista.png" alt="" width={145} height={270} className="h-[270px] w-auto drop-shadow-[0_8px_10px_rgba(0,0,0,0.25)]" />
          </span>
        </button>
      </div>
      <WordTag word="staff" className="-left-10 bottom-10" />
      {/* ⭐ 미션 1: 바리스타에게 "안녕하세요!" */}
      <MissionButton id="hello" className="-left-8 top-16" />
    </div>
  );
}
