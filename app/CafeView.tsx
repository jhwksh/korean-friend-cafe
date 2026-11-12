"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import Panorama, { type PanoFocus, type PanoMarker } from "./Panorama";
import MissionButton from "./MissionButton";
import MyTable from "./MyTable";
import { useOrders } from "./OrderProvider";
import type { MissionId } from "./missions";
import WordTag from "./WordTag";
import type { WordKey } from "./words";

// 360 카페 사진 속 숨은 단어 자리 (lon: 사진 왼쪽 끝부터 0~360도, lat: 위 90 ~ 아래 -90도)
const PANO_WORDS: [WordKey, number, number][] = [
  ["chair", 138, -18],
  ["chair", 209, -16],
  ["table", 219, -20],
  ["table", 70, -25],
  ["sofa", 22, -46],
  ["cushion", 85, -22],
  ["lamp", 47, 6],
  ["chandelier", 108, 66],
  ["frame", 191, 11],
  ["stairs", 180, -14],
  ["pot", 170, -18],
  ["tv", 300, 9],
  ["aircon", 333, 50],
  ["coatRack", 329, -14],
  ["floor", 180, -63],
  ["ceiling", 252, 72],
  ["brick", 198, 13],
  ["railing", 130, 11],
  ["door", 249, -4],
  ["lamp", 103, 4],
  ["lamp", 338, 5],
  ["chair", 347, -16],
  ["table", 5, -18],
  ["ceilingLight", 194, 26],
  ["ceilingLight", 181, 22],
  ["painting", 83, 9],
  ["painting", 270.6, -1.5], // 문 옆 왕 그림의 액자 아래쪽
  ["painting", 11, 9],
  ["flower", 296, -17],
  ["plant", 261, -2],
  ["pillar", 162, 18],
  ["outlet", 339, -26],
  ["cctv", 346, 36],
  ["radiator", 265, -13],
  ["tablecloth", 63, -22],
  ["upstairs", 124, 6],
  ["sofa", 277, -31],
  ["sofa", 313, -29],
  ["cushion", 281, -19],
  ["cushion", 317, -24],
  ["cushion", 34, -29],
  ["table", 297, -27],
  ["table", 113, -14],
  ["chair", 229, -16],
  ["wall", 306, 22],
  ["arch", 274, 18.2], // 둥근 벽의 아치 테두리 맨 위
  ["floor", 30, -62],
  ["ceiling", 100, 80],
  // 그림이나 물건에서 크게 잘 보이는 것만 (작은 그림 속 물건은 360에서 잘 안 보여서 뺐다)
  ["bird", 192.8, 4.9], // 새 그림은 작아도 새인 게 바로 보인다
  ["light", 211.9, 4.3],
  ["dress", 83, 1],
  ["king", 273, 6], // 왕의 얼굴
  // 색깔 단어는 크고 눈에 띄는 물건에: 노란 쿠션, 빨간 쿠션, 초록 식물
  ["yellow", 85, -21],
  ["red", 94, -24],
  ["green", 170, -9],
];
// 360 카페 속 ⭐ 미션 자리 (미션 8: 소파, 미션 9: 계단, 미션 10: 문)
const PANO_MISSIONS: [MissionId, number, number][] = [
  ["sit", 46, -36],
  ["restroom", 184, -8],
  ["bye", 252, 2],
];
// 🖼️ 숨은 그림 찾기: 새 그림 액자 벽(public/frames-wall.jpg, 360 원본에서 크게 잘라 냄)을 크게 열고,
// 그림 속 물건 자리(가로 %, 세로 %)에 숨은 단어를 찾는다. 360에서는 너무 작아 안 보이는 것들이다.
const FRAME_WORDS: [WordKey, number, number][] = [
  ["bird", 12.2, 38.5],
  ["flower", 20.4, 33],
  ["branch", 33.4, 41.6],
  ["butterfly", 12.6, 62.8],
  ["grass", 11.4, 70.6],
  ["wing", 21.6, 68.3],
  ["nest", 32.6, 74.6],
  ["light", 48, 42.4],
  ["tail", 67.4, 34.8], // 오른쪽 위 새의 꼬리
  ["leaf", 77, 32.2],
  ["yellow", 90.4, 32.2],
  ["green", 66, 68.3],
  ["nest", 77.2, 72.2],
  ["berry", 91.5, 72.6], // 분홍 열매
  ["frame", 9, 28],
  ["brick", 52.9, 88],
];

// 🪑 앉는 자리: 새 그림 액자 벽 앞의 동그란 탁자와 회색 의자 2개. 앉으면 이 탁자를 가까이 내려다본다
const SEAT = { lon: 219, lat: -12 };
const SEATED_VIEW: PanoFocus = { lon: 219, lat: -16, fov: 45 };

const BASE_MARKERS: PanoMarker[] = [
  ...PANO_WORDS.map(([word, lon, lat], i) => ({
    id: `${word}-${i}`,
    lon,
    lat,
    node: <WordTag word={word} />,
  })),
  ...PANO_MISSIONS.map(([mission, lon, lat]) => ({
    id: `mission-${mission}`,
    lon,
    lat,
    node: <MissionButton id={mission} />,
  })),
];

