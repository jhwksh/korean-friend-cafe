"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Hud, { HudContext } from "./Hud";
import { useLanguage } from "./LanguageProvider";
import { useOrders } from "./OrderProvider";
import { speak } from "./sound";
import type { Line } from "./surprises";
import { track } from "./tracking";

// 🤙 약속 카드: 주문이 다 끝나면(자리에 쟁반을 내려놓거나 포장 봉투를 받으면) 3초 뒤에 화면 왼쪽 아래에 작게 한 번 나온다.
// 게임을 막지 않는다 (화면 전체를 덮지 않고, ✕로 닫을 수 있고, 한 방문에 한 번만 묻는다).
const SHOWN_KEY = "kfc-promise-shown";

const ASK: Line = {
  ko: "오늘 재밌었죠? 다음엔 진짜 한국에서 같이 커피 마셔요!",
  roman: "oneul jaemiisseotjyo? daeumen jinjja hangugeseo gachi keopi masyeoyo!",
  mean: {
    en: "That was fun today, right? Next time, let's have coffee together in Korea for real!",
    de: "Es war heute schön, oder? Nächstes Mal trinken wir zusammen in Korea einen Kaffee – ganz echt!",
    ja: "今日は楽しかったですね？次は本当に韓国で一緒にコーヒーを飲みましょう！",
    zh: "今天玩得开心吧？下次我们真的在韩国一起喝咖啡吧！",
    es: "Hoy fue divertido, ¿verdad? ¡La próxima vez tomemos un café juntos en Corea de verdad!",
    vi: "Hôm nay vui nhỉ? Lần sau chúng ta cùng uống cà phê thật ở Hàn Quốc nhé!",
    ru: "Сегодня было весело, правда? В следующий раз выпьем кофе вместе в настоящей Корее!",
  },
};

const YES: Line = {
  ko: "🤙 좋아요, 약속!",
  roman: "joayo, yaksok!",
  mean: {
    en: "Sure, it's a promise!",
    de: "Klar, versprochen!",
    ja: "いいですね、約束です！",
    zh: "好呀，说定了！",
    es: "¡Claro, lo prometo!",
    vi: "Được, hứa nhé!",
    ru: "Хорошо, обещаю!",
  },
};

const YES_REPLY: Line = {
  ko: "새끼손가락 걸고, 도장 꾹! 🤙",
  roman: "saekkisonkkarak geolgo, dojang kkuk!",
  mean: {
    en: "Pinky promise, and stamp it with our thumbs! 🤙",
    de: "Kleiner-Finger-Versprechen und mit dem Daumen draufdrücken! 🤙",
    ja: "小指きりして、親指でぎゅっと押印！🤙",
    zh: "拉勾勾，再盖个章！🤙",
    es: "¡Promesa con el meñique y sello con el pulgar! 🤙",
    vi: "Móc ngoéo rồi đóng dấu bằng ngón cái nhé! 🤙",
    ru: "Мизинчик за мизинчик и печать большим пальцем! 🤙",
  },
};

const UNSURE: Line = {
  ko: "🤔 음… 아직 잘 모르겠어요.",
  roman: "eum… ajik jal moreugesseoyo.",
  mean: {
    en: "Hmm… I'm not sure yet.",
    de: "Hmm… Ich bin mir noch nicht sicher.",
    ja: "うーん…まだよくわかりません。",
    zh: "嗯……我还不太确定。",
    es: "Mmm… todavía no estoy seguro.",
    vi: "Ừm… mình vẫn chưa chắc lắm.",
    ru: "Хм… пока не знаю.",
  },
};

const UNSURE_REPLY: Line = {
  ko: "괜찮아요! 천천히 생각해요 😊",
  roman: "gwaenchanayo! cheoncheonhi saenggakaeyo",
  mean: {
    en: "That's okay! Take your time 😊",
    de: "Kein Problem! Denk in Ruhe darüber nach 😊",
    ja: "大丈夫ですよ！ゆっくり考えましょう 😊",
    zh: "没关系！慢慢想就好 😊",
    es: "¡No pasa nada! Tómate tu tiempo 😊",
    vi: "Không sao đâu! Cứ từ từ suy nghĩ nhé 😊",
    ru: "Ничего страшного! Подумай спокойно 😊",
  },
};

