"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useFound, type Coupon } from "./FoundProvider";
import { menu } from "./menu";
import { playCoffee } from "./sound";
import { track } from "./tracking";

// 카페에서 주문하고 먹기까지 (요즘 한국 카페 순서):
// 1. 채팅창 메뉴에서 고르면 🧾 주문서(cart)에 담긴다
// 2. 점원이나 키오스크에서 계산한다 → 📳 진동벨을 받는다 (step: "waiting")
// 3. 조금 뒤 진동벨이 울린다 (step: "ready")
// 4. 받으러 가면(pickupOpen) 계산대에서 쟁반을 받아 🧺 들고 다닌다 (carrying)
// 5. 360° 카페에서 자리에 앉아 쟁반을 내려놓으면(putDown) 내 탁자(orders)에 놓인다
// 6. 하나씩 누르면 먹는 소리가 나며 줄어든다 (bites)
// 새로고침하거나 잠깐 나갔다 와도 주문은 그대로 남는다 (2시간까지).
export const BITES = 3;
const MAX_ON_TABLE = 6;
const BELL_DELAY = 10000; // 계산하고 10초 뒤 진동벨이 울린다
const STARS_KEY = "kfc-order-stars"; // ⭐ 말로 주문해서 받은 별 (이 브라우저에 저장)
const MAX_STARS = 20; // 최근 20번만 남긴다
const SAVE_KEY = "kfc-order-save"; // 🧾 주문하던 것 (이 브라우저에 저장)
const SAVE_LIFE = 2 * 60 * 60 * 1000; // 2시간이 지난 저장은 버린다

export type MenuItem = { name: string; emoji?: string; hot?: boolean; price?: string };
export type CartItem = { id: number; name: string; emoji: string; hot: boolean; price: number; option?: string };
// 📱 키오스크에서 고른 옵션: 글자(예: "ICE · 라지"), 더하는 값, 차갑게 골랐으면 hot: false
export type ItemOption = { label: string; extra: number; hot?: boolean };
export type Order = CartItem & { bites: number };
export type OrderStep = "ordering" | "waiting" | "ready";
// 다 되면 무엇이 알려 주나: 📳 진동벨(카운터·키오스크) 또는 📱 탁자 위 테이블 패드
export type AlertBy = "bell" | "pad";
// 📊 어디서 계산했나 (성과 보드용): 카운터 점원 / 키오스크 / 탁자 위 테이블 패드
export type PayVia = "staff" | "kiosk" | "pad";
// 🧾 브라우저에 저장해 두는 주문 (열린 창은 저장하지 않는다: 다시 들어오면 닫힌 채로 시작)
type OrderSave = {
  at: number; // 저장한 시각
  cart: CartItem[];
  paid: CartItem[];
  step: OrderStep;
  carrying: CartItem[];
  orders: Order[];
  togo: boolean;
  alertBy: AlertBy;
  upstairs: boolean;
};

type Ctx = {
  cart: CartItem[];
  addToCart: (item: MenuItem, option?: ItemOption) => void;
  removeFromCart: (id: number) => void;
  total: number;
  step: OrderStep;
  paid: CartItem[];
  pay: (by?: AlertBy, earn?: boolean, via?: PayVia) => void;
  applied: string[];
  applyCoupon: (coupon: Coupon) => boolean;
  alertBy: AlertBy;
  paidCount: number; // 계산을 마친 횟수 (계산이 끝나면 채팅을 새로 시작하는 데 쓴다)
  doneCount: number; // 주문이 끝난 횟수 (자리에 쟁반을 내려놓거나 🛍️ 포장 봉투를 받으면 1씩 는다)
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
  talkOpen: boolean; // 🗣️ 카운터에서 점원과 말로 주문하는 창이 열려 있는지 (점원을 누르면 열린다)
  setTalkOpen: (open: boolean) => void;
  orderStars: number[]; // ⭐ 말로 주문해서 받은 별 (최근 것이 끝에). 이 브라우저에 저장한다
  addOrderStars: (stars: number) => void;
  upstairs: boolean; // 🌀 둘러보기(360) = 앉는 자리가 있는 위층에 있는지
  setUpstairs: React.Dispatch<React.SetStateAction<boolean>>;
  upstairsTick: number; // ⬆️ "위층으로 올라가기"를 누를 때마다 1씩 는다 (위층에서 자리 쪽을 바라보게)
  goUpstairs: () => void;
};

