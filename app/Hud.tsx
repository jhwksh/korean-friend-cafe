"use client";

import { createContext, useContext } from "react";
import { createPortal } from "react-dom";

// 🧭 화면에 고정되는 층 (HUD).
// 카페 그림은 확대하고 밀어서 보지만, 버튼(둘러보기·음악·언어·⭐미션)과 창(주문·계산)은
// 그림을 따라 움직이면 화면 밖으로 잘린다. 그래서 이 층으로 옮겨 늘 화면 구석·가운데에 둔다.
export const HudContext = createContext<HTMLElement | null>(null);

export default function Hud({ children }: { children: React.ReactNode }) {
  const el = useContext(HudContext);
  return el ? createPortal(children, el) : null;
}
