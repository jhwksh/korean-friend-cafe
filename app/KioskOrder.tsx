"use client";

import { useState } from "react";
import { Big, CartList, Dialog, KioskButton, useCardTap } from "./Checkout";
import { useLanguage } from "./LanguageProvider";
import { menu } from "./menu";
import { useOrders, won } from "./OrderProvider";
import SpeakLine from "./SpeakLine";
import { STAMPS_ON } from "./features";
import { CouponPicker, StampRules } from "./Stamps";

// 📱 카페 안에 서 있는 키오스크: 진짜 한국 키오스크처럼 처음부터 끝까지 혼자 주문한다.
// 화면 누르기 → 매장/포장 → 메뉴(커피/음료/베이커리) → 옵션(HOT/ICE, 크기) → 장바구니 → 결제 수단
// → 카드 꽂기 또는 휴대폰 대기 → "적립하시겠어요?" → "영수증을 출력하시겠어요?" → 진동벨
// 모든 글은 한국어 + KR 발음 + 내 언어 (🔊 형광펜).
type Screen = "start" | "where" | "menu" | "option" | "method" | "tap" | "points" | "receipt" | "done";
type Kind = "coffee" | "drink" | "bakery";
type MenuItem = (typeof menu)[number];

const TABS: { kind: Kind; ko: string; roman: string }[] = [
  { kind: "coffee", ko: "☕ 커피", roman: "keopi" },
  { kind: "drink", ko: "🥤 음료", roman: "eumnyo" },
  { kind: "bakery", ko: "🥐 베이커리", roman: "beikeori" },
];
const LARGE_EXTRA = 500;

