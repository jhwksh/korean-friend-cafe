"use client";

import Image from "next/image";
import { useState } from "react";
import { Dialog, ISay, StaffSays } from "./Checkout";
import { useLanguage } from "./LanguageProvider";
import { useOrders } from "./OrderProvider";
import { DRINKS, judgeOrder, type Judged, type MenuEntry } from "./orderJudge";
import SpeakLine from "./SpeakLine";
import { track } from "./tracking";

// 🗣️ 카운터에서 점원에게 말로 주문하기. 점원(바리스타)을 누르면 열린다.
// 1. 고르기: 👆 버튼(레벨 1, 지금처럼 메뉴판) / 🧩 블록(레벨 2) / 🎤 말하기(레벨 3, 다음 단계에서 만든다)
// 2. 🧩 블록: 낱말 블록을 눌러 문장을 만들고 "말하기" → 대본으로 판정(orderJudge.ts)
//    점원은 한국어로만 말하고, 뜻이 통하면 주문을 받는다. 별(평가)은 한국어 친구가 준다.
// 3. "다음"을 누르면 주문서에 담기고, 점원 계산(드시고 가세요? → 결제 → 진동벨)으로 이어진다.

type Way = "pick" | "tap" | "blocks";
type Block = { ko: string; roman: string };

// 블록: 아이스 + 음료 이름 + 한 잔 + 주세요. (블록 안의 띄어쓰기 수와 발음의 띄어쓰기 수를 맞춘다: 형광펜용)
const BLOCKS: Block[] = [
  { ko: "아이스", roman: "aiseu" },
  ...DRINKS.map((d) => ({ ko: d.name, roman: d.roman })),
  { ko: "한 잔", roman: "han jan" },
  { ko: "주세요", roman: "juseyo" },
];

