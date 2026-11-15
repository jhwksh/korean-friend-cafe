"use client";

import { useEffect, useRef, useState } from "react";
import { HudContext } from "./Hud";

// 카페 그림은 늘 같은 크기(가로 800, 세로 700)로 그려 두고, 통째로 키우거나 줄인다.
// 처음에는 화면을 빈 곳 없이 꽉 채운다(cover). 넘친 부분은 손가락·마우스로 밀어서 본다.
// + − 버튼(휴대폰은 두 손가락, 컴퓨터는 마우스 휠)으로 크기를 바꾼다. − 끝 = 그림 전체가 다 보이는 크기.
export const STAGE_WIDTH = 800;
export const STAGE_HEIGHT = 700;
const MAX_ZOOM = 3; // 꽉 채운 크기의 3배까지 확대
const STEP = 1.25; // + − 한 번에 바뀌는 만큼

type View = { level: number; cx: number; cy: number }; // level: 꽉 채운 크기의 몇 배, cx·cy: 화면 가운데에 오는 그림 위의 점

export default function CafeStage({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [hud, setHud] = useState<HTMLDivElement | null>(null);
  // 화면 크기를 재기 전(null)에는 그림을 숨겨서 깜빡임을 막는다
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [view, setView] = useState<View>({ level: 1, cx: STAGE_WIDTH / 2, cy: STAGE_HEIGHT / 2 });

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  const w = size?.w ?? STAGE_WIDTH;
  const h = size?.h ?? STAGE_HEIGHT;
  const cover = Math.max(w / STAGE_WIDTH, h / STAGE_HEIGHT);
  const fit = Math.min(w / STAGE_WIDTH, h / STAGE_HEIGHT);
  const minLevel = fit / cover;

  // 크기와 위치가 범위를 넘지 않게 맞춘다 (그림 밖 빈 곳이 보이지 않게, 그림이 작으면 가운데)
  function settle(v: View): View {
    const level = Math.min(MAX_ZOOM, Math.max(minLevel, v.level));
    const s = cover * level;
    const clampAxis = (c: number, screen: number, full: number) => {
      const half = screen / (2 * s);
      return full * s <= screen ? full / 2 : Math.min(full - half, Math.max(half, c));
    };
    return { level, cx: clampAxis(v.cx, w, STAGE_WIDTH), cy: clampAxis(v.cy, h, STAGE_HEIGHT) };
  }

  const shown = settle(view);
  const scale = cover * shown.level;
  const tx = w / 2 - shown.cx * scale;
  const ty = h / 2 - shown.cy * scale;

  // 화면 위 한 점(px, py)을 붙잡은 채로 크기를 바꾼다 (손가락·마우스가 있는 곳을 중심으로 확대)
  function zoomAt(nextLevel: number, px = w / 2, py = h / 2) {
    setView((prev) => {
      const cur = settle(prev);
      const s = cover * cur.level;
      const next = Math.min(MAX_ZOOM, Math.max(minLevel, nextLevel));
      const ns = cover * next;
      // 그 점 아래에 있던 그림 위치
      const sx = (px - (w / 2 - cur.cx * s)) / s;
      const sy = (py - (h / 2 - cur.cy * s)) / s;
      return settle({ level: next, cx: sx + (w / 2 - px) / ns, cy: sy + (h / 2 - py) / ns });
    });
  }

  // 👆 밀어서 보기 + 두 손가락 확대
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(0); // 이번에 누른 뒤 움직인 거리 (조금이라도 밀었으면 클릭으로 치지 않는다)
  const pinch = useRef<{ dist: number; level: number } | null>(null);

  function local(e: { clientX: number; clientY: number }) {
    const r = outerRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  // 화면에 고정된 버튼·창(HUD) 위에서 일어난 일은 무시한다
  const onHud = (e: React.SyntheticEvent) => !!hud && hud.contains(e.target as Node);

  function onPointerDown(e: React.PointerEvent) {
    if (onHud(e)) return;
    pointers.current.set(e.pointerId, local(e));
    if (pointers.current.size === 1) moved.current = 0;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, level: shown.level };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      moved.current += 10;
      zoomAt(pinch.current.level * (dist / pinch.current.dist), (a.x + b.x) / 2, (a.y + b.y) / 2);
      return;
    }
    const dx = p.x - prev.x;
    const dy = p.y - prev.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    if (moved.current < 6) return; // 살짝 떨린 것은 그냥 누른 것으로 본다
    if (!outerRef.current!.hasPointerCapture(e.pointerId)) outerRef.current!.setPointerCapture(e.pointerId);
    setView((v) => {
      const cur = settle(v);
      return settle({ ...cur, cx: cur.cx - dx / scale, cy: cur.cy - dy / scale });
    });
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }

  // 밀고 난 뒤 손을 떼는 순간의 클릭은 막는다 (밀다가 메뉴나 사람이 눌리지 않게)
  function onClickCapture(e: React.MouseEvent) {
    if (onHud(e)) return;
    if (moved.current >= 6) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function onWheel(e: React.WheelEvent) {
    if (onHud(e)) return;
    const p = local(e);
    zoomAt(shown.level * Math.exp(-e.deltaY * 0.0015), p.x, p.y);
  }

  const canPan = STAGE_WIDTH * scale > w + 1 || STAGE_HEIGHT * scale > h + 1;
  const zoomBtn =
    "grid h-10 w-10 place-items-center rounded-full bg-white/90 text-2xl font-bold leading-none text-[#5c3a1c] shadow-lg hover:bg-white disabled:opacity-40";

  return (
    <HudContext.Provider value={hud}>
      <div
        ref={outerRef}
        className={`relative h-[100dvh] w-full touch-none select-none overflow-clip bg-[#2b1d14] ${canPan ? "cursor-grab active:cursor-grabbing" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        onWheel={onWheel}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            visibility: size === null ? "hidden" : "visible",
          }}
        >
          {children}
        </div>

        {/* 화면에 고정되는 층: 버튼과 창이 여기로 들어온다 (Hud.tsx) */}
        <div ref={setHud} className="pointer-events-none absolute inset-0 z-10 cursor-auto [&>*]:pointer-events-auto">
          {/* + − 확대·축소 (왼쪽 아래). 360° 둘러보기 화면이 열리면 그 아래에 가려진다 */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
            <button type="button" aria-label="크게 · Zoom in" className={zoomBtn} disabled={shown.level >= MAX_ZOOM - 0.001} onClick={() => zoomAt(shown.level * STEP)}>
              +
            </button>
            <button type="button" aria-label="작게 · Zoom out" className={zoomBtn} disabled={shown.level <= minLevel + 0.001} onClick={() => zoomAt(shown.level / STEP)}>
              −
            </button>
          </div>
        </div>
      </div>
    </HudContext.Provider>
  );
}