// 친구 말: 한국어 굵게 + KR 로마자 + 내 언어 뜻 (🤙은 따로 담아 살짝 튀게 할 수 있다)
function FriendLine({ line, mean, pop }: { line: Line; mean: string; pop?: boolean }) {
  const [before, after] = line.ko.split("🤙");
  return (
    <>
      <p className="text-sm font-bold">
        {before}
        {after !== undefined && <span className={pop ? "inline-block -rotate-12 animate-[stamp-pop_0.5s_ease-out]" : "inline-block"}>🤙</span>}
        {after}
      </p>
      <p className="text-[0.8rem] font-semibold italic text-gray-600">KR: {line.roman}</p>
      <p className="text-[0.8rem] font-medium text-gray-600">{mean}</p>
    </>
  );
}

// 대답 버튼: 한국어 + KR 로마자 + 내 언어 뜻
function AnswerButton({ line, mean, onClick }: { line: Line; mean: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-xl bg-amber-50 px-2 py-1.5 text-left text-sm font-bold text-[#5c3a1c] shadow hover:bg-amber-100">
      {line.ko}
      <span className="block text-[0.7rem] font-semibold italic text-gray-600">KR: {line.roman}</span>
      <span className="block text-[0.7rem] font-medium text-gray-600">{mean}</span>
    </button>
  );
}

export default function PromiseCard() {
  const { doneCount } = useOrders();
  const { lang, t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [reply, setReply] = useState<"yes" | "unsure" | null>(null);
  const [hud, setHud] = useState<HTMLDivElement | null>(null);
  const lastDone = useRef(doneCount); // 마지막으로 본 주문 끝난 횟수
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 주문이 끝나면 3초 뒤에 카드를 띄운다 (이번 방문에 이미 띄웠으면 안 띄운다)
  useEffect(() => {
    if (doneCount === lastDone.current) return;
    lastDone.current = doneCount;
    if (doneCount === 0) return;
    let shown = false;
    try {
      shown = sessionStorage.getItem(SHOWN_KEY) === "1";
    } catch {}
    if (shown) return;
    showTimer.current = setTimeout(() => {
      showTimer.current = null;
      try {
        sessionStorage.setItem(SHOWN_KEY, "1");
      } catch {}
      setVisible(true);
      speak(ASK.ko); // 묻는 말은 카드가 나올 때 한 번 읽어 준다
    }, 3000);
    return () => {
      if (showTimer.current) {
        clearTimeout(showTimer.current);
        showTimer.current = null;
      }
    };
  }, [doneCount]);

  // 화면을 떠날 때 남은 타이머를 지운다
  useEffect(
    () => () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  function hide() {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setVisible(false);
    setReply(null);
  }

  function answer(kind: "yes" | "unsure") {
    track("promise", { answer: kind });
    setReply(kind);
    speak(kind === "yes" ? YES_REPLY.ko : UNSURE_REPLY.ko); // 친구 대답 말도 나올 때 읽어 준다
    // 대답 뒤 친구 말을 보여 주고 3초 뒤에 저절로 사라진다
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(hide, 3000);
  }

  function close() {
    if (!reply) track("promise", { answer: "none" }); // 대답 없이 ✕로 닫았을 때만
    hide();
  }

  if (!visible) return null;

  // Hud는 카페 화면 안쪽 층에만 있어서, 이 자리에서는 창을 띄울 층을 하나 만들어 준다
  return (
    <div ref={setHud} className="pointer-events-none fixed inset-0 z-[45]">
      {hud && (
        <HudContext.Provider value={hud}>
          <Hud>
            <div className="pointer-events-auto absolute bottom-20 left-3 z-[45] w-[290px] max-w-[calc(100vw-24px)] rounded-2xl bg-white p-3 pr-8 text-[#5c3a1c] shadow-xl">
              <button type="button" onClick={close} aria-label={t.close} className="absolute right-2 top-2 text-gray-500 hover:text-gray-700">
                ✕
              </button>
              <div className="flex items-end gap-2">
                <Image src="/friend.png" alt="" width={30} height={56} className="h-[52px] w-auto shrink-0" />
                <div className="min-w-0 flex-1">
                  {reply ? (
                    <FriendLine line={reply === "yes" ? YES_REPLY : UNSURE_REPLY} mean={(reply === "yes" ? YES_REPLY : UNSURE_REPLY).mean[lang]} pop={reply === "yes"} />
                  ) : (
                    <>
                      <FriendLine line={ASK} mean={ASK.mean[lang]} />
                      <div className="mt-2 flex flex-col gap-1.5">
                        <AnswerButton line={YES} mean={YES.mean[lang]} onClick={() => answer("yes")} />
                        <AnswerButton line={UNSURE} mean={UNSURE.mean[lang]} onClick={() => answer("unsure")} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Hud>
        </HudContext.Provider>
      )}
    </div>
  );
}