export default function CounterTalk({ onClose, onDone }: { onClose: () => void; onDone: (item: MenuEntry, ice: boolean) => void }) {
  const { t } = useLanguage();
  const { addOrderStars } = useOrders();
  const [way, setWay] = useState<Way>("pick");
  const [picked, setPicked] = useState<number[]>([]); // 고른 블록 번호 (순서대로)
  const [result, setResult] = useState<Judged | null>(null);
  const [confirmed, setConfirmed] = useState(false); // 점원이 주문을 알아들었다 (⭐ 1개일 때는 "네, 맞아요" 뒤)

  const ko = picked.map((i) => BLOCKS[i].ko).join(" ");
  const roman = picked.map((i) => BLOCKS[i].roman).join(" ");

  function say() {
    const judged = judgeOrder(ko);
    setResult(judged);
    if (judged.stars === 0) {
      setPicked([]); // 다시 만들어 보게 비운다
      return;
    }
    addOrderStars(judged.stars);
    if (judged.stars >= 2) setConfirmed(true);
  }

  return (
    <Dialog onClose={onClose}>
      {way === "pick" && (
        <>
          {/* 누른 사람(남자 점원)이 말한다. 고르는 버튼은 사람 그림 없이 아래에 작게 */}
          <StaffSays ko="어서 오세요! 주문하시겠어요?" roman="eoseo oseyo! jumunhasigesseoyo?" mean={`${t.welcome} ${t.staffAskOrder}`} />
          <p className="mt-2 text-xs font-medium text-gray-500">🙋 {t.howOrder}</p>
          <div className="mt-1 grid grid-cols-3 gap-2">
            <WayButton icon="👆" ko="버튼" mean={t.wayTap} onClick={() => {
                setWay("tap");
                track("talk_way", { way: "tap" });
              }} />
            <WayButton icon="🧩" ko="블록" mean={t.wayBlocks} onClick={() => {
                setWay("blocks");
                track("talk_way", { way: "blocks" });
              }} />
            <WayButton icon="🎤" ko="말하기" mean={`${t.wayVoice} · ${t.soon}`} disabled />
          </div>
        </>
      )}

      {way === "tap" && (
        <div className="text-center">
          <SpeakLine ko="메뉴판을 눌러 골라 주세요" roman="menyupaneul nulleo golla juseyo" mean={t.tapHint} autoPlay className="text-sm" />
          <button type="button" onClick={onClose} className="mt-3 rounded-full bg-amber-400 px-5 py-1.5 text-sm font-semibold text-white hover:bg-amber-500">
            👌 {t.close}
          </button>
        </div>
      )}

      {way === "blocks" && (
        <>
          {/* 점원의 말: 처음 "주문하시겠어요?" / 못 알아들으면 "네? 다시 한번…" / ⭐1 "아~ ○○요?" / ⭐2·3 "네, ○○ 한 잔이요." */}
          {!result || result.stars === 0 ? (
            result ? (
              <StaffSays ko="네? 다시 한번 말씀해 주시겠어요?" roman="ne? dasi hanbeon malsseumhae jusigesseoyo?" mean={`${t.staffPardon} (${t.pardonHint})`} />
            ) : (
              <StaffSays ko="주문하시겠어요?" roman="jumunhasigesseoyo?" mean={t.staffAskOrder} />
            )
          ) : result.stars === 1 ? (
            <StaffSays ko={`아~ ${drinkKo(result)}요?`} roman={`a~ ${drinkRoman(result)}yo?`} mean={t.staffEcho} />
          ) : (
            <StaffSays ko={`네, ${drinkKo(result)} 한 잔이요.`} roman={`ne, ${drinkRoman(result)} han janiyo.`} mean={t.staffGotIt} />
          )}

          {(!result || result.stars === 0) && (
            <>
              <p className="mt-2 text-xs font-medium text-gray-500">🧩 {t.blocksHint}</p>
              {/* 만든 문장: 누르면 그 블록이 빠진다 */}
              <div className="mt-1 flex min-h-[44px] flex-wrap items-center gap-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-1.5">
                {picked.map((i, n) => (
                  <button key={n} type="button" onClick={() => setPicked((p) => p.filter((_, k) => k !== n))} className="rounded-lg bg-amber-400 px-2 py-1 text-sm font-bold text-white shadow">
                    {BLOCKS[i].ko}
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
                {BLOCKS.map((b, i) => (
                  <button
                    key={b.ko}
                    type="button"
                    disabled={picked.includes(i)}
                    onClick={() => setPicked((p) => [...p, i])}
                    className="rounded-lg border-2 border-amber-300 bg-white px-2 py-1 text-left text-sm font-bold shadow-sm hover:bg-amber-100 disabled:opacity-30"
                  >
                    {b.ko}
                    <span className="block text-[10px] font-medium italic text-gray-500">{b.roman}</span>
                  </button>
                ))}
              </div>
              {picked.length > 0 && <ISay key={ko} ko={ko} roman={roman} mean={t.say} onClick={say} />}
            </>
          )}

          {/* ⭐ 1개: 점원이 되묻는다 → "네, 맞아요." */}
          {result && result.stars === 1 && !confirmed && (
            <ISay ko="네, 맞아요." roman="ne, majayo." mean={t.meYes} onClick={() => setConfirmed(true)} />
          )}

          {/* 한국어 친구의 평가: 별 + 한마디 (고른 언어) */}
          {result && result.item && confirmed && (
            <>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 shadow ring-2 ring-sky-200">
                <Image src="/friend.png" alt="" width={40} height={75} className="h-[64px] w-auto" />
                <div>
                  <p className="text-xl tracking-wider">{"⭐".repeat(result.stars)}{"☆".repeat(3 - result.stars)}</p>
                  <p className="text-xs font-medium text-gray-700">{result.stars === 3 ? t.friend3 : result.stars === 2 ? t.friend2 : t.friend1}</p>
                </div>
              </div>
              <div className="mt-3 text-right">
                <button type="button" onClick={() => onDone(result.item!, result.ice)} className="rounded-full bg-amber-400 px-5 py-1.5 text-sm font-bold text-white shadow hover:bg-amber-500">
                  {t.next} ▶
                </button>
              </div>
            </>
          )}
        </>
      )}
    </Dialog>
  );
}

function drinkKo(r: Judged) {
  return `${r.ice ? "아이스 " : ""}${r.item!.name}`;
}
function drinkRoman(r: Judged) {
  return `${r.ice ? "aiseu " : ""}${r.item!.roman}`;
}

function WayButton({ icon, ko, mean, onClick, disabled = false }: { icon: string; ko: string; mean: string; onClick?: () => void; disabled?: boolean }) {
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
