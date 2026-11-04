"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { menu } from "./menu";
import { useOrders, won, type CartItem } from "./OrderProvider";
import { playBell } from "./sound";
import SpeakLine from "./SpeakLine";

// 🧾 주문서 → 💳 계산(점원 또는 키오스크) → 📳 진동벨 → 받으러 가기.
// 주문서와 진동벨은 2D와 360 둘 다에서 보인다. 계산과 받기는 카페 화면 위에 창으로 뜬다.
type PayWith = "staff" | "kiosk" | null;
// 메뉴를 고르고 3초 동안 더 안 고르면 점원이 소리 내어 묻는다: "더 주문하실 거 있으세요?"
// → "아니요, 이게 다예요." → "계산은 어떻게 하시겠어요?"
// 대답은 그때 주문서에 담긴 개수(n)와 함께 기억한다. 메뉴를 더 고르면 개수가 달라져서 처음 물음으로 돌아간다.
type Answer = { n: number; step: "more" | "how" };
const ASK_AFTER = 3000;

// 주문서 안의 작은 대답 버튼 (한국어 + KR 발음 + 내 언어)
function Reply({ ko, roman, mean, onClick }: { ko: string; roman: string; mean: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full rounded-lg bg-amber-100 px-2 py-1 text-left text-xs font-semibold hover:bg-amber-200">
      🙋 {ko}
      <span className="block text-[10px] font-normal italic text-gray-500">KR: {roman}</span>
      <span className="block text-[10px] font-normal text-gray-500">{mean}</span>
    </button>
  );
}

