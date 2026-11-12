"use client";

import { useEffect, useRef, useState } from "react";

// 카페 그림을 늘 같은 크기(가로 800, 세로 700)로 그려 두고,
// 들어갈 자리의 너비에 맞춰 통째로 키우거나 줄인다.
// 그래서 큰 화면에선 크게, 휴대폰에선 작게, 모든 물건이 같은 자리에 다 보인다.
export const STAGE_WIDTH = 800;
export const STAGE_HEIGHT = 700;

export default function CafeStage({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  // 너비를 재기 전(null)에는 그림을 숨겨서, 처음에 크게 보였다가 줄어드는 깜빡임을 막는다
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / STAGE_WIDTH));
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  return (
    // 큰 화면에서 너비에만 맞추면 세로가 화면보다 길어져 위쪽 버튼이 밖으로 밀려난다.
    // 그래서 화면 높이에도 맞춘다: 너비는 (화면 높이 × 8/7)을 넘지 않고, 가운데에 둔다
    <div
      ref={outerRef}
      className="relative mx-auto aspect-[8/7] w-full overflow-hidden"
      style={{ maxWidth: "calc(100dvh * 8 / 7)" }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `scale(${scale ?? 1})`,
          visibility: scale === null ? "hidden" : "visible",
        }}
      >
        {children}
      </div>
    </div>
  );
}
