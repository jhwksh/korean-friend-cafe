"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { CardTerminal, Dialog, ISay, StaffSays, useCardTap } from "../../Checkout";
import { useLanguage } from "../../LanguageProvider";
import SpeakLine from "../../SpeakLine";
import { playBeep } from "../../sound";
import { POINTS_DONE, POINTS_FRIEND, POINTS_STAFF, type Line } from "../../surprises";
import { track } from "../../tracking";
import { ASKS, buildSeq, won, type Ask, type Basket, type StepId, type Way } from "./data";
import { judgeBlocks } from "./judge";
import {
  AGAIN,
  BLOCKS_HINT,
  BYE,
  CARD_BTN,
  CART_TITLE,
  CONFIRM,
  GREET,
  OK_ACK,
  PARDON,
  PAY,
  PRACTICE_PRICE,
  PRAISE_1,
  PRAISE_2,
  PRAISE_3,
  RESULT_TITLE,
  SCANNING,
  SOON,
  TO_CAFE,
  TOTAL,
  WAIT,
  WAY_BLOCKS,
  WAY_TAP,
  WAY_TITLE,
  WAY_VOICE,
} from "./text";

// 🏪 계산대 창: 장바구니 → 어떻게 대답할지 고르기 → 바코드 찍기 → 점원 질문 → 결제 → 영수증 → 끝.
// 카페 Checkout.tsx의 Dialog·StaffSays·ISay·CardTerminal·useCardTap을 그대로 쓴다 (고치지 않는다).
type Phase = "way" | "scan" | "ask" | "good" | "heat" | "points" | "echo" | "end";

const STARS_KEY = "kfc-store-stars"; // 이 브라우저에 남는 가장 좋은 별 점수

// 가장 좋은 점수만 저장한다 (읽기·쓰기가 안 되는 브라우저에서도 계산은 그대로)
function saveBest(stars: number) {
  try {
    const before = Number(localStorage.getItem(STARS_KEY) ?? 0);
    if (!Number.isFinite(before) || stars > before) localStorage.setItem(STARS_KEY, String(stars));
  } catch {}
}