export default function Checkout() {
  const { t } = useLanguage();
  const { cart, removeFromCart, total, step, openPickup, pickupOpen, carrying, paid, alertBy } = useOrders();
  const [payWith, setPayWith] = useState<PayWith>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  // 마지막으로 고르고 3초가 지났을 때의 주문 개수. 그동안 더 고르면 다시 3초를 센다
  const [quietN, setQuietN] = useState(0);
  useEffect(() => {
    if (cart.length === 0) return;
    const timer = setTimeout(() => setQuietN(cart.length), ASK_AFTER);
    return () => clearTimeout(timer);
  }, [cart.length]);
  const asking = answer && answer.n === cart.length ? answer.step : quietN === cart.length ? "ask" : "wait";

  // 진동벨이 울리는 동안 2.5초마다 "띠리리리"
  useEffect(() => {
    if (step !== "ready" || pickupOpen) return;
    playBell();
    const timer = setInterval(playBell, 2500);
    return () => clearInterval(timer);
  }, [step, pickupOpen]);

  const showSlip = cart.length > 0 || step !== "ordering";
  // 🧾 주문서 → (이게 다예요) 계산서: 낼 돈이 정해져 더 못 뺀다 → (결제) 영수증
  const isBill = asking === "how";
  const paidTotal = paid.reduce((sum, p) => sum + p.price, 0);

  return (
    <>
      {/* 🧺 받은 쟁반을 들고 있을 때: 자리에 앉아 내려놓으라고 알려 준다 */}
      {carrying.length > 0 && (
        <div className="absolute bottom-3 right-3 z-40 w-[190px] rounded-xl border-2 border-amber-400 bg-white/95 px-3 py-2 text-center text-[#5c3a1c] shadow-lg">
          <SpeakLine ko="쟁반을 들고 있어요" roman="jaengbaneul deulgo isseoyo" mean={t.carrying} className="text-sm" />
          <div className="my-1 rounded-lg border-2 border-[#8b5a2b] bg-[#c8a27a] py-1 text-2xl">
            {carrying.map((c) => (
              <span key={c.id}>{c.emoji}</span>
            ))}
          </div>
          <p className="text-[10px] text-gray-500">🪑 {t.sitToPut}</p>
        </div>
      )}
      {/* 👀 처음 메뉴를 고르면 주문서가 어디 있는지 알려 준다 (계산 방법을 고르기 전까지 반짝인다) */}
      {step === "ordering" && cart.length > 0 && asking !== "how" && (
        <p className="absolute right-[228px] top-[180px] z-40 animate-pulse whitespace-nowrap rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-white shadow">
          주문서를 보세요 👉 <span className="block text-[10px] font-normal">{t.lookSlip}</span>
        </p>
      )}
      {showSlip && (
        <div
          className={`absolute right-3 top-[170px] z-40 w-[210px] rounded-xl bg-white/95 px-3 py-2 text-[#5c3a1c] shadow-lg ${step === "ordering" && asking !== "how" ? "ring-4 ring-amber-400 animate-[word-glow_2.4s_ease-in-out_infinite]" : ""}`}
        >
          {step === "ordering" ? (
            <>
              <p className="text-sm font-bold">
                {isBill ? (
                  <>
                    🧾 계산서 <span className="text-[10px] font-normal text-gray-500">{t.bill}</span>
                  </>
                ) : (
                  <>
                    🧾 주문서 <span className="text-[10px] font-normal text-gray-500">{t.mySlip}</span>
                  </>
                )}
              </p>
              <ul className="my-1 max-h-24 overflow-y-auto text-xs">
                {cart.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-1">
                    <span>
                      {c.emoji} {c.name}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      {won(c.price)}
                      {!isBill && (
                        <button type="button" onClick={() => removeFromCart(c.id)} aria-label={`${c.name} 빼기`} className="hover:text-red-500">
                          ✕
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-amber-200 pt-1 text-right text-xs font-bold">
                합계 {won(total)} <span className="font-normal text-gray-500">· {t.total}</span>
              </p>
              {/* 점원과 주고받는 말: 더 주문할지 → 계산은 어떻게 할지 */}
              <div className="mt-1 flex flex-col gap-1 border-t border-amber-200 pt-1">
                {asking === "ask" && (
                  <>
                    <SpeakLine ko="더 주문하실 거 있으세요?" roman="deo jumunhasil geo isseuseyo?" mean={`🧑‍🍳 ${t.askMore}`} autoPlay className="text-xs" />
                    <Reply ko="네, 더 주문할게요." roman="ne, deo jumunhalgeyo." mean={t.moreYes} onClick={() => setAnswer({ n: cart.length, step: "more" })} />
                    <Reply ko="아니요, 이게 다예요." roman="aniyo, ige dayeyo." mean={t.moreNo} onClick={() => setAnswer({ n: cart.length, step: "how" })} />
                  </>
                )}
                {asking === "more" && <p className="text-[11px] text-gray-500">👉 {t.moreHint}</p>}
                {asking === "how" && (
                  <>
                    <SpeakLine ko="계산은 어떻게 하시겠어요?" roman="gyesaneun eotteoke hasigesseoyo?" mean={`🧑‍🍳 ${t.askPayHow}`} autoPlay className="text-xs" />
                    <Reply ko="🧑‍🍳 카운터에서 할게요." roman="kaunteoeseo halgeyo." mean={t.payStaff} onClick={() => setPayWith("staff")} />
                    <Reply ko="📱 키오스크로 할게요." roman="kioseukeuro halgeyo." mean={t.payKiosk} onClick={() => setPayWith("kiosk")} />
                    <button type="button" onClick={() => setAnswer({ n: cart.length, step: "more" })} className="text-[10px] text-gray-500 underline">
                      ✏️ 주문 바꾸기 · {t.changeOrder}
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 🧾 영수증: 결제가 끝난 것 */}
              <p className="text-sm font-bold">
                🧾 영수증 <span className="text-[10px] font-normal text-gray-500">{t.receipt}</span>
              </p>
              <ul className="my-1 text-xs">
                {paid.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>
                      {p.emoji} {p.name}
                    </span>
                    <span className="text-gray-500">{won(p.price)}</span>
                  </li>
                ))}
              </ul>
              <p className="mb-1 border-t border-dashed border-amber-300 pt-1 text-right text-xs font-bold">
                합계 {won(paidTotal)} <span className="text-green-600">✅ 결제 완료</span>
                <span className="block text-[10px] font-normal text-gray-500">{t.paid}</span>
              </p>
            </>
          )}
          {step === "waiting" && (
            <p className="border-t border-amber-200 pt-1 text-center text-sm font-bold">
              {alertBy === "pad" ? (
                <>
                  <span className="block text-3xl">📱</span>
                  테이블 패드 <span className="block text-[10px] font-normal text-gray-500">{t.padWillTell}</span>
                </>
              ) : (
                <>
                  <span className="block text-3xl">📳</span>
                  진동벨 <span className="block text-[10px] font-normal text-gray-500">{t.bellWait}</span>
                </>
              )}
            </p>
          )}
          {step === "ready" && (
            <button type="button" onClick={openPickup} className="w-full border-t border-amber-200 pt-1 text-center text-sm font-bold">
              <span className="block animate-[bell-shake_0.4s_ease-in-out_infinite] text-3xl">{alertBy === "pad" ? "📱" : "📳"}</span>
              주문하신 메뉴 나왔습니다!
              <span className="block text-[10px] font-normal text-gray-500">{t.bellReady}</span>
              <span className="mt-1 block rounded-full bg-amber-400 px-2 py-0.5 text-xs text-white hover:bg-amber-500">
                받으러 가기 · {t.pickUp}
              </span>
            </button>
          )}
        </div>
      )}

      {payWith === "staff" && <StaffPay onClose={() => setPayWith(null)} />}
      {payWith === "kiosk" && <KioskPay onClose={() => setPayWith(null)} />}
      {pickupOpen && <Pickup />}
    </>
  );
}

// 창 틀: 카페 화면 위를 어둡게 덮고 가운데에 띄운다
function Dialog({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="relative w-full max-w-[460px] rounded-2xl bg-white p-4 text-[#5c3a1c] shadow-2xl">
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t.close} className="absolute right-3 top-2 text-gray-400 hover:text-gray-700">
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

// 금액을 한국어 발음으로: 8000 → "palcheon", 13500 → "mansamcheonobaek" (한자어 수: 일, 이, 삼…)
const DIGIT = ["", "il", "i", "sam", "sa", "o", "yuk", "chil", "pal", "gu"];
function sinoRoman(n: number): string {
  const man = Math.floor(n / 10000);
  let out = man > 0 ? (man === 1 ? "" : sinoRoman(man)) + "man" : "";
  for (const [unit, name] of [[1000, "cheon"], [100, "baek"], [10, "sip"]] as const) {
    const d = Math.floor(n / unit) % 10;
    if (d > 0) out += (d === 1 ? "" : DIGIT[d]) + name;
  }
  return out + DIGIT[n % 10];
}
// "8,000원" → "palcheonwon", "3,500원" → "samcheonobaegwon" (백 + 원은 이어서 "배권"으로 읽는다)
function wonRoman(n: number) {
  return `${sinoRoman(n)}won`.replace(/baekwon$/, "baegwon");
}

// 점원이 하는 말: 바리스타 그림 + 말풍선 (🔊 듣기와 형광펜, KR 발음, 내 언어 뜻)
function StaffSays({ ko, roman, mean }: { ko: string; roman: string; mean: string }) {
  return (
    <div className="flex items-end gap-2">
      <Image src="/barista.png" alt="" width={60} height={112} className="h-[112px] w-auto" />
      <SpeakLine ko={ko} roman={roman} mean={mean} className="mb-4 rounded-2xl rounded-bl-none bg-amber-50 px-3 py-2 text-sm shadow" />
    </div>
  );
}

// 내가 하는 말: 먼저 🔊로 들어 보고, "말하기"를 누르면 다음으로 넘어간다
function ISay({ ko, roman, mean, onClick }: { ko: string; roman: string; mean: string; onClick: () => void }) {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm shadow ring-2 ring-amber-300">
      <span className="text-lg">🙋</span>
      <SpeakLine ko={ko} roman={roman} mean={mean} className="flex-1" />
      <button type="button" onClick={onClick} className="shrink-0 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-white shadow hover:bg-amber-500">
        말하기 ▶
      </button>
    </div>
  );
}

function CartList({ items, total }: { items: CartItem[]; total: number }) {
  return (
    <ul className="my-2 rounded-lg bg-gray-50 p-2 text-sm">
      {items.map((c) => (
        <li key={c.id} className="flex justify-between">
          <span>
            {c.emoji} {c.name}
          </span>
          <span>{won(c.price)}</span>
        </li>
      ))}
      <li className="mt-1 flex justify-between border-t pt-1 font-bold">
        <span>합계</span>
        <span>{won(total)}</span>
      </li>
    </ul>
  );
}

// 💳 카드를 대면 1.2초 뒤 "결제되었습니다"
function useCardTap(onDone: () => void) {
  const [tapping, setTapping] = useState(false);
  useEffect(() => {
    if (!tapping) return;
    const timer = setTimeout(onDone, 1200);
    return () => clearTimeout(timer);
  }, [tapping, onDone]);
  return [tapping, () => setTapping(true)] as const;
}

// 🧑‍🍳 점원에게 계산: 주문 → 매장/포장 → 카드 → 진동벨
function StaffPay({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { cart, total, pay } = useOrders();
  const [scene, setScene] = useState(0);
  const [tapping, tap] = useCardTap(() => setScene(3));

  return (
    <Dialog onClose={onClose}>
      {scene === 0 && (
        <>
          <StaffSays ko="주문하시겠어요?" roman="jumunhasigesseoyo?" mean={t.staffOrder} />
          <CartList items={cart} total={total} />
          <ISay ko="네, 이거 주세요." roman="ne, igeo juseyo." mean={t.meYes} onClick={() => setScene(1)} />
        </>
      )}
      {scene === 1 && (
        <>
          <StaffSays ko="드시고 가세요?" roman="deusigo gaseyo?" mean={t.staffHere} />
          <ISay ko="네, 먹고 갈게요." roman="ne, meokgo galgeyo." mean={t.meHere} onClick={() => setScene(2)} />
        </>
      )}
      {scene === 2 && (
        <>
          <StaffSays
            ko={`${won(total)}입니다. 결제는 어떻게 하시겠어요?`}
            roman={`${wonRoman(total)}imnida. gyeoljeneun eotteoke hasigesseoyo?`}
            mean={t.staffPay}
          />
          {tapping ? (
            <p className="mt-3 text-center text-sm font-bold">💳 ··· 띡!</p>
          ) : (
            <ISay ko="카드로 할게요." roman="kadeuro halgeyo." mean={`💳 ${t.meCard}`} onClick={tap} />
          )}
        </>
      )}
      {scene === 3 && (
        <>
          <p className="mb-2 text-center text-sm font-bold text-green-600">
            ✅ 결제되었습니다. <span className="font-normal text-gray-500">· {t.paid}</span>
          </p>
          <StaffSays ko="진동벨 드릴게요. 울리면 가지러 오세요." roman="jindongbel deurilgeyo. ullimyeon gajireo oseyo." mean={t.staffBell} />
          <ISay
            ko="감사합니다!"
            roman="gamsahamnida!"
            mean={`📳 ${t.meThanks}`}
            onClick={() => {
              pay();
              onClose();
            }}
          />
        </>
      )}
    </Dialog>
  );
}

// 키오스크 화면 글자: 크게 한국어, 그 아래 KR 발음과 내 언어 (🔊 형광펜)
function Big({ ko, roman, mean }: { ko: string; roman: string; mean: string }) {
  return <SpeakLine ko={ko} roman={roman} mean={mean} tone="dark" className="text-center text-lg text-white" />;
}

function KioskButton({ ko, roman, mean, onClick }: { ko: string; roman: string; mean: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex-1 rounded-xl bg-white px-3 py-4 text-base font-bold text-[#1f3b57] shadow hover:bg-sky-50">
      {ko}
      <span className="block text-xs font-normal italic text-gray-400">KR: {roman}</span>
      <span className="block text-xs font-normal text-gray-500">{mean}</span>
    </button>
  );
}

// 📱 키오스크로 계산: 매장/포장 → 주문 확인 → 카드 넣기 → 진동벨
// pad: 자리 탁자 위의 📱 테이블 패드 (요즘 한국의 "테이블 오더"). 이미 자리에 앉아 있으니
// 매장/포장은 묻지 않고, 메뉴 고르기부터 시작한다 → 주문 확인 → 카드 → 진동벨
export function KioskPay({ onClose, pad = false }: { onClose: () => void; pad?: boolean }) {
  const { t } = useLanguage();
  const { cart, total, pay, addToCart, removeFromCart } = useOrders();
  const [scene, setScene] = useState(pad ? -1 : 0);
  const [tapping, tap] = useCardTap(() => setScene(3));

  return (
    <Dialog onClose={onClose}>
      <p className="mb-2 text-center text-xs text-gray-500">{pad ? `📱 테이블 패드 · ${t.tablePad}` : "📱 키오스크 · Kiosk"}</p>
      {/* 태블릿 화면 */}
      <div className="rounded-2xl border-[10px] border-gray-800 bg-[#1f3b57] p-4">
        {scene === -1 && (
          <>
            <Big ko="더 드시고 싶은 걸 골라 주세요" roman="deo deusigo sipeun geol golla juseyo" mean={t.padPick} />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {menu.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => addToCart(item)}
                  className="rounded-lg bg-white px-1 py-2 text-center text-xs font-bold text-[#1f3b57] hover:bg-sky-50"
                >
                  <span className="block text-2xl">{item.emoji}</span>
                  {item.name}
                  <span className="block text-[10px] font-normal text-gray-500">{item.price}</span>
                </button>
              ))}
            </div>
            {cart.length > 0 && (
              <ul className="mt-3 rounded-lg bg-white/90 p-2 text-sm text-[#1f3b57]">
                {cart.map((c) => (
                  <li key={c.id} className="flex justify-between">
                    <span>
                      {c.emoji} {c.name}
                    </span>
                    <span className="flex gap-2">
                      {won(c.price)}
                      <button type="button" onClick={() => removeFromCart(c.id)} aria-label={`${c.name} 빼기`} className="text-gray-400 hover:text-red-500">
                        ✕
                      </button>
                    </span>
                  </li>
                ))}
                <li className="mt-1 flex justify-between border-t pt-1 font-bold">
                  <span>합계</span>
                  <span>{won(total)}</span>
                </li>
              </ul>
            )}
            {cart.length > 0 && (
              <div className="mt-3 flex">
                <KioskButton ko="주문하기" roman="jumunhagi" mean={t.orderBtn} onClick={() => setScene(1)} />
              </div>
            )}
          </>
        )}
        {scene === 0 && (
          <>
            <Big ko="어디에서 드시겠어요?" roman="eodieseo deusigesseoyo?" mean={t.kioskWhere} />
            <div className="mt-4 flex gap-2">
              <KioskButton ko="🍽️ 매장" roman="maejang" mean={t.kioskHere} onClick={() => setScene(1)} />
              <KioskButton ko="🛍️ 포장" roman="pojang" mean={t.kioskTogo} onClick={() => setScene(1)} />
            </div>
          </>
        )}
        {scene === 1 && (
          <>
            <Big ko="주문 내역을 확인해 주세요" roman="jumun naeyeogeul hwaginhae juseyo" mean={t.kioskCheck} />
            <CartList items={cart} total={total} />
            <div className="flex">
              <KioskButton ko="결제하기" roman="gyeoljehagi" mean={t.kioskPayBtn} onClick={() => setScene(2)} />
            </div>
          </>
        )}
        {scene === 2 && (
          <>
            <Big ko="카드를 꽂아 주세요" roman="kadeureul kkoja juseyo" mean={t.kioskCard} />
            <div className="mt-4 flex">
              {tapping ? (
                <p className="flex-1 text-center text-lg font-bold text-white">💳 ··· 삐빅!</p>
              ) : (
                <KioskButton ko="💳 카드 넣기" roman="kadeu neoki" mean={t.meCard} onClick={tap} />
              )}
            </div>
          </>
        )}
        {scene === 3 && !pad && (
          <>
            <Big ko="결제가 완료되었습니다. 진동벨을 가져가세요." roman="gyeoljega wallyodoeeotseumnida. jindongbereul gajyeogaseyo." mean={t.kioskDone} />
            <div className="mt-4 flex">
              <KioskButton
                ko="📳 진동벨 받기"
                roman="jindongbel batgi"
                mean={t.takeBell}
                onClick={() => {
                  pay();
                  onClose();
                }}
              />
            </div>
          </>
        )}
        {/* 테이블 패드는 진동벨이 따로 없다: 메뉴가 나오면 이 패드가 울린다 */}
        {scene === 3 && pad && (
          <>
            <Big
              ko="결제가 완료되었습니다. 메뉴가 나오면 패드로 알려 드릴게요."
              roman="gyeoljega wallyodoeeotseumnida. menyuga naomyeon paedeuro allyeo deurilgeyo."
              mean={t.padPaid}
            />
            <div className="mt-4 flex">
              <KioskButton
                ko="확인"
                roman="hwagin"
                mean={t.okBtn}
                onClick={() => {
                  pay("pad");
                  onClose();
                }}
              />
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}

// 📳 받으러 가기: 계산대에서 점원이 쟁반을 준다
function Pickup() {
  const { t } = useLanguage();
  const { paid, takeTray } = useOrders();
  return (
    <Dialog>
      <StaffSays ko="주문하신 메뉴 나왔습니다. 맛있게 드세요!" roman="jumunhasin menyu nawatseumnida. masitge deuseyo!" mean={t.staffReady} />
      {/* 쟁반: 점원이 내민다. "감사합니다"를 누르면 받아서 들고 간다 */}
      <div className="mx-auto my-2 flex w-fit gap-3 rounded-xl border-4 border-[#8b5a2b] bg-[#c8a27a] px-5 py-3 shadow-inner">
        {paid.map((p) => (
          <span key={p.id} className="flex flex-col items-center">
            <span className="text-5xl">{p.emoji}</span>
            <span className="text-xs font-bold text-[#4a2e17]">{p.name}</span>
          </span>
        ))}
      </div>
      <ISay ko="감사합니다!" roman="gamsahamnida!" mean={`${t.meThanks} · ${t.enjoyHint}`} onClick={takeTray} />
    </Dialog>
  );
}