export default function KioskOrder({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { cart, total, addToCart, removeFromCart, pay } = useOrders();
  const [screen, setScreen] = useState<Screen>("start");
  const [tab, setTab] = useState<Kind>("coffee");
  const [picked, setPicked] = useState<MenuItem | null>(null);
  const [ice, setIce] = useState(false);
  const [large, setLarge] = useState(false);
  const [phone, setPhone] = useState(false);
  const [earned, setEarned] = useState(false);
  const [tapping, tap] = useCardTap(() => setScreen(STAMPS_ON ? "points" : "receipt"));

  // 메뉴를 누르면: 음료는 옵션 화면으로, 빵은 바로 장바구니로
  function choose(item: MenuItem) {
    if (item.kind === "bakery") {
      addToCart(item);
      return;
    }
    setPicked(item);
    setIce(!item.hot); // 주스는 처음부터 차갑게
    setLarge(false);
    setScreen("option");
  }

  function putInCart() {
    if (!picked) return;
    const parts = [picked.hot ? (ice ? "ICE" : "HOT") : null, large ? "라지" : "레귤러"].filter(Boolean);
    addToCart(picked, { label: parts.join(" · "), extra: large ? LARGE_EXTRA : 0, hot: picked.hot && !ice });
    setPicked(null);
    setScreen("menu");
  }

  const pill = (on: boolean) =>
    `flex-1 rounded-lg px-2 py-2 text-sm font-bold ${on ? "bg-amber-400 text-white" : "bg-white text-[#1f3b57] hover:bg-sky-50"}`;

  return (
    <Dialog onClose={onClose}>
      <p className="mb-2 text-center text-xs text-gray-500">📱 키오스크 · {t.kiosk}</p>
      <div className="rounded-2xl border-[10px] border-gray-800 bg-[#1f3b57] p-4">
        {/* 1. 처음 화면 */}
        {screen === "start" && (
          <button type="button" onClick={() => setScreen("where")} className="w-full py-8 text-white">
            <span className="block text-5xl">☕</span>
            <span className="mt-2 block text-lg font-bold">한국어 친구 카페</span>
            <span className="mt-4 block animate-pulse">
              <SpeakLine ko="주문하시려면 화면을 눌러 주세요" roman="jumunhasiryeomyeon hwamyeoneul nulleo juseyo" mean={t.kioskStart} tone="dark" autoPlay />
            </span>
          </button>
        )}

        {/* 2. 매장 / 포장 */}
        {screen === "where" && (
          <>
            <Big ko="어디에서 드시겠어요?" roman="eodieseo deusigesseoyo?" mean={t.kioskWhere} />
            <div className="mt-4 flex gap-2">
              <KioskButton ko="🍽️ 매장" roman="maejang" mean={t.kioskHere} onClick={() => setScreen("menu")} />
              <KioskButton ko="🛍️ 포장" roman="pojang" mean={t.kioskTogo} onClick={() => setScreen("menu")} />
            </div>
          </>
        )}

        {/* 3. 메뉴: 커피 / 음료 / 베이커리 칸 + 장바구니 */}
        {screen === "menu" && (
          <>
            <Big ko="메뉴를 골라 주세요" roman="menyureul golla juseyo" mean={t.kioskMenu} />
            <div className="mt-3 flex gap-1">
              {TABS.map((tb) => (
                <button key={tb.kind} type="button" onClick={() => setTab(tb.kind)} className={pill(tab === tb.kind)}>
                  {tb.ko}
                  <span className="block text-xs font-medium italic opacity-80">KR: {tb.roman}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {menu
                .filter((m) => m.kind === tab)
                .map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => choose(item)}
                    className="rounded-lg bg-white px-1 py-2 text-center text-xs font-bold text-[#1f3b57] hover:bg-sky-50"
                  >
                    <span className="block text-3xl">{item.emoji}</span>
                    {item.name}
                    <span className="block text-xs font-medium italic text-gray-500">{item.roman}</span>
                    <span className="block text-xs font-medium text-gray-500">{item.price}</span>
                  </button>
                ))}
            </div>
            {/* 장바구니 */}
            <div className="mt-3 rounded-lg bg-white/90 p-2 text-sm text-[#1f3b57]">
              <p className="font-bold">
                🛒 장바구니 <span className="text-xs font-medium italic text-gray-500">KR: jangbaguni</span>{" "}
                <span className="text-xs font-medium text-gray-500">{t.cart}</span>
              </p>
              {cart.length === 0 ? (
                <p className="text-xs text-gray-500">{t.cartEmpty}</p>
              ) : (
                <ul className="text-xs">
                  {cart.map((c) => (
                    <li key={c.id} className="flex justify-between">
                      <span>
                        {c.emoji} {c.name}
                        {c.option && <span className="text-xs font-medium text-gray-500"> {c.option}</span>}
                      </span>
                      <span className="flex gap-2">
                        {won(c.price)}
                        <button type="button" onClick={() => removeFromCart(c.id)} aria-label={`${c.name} 빼기`} className="text-gray-500 hover:text-red-500">
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
            </div>
            {cart.length > 0 && (
              <div className="mt-3 flex">
                <KioskButton ko="결제하기" roman="gyeoljehagi" mean={t.kioskPayBtn} onClick={() => setScreen("method")} />
              </div>
            )}
          </>
        )}

        {/* 4. 옵션: HOT / ICE, 크기 */}
        {screen === "option" && picked && (
          <>
            <Big ko="옵션을 선택해 주세요" roman="obsyeoneul seontaekae juseyo" mean={t.chooseOption} />
            <p className="mt-2 text-center text-white">
              <span className="text-4xl">{picked.emoji}</span>
              <span className="block font-bold">{picked.name}</span>
            </p>
            {picked.hot && (
              <>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setIce(false)} className={pill(!ice)}>
                    🔥 HOT <span className="block text-xs font-medium">따뜻하게 · {t.hot}</span>
                  </button>
                  <button type="button" onClick={() => setIce(true)} className={pill(ice)}>
                    🧊 ICE <span className="block text-xs font-medium">차갑게 · {t.ice}</span>
                  </button>
                </div>
                <p className="mt-1 text-center text-xs font-medium text-sky-200">🧊 {t.iceTip}</p>
              </>
            )}
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setLarge(false)} className={pill(!large)}>
                레귤러 <span className="block text-xs font-medium italic">regyulleo · {t.regular}</span>
              </button>
              <button type="button" onClick={() => setLarge(true)} className={pill(large)}>
                라지 +{won(LARGE_EXTRA)} <span className="block text-xs font-medium italic">raji · {t.large}</span>
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <KioskButton ko="담기" roman="damgi" mean={t.addCart} onClick={putInCart} />
            </div>
          </>
        )}

        {/* 5. 결제 수단 */}
        {screen === "method" && (
          <>
            <Big ko="결제 수단을 선택해 주세요" roman="gyeolje sudaneul seontaekae juseyo" mean={t.payMethod} />
            <CartList items={cart} total={total} />
            {STAMPS_ON && <CouponPicker dark />}
            <div className="h-3" />
            <div className="flex gap-2">
              <KioskButton
                ko="💳 카드"
                roman="kadeu"
                mean={t.card}
                onClick={() => {
                  setPhone(false);
                  setScreen("tap");
                }}
              />
              <KioskButton
                ko="📱 휴대폰 결제"
                roman="hyudaepon gyeolje"
                mean={t.phonePay}
                onClick={() => {
                  setPhone(true);
                  setScreen("tap");
                }}
              />
            </div>
          </>
        )}

        {/* 6. 카드 꽂기 / 휴대폰 대기 */}
        {screen === "tap" && (
          <>
            {phone ? (
              <Big ko="휴대폰을 단말기에 대 주세요" roman="hyudaeponeul danmalgie dae juseyo" mean={t.tapPhone} />
            ) : (
              <Big ko="카드를 꽂아 주세요" roman="kadeureul kkoja juseyo" mean={t.kioskCard} />
            )}
            <div className="mt-4 flex">
              {tapping ? (
                <p className="flex-1 text-center text-lg font-bold text-white">{phone ? "📱" : "💳"} ··· 삐빅!</p>
              ) : phone ? (
                <KioskButton ko="📱 휴대폰 대기" roman="hyudaepon daegi" mean={t.tapPhoneBtn} onClick={tap} />
              ) : (
                <KioskButton ko="💳 카드 넣기" roman="kadeu neoki" mean={t.meCard} onClick={tap} />
              )}
            </div>
          </>
        )}

        {/* 7. 적립 */}
        {screen === "points" && (
          <>
            <Big ko="적립하시겠어요?" roman="jeongnipasigesseoyo?" mean={t.earnPoints} />
            <div className="mt-3">
              <StampRules dark />
            </div>
            {earned ? (
              <>
                <p className="mt-3 text-center text-sm font-bold text-amber-300">⭐ 적립할게요 · {t.earned}</p>
                <div className="mt-3 flex">
                  <KioskButton ko="다음" roman="daeum" mean={t.next} onClick={() => setScreen("receipt")} />
                </div>
              </>
            ) : (
              <div className="mt-4 flex gap-2">
                <KioskButton ko="⭐ 적립하기" roman="jeongnipagi" mean={t.earn} onClick={() => setEarned(true)} />
                <KioskButton ko="건너뛰기" roman="geonneottwigi" mean={t.skip} onClick={() => setScreen("receipt")} />
              </div>
            )}
          </>
        )}

        {/* 8. 영수증 */}
        {screen === "receipt" && (
          <>
            <Big ko="영수증을 출력하시겠어요?" roman="yeongsujeungeul chullyeokasigesseoyo?" mean={t.printReceipt} />
            <div className="mt-4 flex gap-2">
              <KioskButton ko="🧾 출력" roman="chullyeok" mean={t.print} onClick={() => setScreen("done")} />
              <KioskButton ko="출력 안 함" roman="chullyeok an ham" mean={t.noPrint} onClick={() => setScreen("done")} />
            </div>
          </>
        )}

        {/* 9. 끝: 진동벨 */}
        {screen === "done" && (
          <>
            <Big ko="결제가 완료되었습니다. 진동벨을 가져가세요." roman="gyeoljega wallyodoeeotseumnida. jindongbereul gajyeogaseyo." mean={t.kioskDone} />
            <div className="mt-4 flex">
              <KioskButton
                ko="📳 진동벨 받기"
                roman="jindongbel batgi"
                mean={t.takeBell}
                onClick={() => {
                  pay("bell", earned);
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
