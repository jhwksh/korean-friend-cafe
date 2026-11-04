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
  const romanWords = roman.split(" ");
  const mark = (i: number) => (i === at ? "rounded bg-yellow-300 text-[#2a1c10] [text-shadow:none]" : "");
  const sub = tone === "dark" ? "text-gray-300" : "text-gray-500";

  return (
    <div className={className}>
      <p className="font-bold">
        {koWords.map((w, i) => (
          <span key={i} className={`transition-colors ${mark(i)}`}>
            {w}
            {i < koWords.length - 1 ? " " : ""}
          </span>
        ))}{" "}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            speakAlong(koWords, setAt);
          }}
          aria-label={`${ko} 듣기`}
          className="inline-grid h-5 w-5 place-items-center rounded-full bg-amber-100 align-middle text-[11px] hover:bg-amber-200"
        >
          🔊
        </button>
      </p>
      <p className={`text-xs italic ${sub}`}>
        KR:{" "}
        {romanWords.map((w, i) => (
          <span key={i} className={`transition-colors ${mark(i)}`}>
            {w}
            {i < romanWords.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      {mean && <p className={`text-xs ${sub}`}>{mean}</p>}
    </div>
  );
}