// 카페 화면을 두 가지로 볼 수 있다: 지금의 2D 카페, 또는 360° 둘러보기.
// 360 사진: Poly Haven "Comfy Cafe" (CC0, 누구나 무료로 사용 가능)
export default function CafeView({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [look360, setLook360] = useState(false);
  const [framesOpen, setFramesOpen] = useState(false);
  const [seated, setSeated] = useState(false);
  // 📳 받으러 가는 동안에는 계산대(2D)를 보여 준다. 받고 나면 있던 자리(360)로 돌아온다
  const { pickupOpen } = useOrders();
  const show360 = look360 && !pickupOpen;

  // 360 단어들 + 새 그림 액자 옆 "숨은 그림 찾기" 표시판 (누르면 액자 벽을 크게 연다) + 🪑 앉기 버튼
  const markers = useMemo<PanoMarker[]>(
    () => [
      ...BASE_MARKERS,
      {
        id: "hidden-picture-sign",
        lon: 211,
        lat: 15,
        node: (
          <button
            type="button"
            onClick={() => setFramesOpen(true)}
            className="-translate-x-1/2 whitespace-nowrap rounded-full border-2 border-amber-400 bg-white/95 px-3 py-1 text-left text-xs font-bold text-[#5c3a1c] shadow-lg animate-[word-glow_2.4s_ease-in-out_infinite] hover:bg-amber-50"
          >
            🖼️ 숨은 그림 찾기
            <span className="block text-[10px] font-normal text-gray-500">{t.hiddenPicture}</span>
          </button>
        ),
      },
      {
        id: "seat",
        ...SEAT,
        node: (
          <button
            type="button"
            onClick={() => setSeated(true)}
            className="-translate-x-1/2 whitespace-nowrap rounded-full border-2 border-amber-400 bg-white/95 px-3 py-1 text-left text-xs font-bold text-[#5c3a1c] shadow-lg animate-[word-glow_2.4s_ease-in-out_infinite] hover:bg-amber-50"
          >
            🪑 여기 앉기
            <span className="block text-[10px] font-normal text-gray-500">{t.sitHere}</span>
          </button>
        ),
      },
    ],
    [t.hiddenPicture, t.sitHere],
  );

  return (
    <>
      {show360 ? (
        <div className="absolute inset-0 z-30 select-none bg-black">
          <Panorama src="/cafe-360.jpg" markers={markers} focus={seated ? SEATED_VIEW : null} />
          {seated && (
            <MyTable
              onStand={() => setSeated(false)}
              onHiddenPicture={() => {
                // 구경하러 일어나서 숨은 그림 찾기 액자 벽을 연다
                setSeated(false);
                setFramesOpen(true);
              }}
            />
          )}
          {framesOpen && (
            <div className="absolute inset-0 z-[45] flex flex-col items-center justify-center gap-2 bg-black/85 p-3">
              <p className="text-sm font-bold text-white">🖼️ 숨은 그림 찾기 · {t.typePrompt}</p>
              {/* 액자 벽 사진 위에 숨은 단어 (가로·세로 %로 자리를 잡는다) */}
              <div className="relative w-full" style={{ aspectRatio: "1228 / 637" }}>
                <Image src="/frames-wall.jpg" alt="" fill sizes="60vw" className="rounded-lg object-cover" />
                {/* ⭐ 미션: 새 그림을 보고 "새가 있어요" */}
                <MissionButton id="picture" className="left-[3%] top-[22%]" />
                {FRAME_WORDS.map(([word, x, y], i) => (
                  <div key={`${word}-${i}`} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                    <WordTag word={word} />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFramesOpen(false)}
                className="rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-[#5c3a1c] shadow-lg hover:bg-white"
              >
                ↩ 360으로 돌아가기 · {t.back360}
              </button>
            </div>
          )}
          {!seated && (
            <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              👆 {t.dragHint}
            </p>
          )}
        </div>
      ) : (
        children
      )}

      <button
        type="button"
        onClick={() => {
          setLook360((v) => !v);
          setFramesOpen(false);
          setSeated(false);
        }}
        className="absolute left-3 top-3 z-40 rounded-full bg-white/90 px-3 py-1 text-left text-sm font-semibold text-[#5c3a1c] shadow-lg hover:bg-white"
      >
        {look360 ? "↩ 카페로 돌아가기" : "🌀 둘러보기"}
        <span className="block text-[10px] font-normal text-gray-500">{look360 ? t.back2d : t.look360}</span>
      </button>
      {/* 🏠 360에서 2D 카페로 돌아가는 큰 버튼 (왼쪽 위 작은 버튼은 잘 안 보여서, 아래 왼쪽에 크게 하나 더) */}
      {look360 && (
        <button
          type="button"
          onClick={() => {
            setLook360(false);
            setFramesOpen(false);
            setSeated(false);
          }}
          className="absolute bottom-4 left-4 z-50 rounded-2xl bg-orange-500 px-5 py-2 text-left text-lg font-bold text-white shadow-[0_6px_14px_rgba(0,0,0,0.45)] ring-2 ring-white hover:bg-orange-600"
        >
          🏠 카페로 돌아가기
          <span className="block text-xs font-medium text-orange-50">{t.back2d}</span>
        </button>
      )}
    </>
  );
}
