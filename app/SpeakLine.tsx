"use client";

import { useEffect, useState } from "react";
import { speakAlong } from "./sound";

// 🖍️ 한국어 문장 + KR 발음 + 내 언어 뜻. 🔊를 누르면 읽는 낱말을 따라 형광펜이 옮겨 간다.
// ko와 roman은 띄어쓰기 수를 똑같이 맞춰 적는다 (낱말끼리 짝을 지어 같이 칠한다).
// tone: "light"는 흰 바탕용, "dark"는 키오스크처럼 어두운 바탕용
// autoPlay: 화면에 나오자마자 읽는다 (점원이 먼저 말을 거는 곳)
export default function SpeakLine({
  ko,
  roman,
  mean,
  tone = "light",
  autoPlay = false,
  className = "",
}: {
  ko: string;
  roman: string;
  mean?: string;
  tone?: "light" | "dark";
  autoPlay?: boolean;
  className?: string;
}) {
  const [at, setAt] = useState(-1);
  const koWords = ko.split(" ");

  useEffect(() => {
    if (autoPlay) speakAlong(ko.split(" "), setAt);
  }, [autoPlay, ko]);
  const sub = tone === "dark" ? "text-gray-200" : "text-gray-600";

  return (
    <div className={className}>
      <p className="font-bold">
        <Words text={ko} at={at} />{" "}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            speakAlong(koWords, setAt);
          }}
          aria-label={`${ko} 듣기`}
          className="inline-grid h-5 w-5 place-items-center rounded-full bg-amber-100 align-middle text-xs font-medium hover:bg-amber-200"
        >
          🔊
        </button>
      </p>
      <p className={`text-[0.8rem] font-semibold italic ${sub}`}>
        KR: <Words text={roman} at={at} />
      </p>
      {mean && <p className={`text-[0.8rem] font-medium ${sub}`}>{mean}</p>}
    </div>
  );
}

// 🖍️ 글을 띄어쓰기로 나눠 보여 주고, at번째 낱말에 노란 형광펜을 칠한다 (주문서 대답, 점원 인사, 채팅창도 같이 쓴다)
export function Words({ text, at }: { text: string; at: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i} className={`transition-colors ${i === at ? "rounded bg-yellow-300 text-[#2a1c10] [text-shadow:none]" : ""}`}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

// 🔊 + 🖍️ 한 줄짜리: 누르면 읽으면서 낱말마다 형광펜이 따라간다 (채팅창 친구 말의 연습 문장)
export function SpeakWords({ text }: { text: string }) {
  const [at, setAt] = useState(-1);
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
      <button
        type="button"
        onClick={() => speakAlong(text.split(" "), setAt)}
        aria-label={`${text} 듣기`}
        className="inline-grid h-5 w-5 place-items-center rounded-full bg-amber-100 text-[11px] hover:bg-amber-200"
      >
        🔊
      </button>
      <span>
        <Words text={text} at={at} />
      </span>
    </span>
  );
}