export default function StoreDialog({ basket, onClose, onAgain }: { basket: Basket; onClose: () => void; onAgain: () => void }) {
  const { t, lang } = useLanguage();
  const [way, setWay] = useState<Way | null>(null);
  const [phase, setPhase] = useState<Phase>("way");
  const [seq, setSeq] = useState<StepId[]>([]);
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<0 | 1 | 2 | 3 | null>(null);
  const [wrong, setWrong] = useState(0);
  const [stars, setStars] = useState<number[]>([]);
  const [scanned, setScanned] = useState(0);
  // 마지막 화면에서 세기를 두 번 보내지 않게 (버튼을 두 번 눌러도 한 번만)
  const ended = useRef(false);

  const step: StepId | undefined = seq[at];
  const ask = step && step !== "pay" ? ASKS[step] : null;

  // 다음 질문으로. 마지막 질문이면 끝 화면으로 가면서 세기(track)를 보낸다.
  const goNext = useCallback(() => {
    setPicked([]);
    setResult(null);
    setWrong(0);
    const next = at + 1;
    if (next >= seq.length) {
      setPhase("end");
      if (ended.current) return;
      ended.current = true;
      const chosen = way ?? "tap";
      track("store_done", { basket: basket.id, way: chosen });
      if (chosen === "blocks") {
        const avg = Math.round(stars.reduce((sum, n) => sum + n, 0) / Math.max(1, stars.length));
        track("store_stars", { stars: avg });
        saveBest(avg);
      }
      return;
    }
    setAt(next);
    setPhase("ask");
  }, [at, seq.length, way, basket.id, stars]);

  // 💳 카드를 꽂으면 "삑!" + 단말기 말이 끝난 뒤 영수증 질문으로 간다
  const [tapping, tap] = useCardTap(goNext);

  // 🧾 바코드 찍기: 물건마다 0.5초 간격으로 "삑", 다 찍으면 첫 질문
  useEffect(() => {
    if (phase !== "scan") return;
    const beeps = basket.items.map((_, i) =>
      setTimeout(() => {
        playBeep();
        setScanned(i + 1);
      }, i * 500),
    );
    const done = setTimeout(() => setPhase("ask"), basket.items.length * 500 + 700);
    return () => {
      beeps.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [phase, basket]);

  // ♨️ "네, 데워 주세요." → "잠시만요." 2초 뒤 다음 질문
  useEffect(() => {
    if (phase !== "heat") return;
    playBeep();
    const timer = setTimeout(goNext, 2000);
    return () => clearTimeout(timer);
  }, [phase, goNext]);

  function chooseWay(next: Way) {
    setWay(next);
    track("store_start", { way: next });
    setSeq(buildSeq(basket));
    setAt(0);
    setPhase("scan");
  }

  // 버튼 레벨: 대답 2개 중 하나
  function answerTap(i: 0 | 1) {
    if (!step || !ask) return;
    if (step === "heat" && i === 0) {
      setPhase("heat");
      return;
    }
    if (step === "points" && i === 1) {
      setPhase("points");
      return;
    }
    goNext();
  }

  // 블록 레벨: 만든 문장을 별로 판정한다
  function speakBlocks() {
    if (!ask || !step) return;
    const n = judgeBlocks(
      picked.map((i) => ask.blocks[i].ko),
      ask.correct,
      ask.key,
    );
    setResult(n);
    if (n === 0) {
      setPicked([]);
      setWrong((count) => count + 1);
      return;
    }
    setStars((list) => [...list, n]);
    if (n === 1) setPhase("echo");
    else if (step === "heat") setPhase("heat");
    else setPhase("good");
  }

  // 별을 받은 뒤 그 질문의 실제 행동으로 (데우기면 2초 기다리기, 나머지는 다음 질문)
  function finishAsk(id: StepId) {
    if (id === "heat") setPhase("heat");
    else goNext();
  }

  // 장바구니 위쪽: 물건·가격·합계 (바코드를 찍는 동안에는 ✓가 하나씩 생긴다)
  const scannedCount = phase === "way" ? 0 : phase === "scan" ? scanned : basket.items.length;

  return (
    <Dialog onClose={onClose}>
      <CartHeader basket={basket} scanned={scannedCount} />

      {phase === "way" && (
        <>
          <StaffSays ko={GREET.ko} roman={GREET.roman} mean={GREET.mean[lang]} />
          <p className="mt-2 text-center text-xs font-medium text-gray-500">
            🙋 {WAY_TITLE.ko} · {WAY_TITLE.mean[lang]}
          </p>
          <div className="mt-1 grid grid-cols-3 gap-2">
            <WayButton icon="👆" ko={WAY_TAP.ko} mean={WAY_TAP.mean[lang]} onClick={() => chooseWay("tap")} />
            <WayButton icon="🧩" ko={WAY_BLOCKS.ko} mean={WAY_BLOCKS.mean[lang]} onClick={() => chooseWay("blocks")} />
            {/* 🎤 말하기는 다음 단계에서 만든다 (지금은 누를 수 없다) */}
            <WayButton icon="🎤" ko={WAY_VOICE.ko} mean={`${SOON.ko} · ${SOON.mean[lang]}`} disabled />
          </div>
        </>
      )}

      {phase === "scan" && (
        <div className="py-2 text-center">
          <p className="text-4xl">🧾</p>
          <p className="mt-1 text-sm font-bold">{SCANNING.ko}</p>
          <p className="text-xs text-gray-500">{SCANNING.mean[lang]}</p>
          <p className="mt-2 animate-pulse text-2xl font-extrabold tracking-widest text-amber-500">삑! 삑!</p>
        </div>
      )}

      {phase !== "way" && phase !== "scan" && phase !== "end" && (
        <>
          {/* 🧑‍🍳 지금 점원이 하는 말 */}
          {phase === "heat" ? (
            <StaffSays ko={WAIT.ko} roman={WAIT.roman} mean={WAIT.mean[lang]} />
          ) : phase === "points" ? (
            <StaffSays ko={POINTS_STAFF.ko} roman={POINTS_STAFF.roman} mean={POINTS_STAFF.mean[lang]} />
          ) : phase === "echo" && ask ? (
            <StaffSays ko={ask.echo.ko} roman={ask.echo.roman} mean={ask.echo.mean[lang]} />
          ) : phase === "good" ? (
            <StaffSays ko={OK_ACK.ko} roman={OK_ACK.roman} mean={OK_ACK.mean[lang]} />
          ) : step === "pay" ? (
            <StaffSays ko={PAY.ko} roman={PAY.roman} mean={PAY.mean[lang]} />
          ) : ask && result === 0 ? (
            <StaffSays ko={PARDON.ko} roman={PARDON.roman} mean={PARDON.mean[lang]} />
          ) : ask ? (
            <StaffSays ko={ask.staff.ko} roman={ask.staff.roman} mean={ask.staff.mean[lang]} />
          ) : null}

          {/* ♨️ 전자레인지 느낌 */}
          {phase === "heat" && <p className="my-4 animate-pulse text-center text-4xl">♨️</p>}

          {/* 포인트 적립: 점원 → 친구 → 점원 (전화번호 입력 칸은 없다) */}
          {phase === "points" && (
            <>
              <FriendNote line={POINTS_FRIEND} />
              <StaffNote line={POINTS_DONE} />
              <div className="mt-2 text-right">
                <button type="button" onClick={goNext} className="rounded-full bg-amber-400 px-5 py-1.5 text-sm font-bold text-white shadow hover:bg-amber-500">
                  {t.next} ▶
                </button>
              </div>
            </>
          )}

          {/* 💳 결제: 카드 꽂기 → 단말기 */}
          {phase === "ask" && step === "pay" && (
            <>
              {tapping ? (
                <CardTerminal kind="card" />
              ) : (
                <button
                  type="button"
                  onClick={() => tap()}
                  className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-4 text-lg font-extrabold text-white shadow hover:bg-amber-500"
                >
                  💳 {CARD_BTN.ko}
                  <span className="block text-xs font-medium">
                    KR: {CARD_BTN.roman} · {CARD_BTN.mean[lang]}
                  </span>
                </button>
              )}
            </>
          )}

          {/* 👆 버튼 레벨 / 🧩 블록 레벨 */}
          {phase === "ask" && ask && (
            <>
              {way === "tap" ? (
                ask.replies.map((reply, i) => (
                  <ISay key={reply.ko} ko={reply.ko} roman={reply.roman} mean={reply.mean[lang]} onClick={() => answerTap(i as 0 | 1)} />
                ))
              ) : (
                <>
                  {result === 0 && (
                    <SpeakLine
                      ko={ask.staff.ko}
                      roman={ask.staff.roman}
                      mean={ask.staff.mean[lang]}
                      className="mt-1 rounded-lg bg-gray-50 px-2 py-1 text-xs"
                    />
                  )}
                  <BlockBuilder ask={ask} picked={picked} setPicked={setPicked} wrong={wrong} onSay={speakBlocks} />
                </>
              )}
              <Tip text={ask.tip[lang]} />
            </>
          )}

          {/* ⭐ 1개: 점원이 되받으면 "네, 맞아요." */}
          {phase === "echo" && ask && (
            <>
              <ISay ko={CONFIRM.ko} roman={CONFIRM.roman} mean={CONFIRM.mean[lang]} onClick={() => step && finishAsk(step)} />
              <Tip text={ask.tip[lang]} />
            </>
          )}

          {/* ⭐⭐·⭐⭐⭐: 점원이 알아들었다 → 다음 */}
          {phase === "good" && (
            <>
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => step && finishAsk(step)}
                  className="rounded-full bg-amber-400 px-5 py-1.5 text-sm font-bold text-white shadow hover:bg-amber-500"
                >
                  {t.next} ▶
                </button>
              </div>
              {ask && <Tip text={ask.tip[lang]} />}
            </>
          )}
        </>
      )}

      {phase === "end" && (
        <>
          <StaffSays ko={BYE.ko} roman={BYE.roman} mean={BYE.mean[lang]} />
          {way === "blocks" && <Result stars={stars} />}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onAgain}
              className="flex-1 rounded-full bg-amber-400 px-3 py-2 text-sm font-bold text-white shadow hover:bg-amber-500"
            >
              🔁 {AGAIN.ko}
              <span className="block text-[11px] font-medium">{AGAIN.mean[lang]}</span>
            </button>
            <Link
              href="/place/cafe"
              className="flex-1 rounded-full bg-[#5c3a1c] px-3 py-2 text-center text-sm font-bold text-white shadow hover:bg-[#7a5230]"
            >
              ☕ {TO_CAFE.ko}
              <span className="block text-[11px] font-medium">{TO_CAFE.mean[lang]}</span>
            </Link>
          </div>
        </>
      )}
    </Dialog>
  );
}

