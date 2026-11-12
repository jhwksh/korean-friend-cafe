"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useFound, type Coupon } from "./FoundProvider";
import { menu } from "./menu";
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
export type CartItem = { id: number; name: string; emoji: string; hot: boolean; price: number; option?: string };
// 📱 키오스크에서 고른 옵션: 글자(예: "ICE · 라지"), 더하는 값, 차갑게 골랐으면 hot: false
export type ItemOption = { label: string; extra: number; hot?: boolean };
export type Order = CartItem & { bites: number };
export type OrderStep = "ordering" | "waiting" | "ready";
// 다 되면 무엇이 알려 주나: 📳 진동벨(카운터·키오스크) 또는 📱 탁자 위 테이블 패드
export type AlertBy = "bell" | "pad";

type Ctx = {
  cart: CartItem[];
  addToCart: (item: MenuItem, option?: ItemOption) => void;
  removeFromCart: (id: number) => void;
  total: number;
  step: OrderStep;
  paid: CartItem[];
  pay: (by?: AlertBy, earn?: boolean) => void;
  applied: string[];
  applyCoupon: (coupon: Coupon) => boolean;
  alertBy: AlertBy;
  paidCount: number; // 계산을 마친 횟수 (계산이 끝나면 채팅을 새로 시작하는 데 쓴다)
  pickupOpen: boolean;
  openPickup: () => void;
  takeTray: () => void;
  carrying: CartItem[];
  putDown: () => void;
  orders: Order[];
  eat: (id: number) => void;
  togo: boolean; // 🛍️ 포장으로 골랐는지 (메뉴가 나오면 쟁반 대신 종이봉투)
  setTogo: (togo: boolean) => void;
  takeAway: () => void;
  padOpen: boolean; // 📱 자리의 테이블 패드를 열고 있는지 (열려 있으면 계산대 주문서는 숨는다)
  setPadOpen: (open: boolean) => void;
};

const OrderContext = createContext<Ctx>({
  togo: false,
  setTogo: () => {},
  takeAway: () => {},
  padOpen: false,
  setPadOpen: () => {},
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  total: 0,
  step: "ordering",
  paid: [],
  pay: () => {},
  applied: [],
  applyCoupon: () => false,
  alertBy: "bell",
  paidCount: 0,
  pickupOpen: false,
  openPickup: () => {},
  takeTray: () => {},
  carrying: [],
  putDown: () => {},
  orders: [],
  eat: () => {},
});

// 음료인지 (커피·음료는 도장 대상, 빵은 아니다)
function isDrink(name: string) {
  return menu.find((m) => m.name === name)?.kind !== "bakery";
}

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
  const [paidCount, setPaidCount] = useState(0);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [carrying, setCarrying] = useState<CartItem[]>([]);
  const [padOpen, setPadOpen] = useState(false);
  const [togo, setTogo] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const bellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addBuyStamps, spendCoupons } = useFound();
  const [applied, setApplied] = useState<string[]>([]); // 이번 계산에 쓰기로 한 쿠폰

  useEffect(() => () => {
    if (bellTimer.current) clearTimeout(bellTimer.current);
  }, []);

  function addToCart(item: MenuItem, option?: ItemOption) {
    setCart((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: item.name,
        emoji: item.emoji ?? "🍽️",
        hot: option?.hot ?? !!item.hot,
        price: priceOf(item.price) + (option?.extra ?? 0),
        option: option?.label,
      },
    ]);
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  // 🎟️ 쿠폰 쓰기: 사이즈 업은 음료 하나를 라지로(돈 그대로), 아이스 아메리카노는 아메리카노 하나를 0원으로 (없으면 하나 넣어 준다)
  function applyCoupon(coupon: Coupon) {
    if (coupon.used || applied.includes(coupon.id)) return false;
    if (coupon.reward.kind === "sizeup") {
      const i = cart.findIndex((c) => isDrink(c.name) && !c.option?.includes("쿠폰"));
      if (i < 0) return false; // 음료가 없으면 쓸 수 없다
      setCart((prev) =>
        prev.map((c, j) => {
          if (j !== i) return c;
          const wasLarge = c.option?.includes("라지");
          // 레귤러였으면 레귤러를 라지(쿠폰)로 바꾸고, 크기가 없었으면 붙인다
          const label = wasLarge
            ? c.option!.replace("라지", "라지(쿠폰)")
            : c.option?.includes("레귤러")
              ? c.option.replace("레귤러", "라지(쿠폰)")
              : [c.option, "라지(쿠폰)"].filter(Boolean).join(" · ");
          return { ...c, option: label, price: wasLarge ? c.price - 500 : c.price };
        }),
      );
    } else {
      const i = cart.findIndex((c) => c.name === "아메리카노" && c.price > 0);
      if (i >= 0) {
        setCart((prev) => prev.map((c, j) => (j === i ? { ...c, price: 0, option: [c.option, "무료 쿠폰"].filter(Boolean).join(" · ") } : c)));
      } else {
        addToCart({ name: "아메리카노", emoji: "☕", hot: false, price: "0원" }, { label: "ICE · 무료 쿠폰", extra: 0, hot: false });
      }
    }
    setApplied((prev) => [...prev, coupon.id]);
    return true;
  }

  // 계산 끝: 주문서를 넘기고 진동벨을 받는다. 점원이 커피를 내리기 시작한다
  // earn: "적립해 주세요"라고 했으면 음료 1잔에 도장 1개. 쓴 쿠폰은 여기서 다 쓴 것으로 바뀐다
  function pay(by: AlertBy = "bell", earn = false) {
    if (cart.length === 0 || step !== "ordering") return;
    if (earn) addBuyStamps(cart.filter((c) => isDrink(c.name) && c.price > 0).length);
    spendCoupons(applied);
    setApplied([]);
    setPaid(cart);
    setCart([]);
    setStep("waiting");
    setAlertBy(by);
    setPaidCount((n) => n + 1);
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
    setTogo(false);
  }

  // 🛍️ 포장: 봉투를 받아 들고 카페를 나간다 (자리에 앉지 않는다). 다시 주문할 수 있다
  function takeAway() {
    setPaid([]);
    setStep("ordering");
    setPickupOpen(false);
    setTogo(false);
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
      value={{ cart, addToCart, removeFromCart, total, step, paid, pay, applied, applyCoupon, alertBy, paidCount, pickupOpen, openPickup, takeTray, carrying, putDown, orders, eat, padOpen, setPadOpen, togo, setTogo, takeAway }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