const OrderContext = createContext<Ctx>({
  togo: false,
  setTogo: () => {},
  takeAway: () => {},
  padOpen: false,
  setPadOpen: () => {},
  talkOpen: false,
  setTalkOpen: () => {},
  orderStars: [],
  addOrderStars: () => {},
  upstairs: false,
  setUpstairs: () => {},
  upstairsTick: 0,
  goUpstairs: () => {},
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
  doneCount: 0,
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

// 저장된 값이 우리가 아는 모양인지 가볍게 확인한다 (망가진 저장 때문에 카페가 멈추지 않게)
function isCartItem(v: unknown): v is CartItem {
  if (!v || typeof v !== "object") return false;
  const c = v as Partial<CartItem>;
  return typeof c.id === "number" && typeof c.name === "string" && typeof c.emoji === "string" && typeof c.hot === "boolean" && typeof c.price === "number";
}
function isOrder(v: unknown): v is Order {
  return isCartItem(v) && typeof (v as Partial<Order>).bites === "number";
}
function isCartList(v: unknown): v is CartItem[] {
  return Array.isArray(v) && v.every(isCartItem);
}
function isOrderList(v: unknown): v is Order[] {
  return Array.isArray(v) && v.every(isOrder);
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
  const [doneCount, setDoneCount] = useState(0);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [carrying, setCarrying] = useState<CartItem[]>([]);
  const [padOpen, setPadOpen] = useState(false);
  const [togo, setTogo] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const bellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addBuyStamps, spendCoupons } = useFound();
  const [applied, setApplied] = useState<string[]>([]); // 이번 계산에 쓰기로 한 쿠폰
  const [talkOpen, setTalkOpen] = useState(false);
  const [orderStars, setOrderStars] = useState<number[]>([]);
  const [upstairs, setUpstairs] = useState(false);
  const [upstairsTick, setUpstairsTick] = useState(0);
  const [restored, setRestored] = useState(false); // 저장해 둔 주문을 다 읽었는지
  const lastSave = useRef<string | null>(null); // 방금 저장한 내용 (그대로면 다시 쓰지 않는다)
  function goUpstairs() {
    setUpstairs(true);
    setUpstairsTick((n) => n + 1);
    track("upstairs");
  }

  useEffect(() => () => {
    if (bellTimer.current) clearTimeout(bellTimer.current);
  }, []);

  // ⭐ 주문 별은 이 브라우저에 저장해 둔다 (새로고침해도 남게). 저장소를 못 쓰면 이번 방문에만 보인다
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STARS_KEY) ?? "[]");
      // 브라우저 저장소는 화면이 뜬 뒤에만 읽을 수 있어서(서버엔 없음) 여기서 불러오는 것이 맞다
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved)) setOrderStars(saved.filter((n) => typeof n === "number").slice(-MAX_STARS));
    } catch {}
  }, []);

  // 🧾 저장해 둔 주문을 되살린다 (2시간 안에 다시 들어왔을 때만)
  useEffect(() => {
    let save: Partial<OrderSave> | null = null;
    try {
      save = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
    } catch {}
    if (
      save &&
      typeof save.at === "number" &&
      Date.now() - save.at <= SAVE_LIFE &&
      isCartList(save.cart) &&
      isCartList(save.paid) &&
      isCartList(save.carrying) &&
      isOrderList(save.orders)
    ) {
      // 나가 있는 동안 진동벨이 이미 울린 것으로 친다
      const nextStep: OrderStep = save.step === "waiting" || save.step === "ready" ? "ready" : "ordering";
      const nextTogo = save.togo === true;
      const nextAlertBy: AlertBy = save.alertBy === "pad" ? "pad" : "bell";
      const nextUpstairs = save.upstairs === true;
      // 브라우저 저장소는 화면이 뜬 뒤에만 읽을 수 있어서(서버엔 없음) 여기서 불러오는 것이 맞다
      /* eslint-disable react-hooks/set-state-in-effect */
      setCart(save.cart);
      setPaid(save.paid);
      setCarrying(save.carrying);
      setOrders(save.orders);
      setStep(nextStep);
      setTogo(nextTogo);
      setAlertBy(nextAlertBy);
      setUpstairs(nextUpstairs);
      setRestored(true);
      /* eslint-enable react-hooks/set-state-in-effect */
      // 방금 되살린 그대로는 다시 쓰지 않는다 (저장한 시각이 새로워지지 않게)
      lastSave.current = JSON.stringify({ cart: save.cart, paid: save.paid, step: nextStep, carrying: save.carrying, orders: save.orders, togo: nextTogo, alertBy: nextAlertBy, upstairs: nextUpstairs });
    } else {
      // 2시간이 지났거나 모양이 깨진 저장은 버린다
      if (save) {
        try {
          localStorage.removeItem(SAVE_KEY);
        } catch {}
      }
      setRestored(true);
    }
  }, []);

  // 주문이 바뀔 때마다 저장한다. 열린 창(pickupOpen·talkOpen·padOpen)은 저장하지 않는다
  useEffect(() => {
    if (!restored) return;
    const body = JSON.stringify({ cart, paid, step, carrying, orders, togo, alertBy, upstairs });
    if (body === lastSave.current) return;
    lastSave.current = body;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ at: Date.now(), cart, paid, step, carrying, orders, togo, alertBy, upstairs }));
    } catch {}
  }, [restored, cart, paid, step, carrying, orders, togo, alertBy, upstairs]);

  function addOrderStars(stars: number) {
    track("stars", { stars });
    setOrderStars((prev) => {
      const next = [...prev, stars].slice(-MAX_STARS);
      try {
        localStorage.setItem(STARS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function addToCart(item: MenuItem, option?: ItemOption) {
    track("cart", { item: item.name });
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
  function pay(by: AlertBy = "bell", earn = false, via: PayVia = by === "pad" ? "pad" : "staff") {
    if (cart.length === 0 || step !== "ordering") return;
    track("paid", { via, items: cart.length });
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
    track("pickup", { togo: false });
    setCarrying((prev) => [...prev, ...paid]);
    setPaid([]);
    setStep("ordering");
    setPickupOpen(false);
    setTogo(false);
  }

  // 🛍️ 포장: 봉투를 받아 들고 카페를 나간다 (자리에 앉지 않는다). 다시 주문할 수 있다
  function takeAway() {
    track("pickup", { togo: true });
    setDoneCount((n) => n + 1);
    setPaid([]);
    setStep("ordering");
    setPickupOpen(false);
    setTogo(false);
  }

  // 자리에 앉아 쟁반을 내려놓으면 내 탁자에 놓인다 (탁자가 꽉 차면 가장 먼저 받은 것을 치운다)
  function putDown() {
    if (carrying.length > 0) setDoneCount((n) => n + 1);
    setOrders((prev) => [...prev, ...carrying.map((c) => ({ ...c, bites: BITES }))].slice(-MAX_ON_TABLE));
    setCarrying([]);
  }

  function eat(id: number) {
    setOrders((prev) => prev.map((o) => (o.id === id && o.bites > 0 ? { ...o, bites: o.bites - 1 } : o)));
  }

  const total = cart.reduce((sum, c) => sum + c.price, 0);

  return (
    <OrderContext.Provider
      value={{ cart, addToCart, removeFromCart, total, step, paid, pay, applied, applyCoupon, alertBy, paidCount, doneCount, pickupOpen, openPickup, takeTray, carrying, putDown, orders, eat, padOpen, setPadOpen, togo, setTogo, takeAway, talkOpen, setTalkOpen, orderStars, addOrderStars, upstairs, setUpstairs, upstairsTick, goUpstairs }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