// 계산대 위쪽 장바구니: 물건 이름·발음·뜻, 연습용 가격, 합계
function CartHeader({ basket, scanned }: { basket: Basket; scanned: number }) {
  const { lang } = useLanguage();
  const total = basket.items.reduce((sum, item) => sum + item.price, 0);
  return (
    <div className="mb-2 rounded-xl bg-gray-50 p-2 text-sm">
      <p className="text-xs font-bold text-gray-500">
        🧺 {CART_TITLE.ko} <span className="font-medium">· {CART_TITLE.mean[lang]}</span>
      </p>
      <ul className="my-1">
        {basket.items.map((item, i) => (
          <li key={item.line.ko} className="flex items-start justify-between gap-2">
            <span>
              <span className="font-semibold">
                {item.emoji} {item.line.ko}
              </span>
              <span className="block text-[10px] font-medium italic text-gray-500">
                KR: {item.line.roman} · {item.line.mean[lang]}
              </span>
            </span>
            <span className="shrink-0 text-right text-xs">
              {won(item.price)}
              {scanned > i && <span className="ml-1 text-green-600">✓</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="flex items-baseline justify-between border-t border-gray-200 pt-1 font-bold">
        <span>
          {TOTAL.ko} <span className="text-xs font-medium text-gray-500">{TOTAL.mean[lang]}</span>
        </span>
        <span className="text-right">
          {won(total)}
          <span className="block text-[10px] font-normal text-gray-500">
            {PRACTICE_PRICE.ko} · {PRACTICE_PRICE.mean[lang]}
          </span>
        </span>
      </p>
    </div>
  );
}

// 🧩 블록으로 문장 만들기 (카페 CounterTalk와 같은 모양)
function BlockBuilder({
  ask,
  picked,
  setPicked,
  wrong,
  onSay,
}: {
  ask: Ask;
  picked: number[];
  setPicked: Dispatch<SetStateAction<number[]>>;
  wrong: number;
  onSay: () => void;
}) {
  const { t, lang } = useLanguage();
  const ko = picked.map((i) => ask.blocks[i].ko).join(" ");
  const roman = picked.map((i) => ask.blocks[i].roman).join(" ");
  return (
    <>
      <p className="mt-2 text-xs font-medium text-gray-500">🧩 {BLOCKS_HINT[lang]}</p>
      {/* 만든 문장: 누르면 그 블록이 빠진다 */}
      <div className="mt-1 flex min-h-[44px] flex-wrap items-center gap-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-1.5">
        {picked.map((i, n) => (
          <button
            key={`${i}-${n}`}
            type="button"
            onClick={() => setPicked((p) => p.filter((_, k) => k !== n))}
            className="rounded-lg bg-amber-400 px-2 py-1 text-sm font-bold text-white shadow"
          >
            {ask.blocks[i].ko}
          </button>
        ))}
        {picked.length > 0 && (
          <button type="button" onClick={() => setPicked((p) => p.slice(0, -1))} className="ml-auto px-1 text-xs text-gray-500 underline">
            ↩️ {t.undo}
          </button>
        )}
      </div>
      {/* 블록 고르기 (한 번 쓴 블록은 흐려진다) */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ask.blocks.map((block, i) => {
          const used = picked.includes(i);
          // 두 번 틀리면 정답 블록이 살짝 반짝인다 (카페 숨은 그림처럼 힌트)
          const hint = wrong >= 2 && ask.correct.includes(block.ko);
          return (
            <button
              key={block.ko}
              type="button"
              disabled={used}
              onClick={() => setPicked((p) => [...p, i])}
              className={`rounded-lg border-2 border-amber-300 bg-white px-2 py-1 text-left text-sm font-bold shadow-sm hover:bg-amber-100 disabled:opacity-30 ${
                hint ? "animate-pulse ring-4 ring-amber-400" : ""
              }`}
            >
              {block.ko}
              <span className="block text-[10px] font-medium italic text-gray-500">{block.roman}</span>
            </button>
          );
        })}
      </div>
      {picked.length > 0 && <ISay key={ko} ko={ko} roman={roman} mean={t.say} onClick={onSay} />}
    </>
  );
}

// 🧑 점원의 짧은 말 (그림 없이 말풍선만)
function StaffNote({ line }: { line: Line }) {
  const { lang } = useLanguage();
  return (
    <SpeakLine
      ko={line.ko}
      roman={line.roman}
      mean={line.mean[lang]}
      className="mt-2 rounded-xl rounded-bl-none bg-amber-50 px-2 py-1 text-xs"
    />
  );
}

// 🧑 친구가 옆에서 한마디 (저절로 읽지 않는다. 🔊로 듣기)
function FriendNote({ line }: { line: Line }) {
  const { lang } = useLanguage();
  return (
    <div className="mt-2 flex items-end gap-1">
      <Image src="/friend.png" alt="" width={30} height={56} className="h-[52px] w-auto" />
      <SpeakLine
        ko={line.ko}
        roman={line.roman}
        mean={line.mean[lang]}
        className="rounded-xl rounded-bl-none bg-sky-50 px-2 py-1 text-xs"
      />
    </div>
  );
}

// 💡 문화 팁 상자
function Tip({ text }: { text: string }) {
  return <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-xs font-medium text-sky-900">💡 {text}</p>;
}

// ⭐ 결과: 질문별 별의 평균을 반올림해서 보여 준다
function Result({ stars }: { stars: number[] }) {
  const { lang } = useLanguage();
  const avg = Math.round(stars.reduce((sum, n) => sum + n, 0) / Math.max(1, stars.length));
  const praise = avg >= 3 ? PRAISE_3 : avg === 2 ? PRAISE_2 : PRAISE_1;
  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 shadow ring-2 ring-sky-200">
      <Image src="/friend.png" alt="" width={40} height={75} className="h-[64px] w-auto" />
      <div className="min-w-0">
        <p className="text-sm font-bold">
          {RESULT_TITLE.ko} <span className="text-xs font-medium text-gray-500">{RESULT_TITLE.mean[lang]}</span>
        </p>
        <p className="text-xl tracking-wider">
          {"⭐".repeat(avg)}
          {"☆".repeat(3 - avg)}
        </p>
        <SpeakLine ko={praise.ko} roman={praise.roman} mean={praise.mean[lang]} className="text-xs" />
      </div>
    </div>
  );
}

// 고르기 버튼 (카페 CounterTalk와 같은 모양)
function WayButton({
  icon,
  ko,
  mean,
  onClick,
  disabled = false,
}: {
  icon: string;
  ko: string;
  mean: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center rounded-xl border-2 border-amber-300 bg-amber-50 px-2 py-2 shadow hover:bg-amber-100 disabled:opacity-40"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-bold">{ko}</span>
      <span className="text-[11px] font-medium leading-tight text-gray-500">{mean}</span>
    </button>
  );
}
