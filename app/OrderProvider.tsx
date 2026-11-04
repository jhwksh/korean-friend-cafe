"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { playCoffee } from "./sound";

// 카페에서 주문하고 먹기까지 (요즘 한국 카페 순서):
// 1. 채팅창 메뉴에서 고르면 🧾 주문서(cart)에 담긴다
// 2. 점원이나 키오스크에서 계산한다 → 📳 진동벨을 받는다 (step: "waiting")
// 3. 조금 뒤 진동벨이 울린다 (step: "ready")
// 4. 받으러 가면(pickupOpen) 계산대에서 쟁반을 받아 🧺 들고 다닌다 (carrying)
// 5. 360° 카페에서 자리에 앉아 쟁반을 내려놓으면(putDown) 내 탁자(orders)에 놓인다
// 6. 하나씩 누르면 먹는 소리가 나며 줄어든다 (bites)
// 새로고침하면 모두 비워진다 (새로 주문하면 된다).
export const BITES = 3;
const MAX_ON_TABLE = 6;
const BELL_DELAY = 10000; // 계산하고 10초 뒤 진동벨이 울린다

export type MenuItem = { name: string; emoji?: string; hot?: boolean; price?: string };
export type CartItem = { id: number; name: string; emoji: string; hot: boolean; price: number };
export type Order = CartItem & { bites: number };
export type OrderStep = "ordering" | "waiting" | "ready";
// 다 되면 무엇이 알려 주나: 📳 진동벨(카운터·키오스크) 또는 📱 탁자 위 테이블 패드
export type AlertBy = "bell" | "pad";

type Ctx = {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: number) => void;
  total: number;
  step: OrderStep;
  paid: CartItem[];
  pay: (by?: AlertBy) => void;
  alertBy: AlertBy;
  pickupOpen: boolean;
  openPickup: () => void;
  takeTray: () => void;
  carrying: CartItem[];
  putDown: () => void;
  orders: Order[];
  eat: (id: number) => void;
};

const OrderContext = createContext<Ctx>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  total: 0,
  step: "ordering",
  paid: [],
  pay: () => {},
  alertBy: "bell",
  pickupOpen: false,
  openPickup: () => {},
  takeTray: () => {},
  carrying: [],
  putDown: () => {},
  orders: [],
  eat: () => {},
});

// "4,500원" → 4500
function priceOf(price?: string) {
  return Number((price ?? "0").replace(/[^0-9]/g, "")) || 0;
}

// 8000 → "8,000원"
export function won(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<OrderStep>("ordering");
  const [paid, setPaid] = useState<CartItem[]>([]);
  const [alertBy, setAlertBy] = useState<AlertBy>("bell");
  const [pickupOpen, setPickupOpen] = useState(false);
  const [carrying, setCarrying] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const bellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (bellTimer.current) clearTimeout(bellTimer.current);
  }, []);

  function addToCart(item: MenuItem) {
    setCart((prev) => [
      ...prev,
      { id: Date.now(), name: item.name, emoji: item.emoji ?? "🍽️", hot: !!item.hot, price: priceOf(item.price) },
    ]);
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  // 계산 끝: 주문서를 넘기고 진동벨을 받는다. 점원이 커피를 내리기 시작한다
  function pay(by: AlertBy = "bell") {
    if (cart.length === 0 || step !== "ordering") return;
    setPaid(cart);
    setCart([]);
    setStep("waiting");
    setAlertBy(by);
    playCoffee();
    bellTimer.current = setTimeout(() => setStep("ready"), BELL_DELAY);
  }

  function openPickup() {
    if (step === "ready") setPickupOpen(true);
  }

  // 쟁반을 받아 들고 간다
  function takeTray() {
    setCarrying((prev) => [...prev, ...paid]);
    setPaid([]);
    setStep("ordering");
    setPickupOpen(false);
  }

  // 자리에 앉아 쟁반을 내려놓으면 내 탁자에 놓인다 (탁자가 꽉 차면 가장 먼저 받은 것을 치운다)
  function putDown() {
    setOrders((prev) => [...prev, ...carrying.map((c) => ({ ...c, bites: BITES }))].slice(-MAX_ON_TABLE));
    setCarrying([]);
  }

  function eat(id: number) {
    setOrders((prev) => prev.map((o) => (o.id === id && o.bites > 0 ? { ...o, bites: o.bites - 1 } : o)));
  }

  const total = cart.reduce((sum, c) => sum + c.price, 0);

  return (
    <OrderContext.Provider
      value={{ cart, addToCart, removeFromCart, total, step, paid, pay, alertBy, pickupOpen, openPickup, takeTray, carrying, putDown, orders, eat }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
