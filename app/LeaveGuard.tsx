"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Dialog, ISay } from "./Checkout";
import { HudContext } from "./Hud";
import { useLanguage } from "./LanguageProvider";
import { useOrders } from "./OrderProvider";
import type { Line } from "./surprises";
import { track } from "./tracking";

// 🚪 주문하던 중에 뒤로 가기를 누르면 딱 한 번만 물어본다.
// 강요하지 않는다: "나갈게요"를 누르면 바로 나간다.
const ASK: Line = {
  ko: "어? 벌써 가요? 주문하던 거 있어요!",
  roman: "eo? beolsseo gayo? jumunhadeon geo isseoyo!",
  mean: {
    en: "Huh? Leaving already? You still have an order in progress!",
    de: "Hä? Schon gehen? Du hast noch eine Bestellung laufen!",
    ja: "え？もう帰るの？注文してるものがあるよ！",
    zh: "咦？这就要走吗？你还有正在点的单呢！",
    es: "¿Eh? ¿Ya te vas? ¡Todavía tienes un pedido en marcha!",
    vi: "Ơ? Về sớm thế à? Bạn còn món đang đặt mà!",
  },
};

const STAY: Line = {
  ko: "더 있을게요.",
  roman: "deo isseulgeyo.",
  mean: {
    en: "I'll stay a bit longer.",
    de: "Ich bleibe noch etwas.",
    ja: "もう少しいます。",
    zh: "我再待一会儿。",
    es: "Me quedo un poco más.",
    vi: "Mình ở lại thêm chút nữa.",
  },
};

const LEAVE: Line = {
  ko: "나갈게요.",
  roman: "nagalgeyo.",
  mean: {
    en: "I'll go now.",
    de: "Ich gehe jetzt.",
    ja: "もう出ます。",
    zh: "我走了。",
    es: "Me voy ya.",
    vi: "Mình đi đây.",
  },
};

const LEAVING_KEY = "kfc-leaving";

export default function LeaveGuard() {
  const { cart, step, carrying } = useOrders();
  const { lang } = useLanguage();
  // 주문 중 = 주문서에 담은 것이 있거나, 계산·받기 단계이거나, 쟁반을 들고 있을 때
  const ordering = cart.length > 0 || step !== "ordering" || carrying.length > 0;
  const [open, setOpen] = useState(false);
  const [hud, setHud] = useState<HTMLDivElement | null>(null);
  const armed = useRef(false); // 뒤로 가기 한 칸을 만들어 두었는지
  const asked = useRef(false); // 이번 방문에 이미 물어봤는지
  const leaving = useRef(false); // "나갈게요": 카페 칸을 다 건너뛰고 진짜로 나가는 중

  // 🚪 진짜로 나간다. 새로고침을 했으면 뒤에 카페 칸이 더 남아 있을 수 있어서,
  // 잠깐(5초) 표시를 남겨 두고 카페 칸에 다시 도착하면 계속 뒤로 간다 (나가고 싶은 사람을 붙잡지 않는다)
  function goAway() {
    leaving.current = true;
    try {
      sessionStorage.setItem(LEAVING_KEY, String(Date.now()));
    } catch {}
    history.back();
  }

  // 나가는 중에 카페 칸에 다시 도착했으면(예전 새로고침에서 남은 칸) 멈추지 않고 계속 뒤로 간다
  useEffect(() => {
    let at = 0;
    try {
      at = Number(sessionStorage.getItem(LEAVING_KEY)) || 0;
      sessionStorage.removeItem(LEAVING_KEY);
    } catch {}
    if (at && Date.now() - at < 5000) goAway();
  }, []);

  // 주문 중이 되면 뒤로 가기 한 칸을 미리 만들어 둔다. 그 칸에서 뒤로 가면(popstate) 창을 띄운다
  useEffect(() => {
    if (!ordering || armed.current || asked.current || leaving.current) return;
    armed.current = true;
    // 새로고침했으면 이미 그 칸 위에 있다: 또 만들지 않는다 (칸이 계속 쌓이지 않게)
    if (history.state?.kfcLeaveGuard) return;
    // Next.js가 쓰는 history 상태를 지우지 않게 그대로 두고 표시만 더한다
    history.pushState({ ...history.state, kfcLeaveGuard: true }, "");
  }, [ordering]);

  useEffect(() => {
    function onPop() {
      if (leaving.current) return goAway(); // 나가는 중: 남은 카페 칸을 건너뛴다
      if (!armed.current) return;
      armed.current = false; // 뒤로 가면서 만들어 둔 칸을 썼다
      // 이미 한 번 물었거나 주문 중이 아니면 묻지 않고 바로 나간다 (한 번 더 누르게 하지 않는다)
      if (asked.current || !ordering) return goAway();
      asked.current = true; // 한 번 물은 뒤에는 다시 막지 않는다
      setOpen(true);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [ordering]);

  function stay() {
    track("leave_ask", { stay: true });
    setOpen(false);
    // 다시 한 칸 만들어 둔다 (바로 나가지 않게)
    armed.current = true;
    history.pushState({ ...history.state, kfcLeaveGuard: true }, "");
  }

  function leave() {
    track("leave_ask", { stay: false });
    setOpen(false);
    goAway(); // 진짜로 나간다
  }

  if (!open) return null;

  // Dialog는 화면 맨 위 층(Hud)에 창을 띄운다. 이 자리는 그 층 바깥이라, 창을 띄울 자리를 하나 만들어 준다
  return (
    <div ref={setHud} className="fixed inset-0 z-[60]">
      {hud && (
        <HudContext.Provider value={hud}>
          <Dialog>
            <div className="flex items-end gap-2">
              <Image src="/friend.png" alt="" width={40} height={75} className="h-[64px] w-auto" />
              <div className="mb-2 rounded-2xl rounded-bl-none bg-sky-50 px-3 py-2 text-sm shadow">
                <p className="font-bold">{ASK.ko}</p>
                <p className="text-[0.8rem] font-semibold italic text-gray-600">KR: {ASK.roman}</p>
                <p className="text-[0.8rem] font-medium text-gray-600">{ASK.mean[lang]}</p>
              </div>
            </div>
            <ISay ko={STAY.ko} roman={STAY.roman} mean={STAY.mean[lang]} onClick={stay} />
            <ISay ko={LEAVE.ko} roman={LEAVE.roman} mean={LEAVE.mean[lang]} onClick={leave} />
          </Dialog>
        </HudContext.Provider>
      )}
    </div>
  );
}
