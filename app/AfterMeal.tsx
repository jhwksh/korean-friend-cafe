"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { useOrders } from "./OrderProvider";
import SpeakLine from "./SpeakLine";

// 🍽️ 다 먹고 나면: "이제 카페를 구경해 볼까요?"
// 요즘 사람들은 구경하고 사진 찍는 것을 좋아한다. 한국에서는 어디서 뭘 먹었는지 사진을 찍어 SNS에 올리는 문화(인증샷)가 있다.
// 그래서 공부하라고 하지 않고, 구경하며 궁금하게 만든다:
// 📸 인증샷 찍기(한국어 해시태그), 🖼️ 숨은 그림 찾기, 👀 둘러보며 반짝이는 단어 찾기.
// 더 먹고 싶으면 탁자 위 📱 테이블 패드로 다시 주문한다.
export default function AfterMeal({
  onHiddenPicture,
  onLookAround,
  onOrderMore,
}: {
  onHiddenPicture: () => void;
  onLookAround: () => void;
  onOrderMore: () => void;
}) {
  const { t } = useLanguage();
  const { orders } = useOrders();
  const [photo, setPhoto] = useState<string | null>(null);

  // 먹은 것 이름으로 해시태그를 만든다: #카페 #토스트 #녹차라테 #맛있다 #인증샷
  const names = [...new Set(orders.map((o) => o.name))];
  const hashtags = ["#카페", ...names.map((n) => `#${n}`), "#맛있다", "#인증샷"].join(" ");

  // 📸 지금 보이는 360° 화면 + 먹은 것 + 아래 글귀(어디서, 해시태그)를 한 장의 사진으로
  function takePhoto() {
    const src = document.querySelector<HTMLCanvasElement>("canvas"); // 360° 카페 그림 (페이지에 하나뿐)
    if (!src) return;
    const w = src.width;
    const h = src.height;
    const band = Math.round(h * 0.2);
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h + band;
    const g = out.getContext("2d");
    if (!g) return;
    g.drawImage(src, 0, 0);
    // 먹은 것을 사진 아래쪽에 크게
    g.font = `${Math.round(h * 0.13)}px sans-serif`;
    g.textAlign = "center";
    g.fillText(orders.map((o) => o.emoji).join(" "), w / 2, h * 0.92);
    // 아래 흰 띠: 📍 어디서 + 해시태그
    g.fillStyle = "#fffaf2";
    g.fillRect(0, h, w, band);
    g.textAlign = "left";
    g.fillStyle = "#5c3a1c";
    g.font = `bold ${Math.round(band * 0.3)}px sans-serif`;
    g.fillText("📍 한국어 친구 카페", band * 0.25, h + band * 0.42);
    g.fillStyle = "#c26a0e";
    g.font = `${Math.round(band * 0.24)}px sans-serif`;
    g.fillText(hashtags, band * 0.25, h + band * 0.8);
    setPhoto(out.toDataURL("image/png"));
  }

  const choice = "rounded-xl bg-amber-50 px-3 py-2 text-left text-sm font-bold shadow hover:bg-amber-100";

  return (
    <div className="w-full max-w-[460px] rounded-2xl bg-white/95 p-3 text-[#5c3a1c] shadow-lg">
      {/* 친구가 먼저 말을 건다: 다 먹었으니 가기 전에 같이 둘러보자 */}
      <div className="flex items-end gap-2">
        <Image src="/friend.png" alt="" width={30} height={56} className="h-[52px] w-auto shrink-0" />
        <SpeakLine ko="다 먹었다! 가기 전에 우리 같이 둘러봐요." roman="da meogeotda! gagi jeone uri gachi dulleobwayo." mean={t.lookNow} className="min-w-0 flex-1" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" onClick={onHiddenPicture} className="rounded-xl bg-amber-400 px-3 py-2 text-left text-sm font-bold text-white shadow hover:bg-amber-500">
          🌀 같이 둘러봐요 <span className="block text-xs font-medium text-amber-50">{t.lookHidden}</span>
        </button>
        <button type="button" onClick={onLookAround} className={choice}>
          👀 혼자 볼게요 <span className="block text-xs font-medium text-gray-500">{t.standUp}</span>
        </button>
      </div>
      <p className="mt-1 text-center text-xs font-medium text-gray-500">📸 {t.snsTip}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" onClick={takePhoto} className={choice}>
          📸 인증샷 <span className="block text-xs font-medium text-gray-500">{t.takePhoto}</span>
        </button>
        <button type="button" onClick={onOrderMore} className={choice}>
          📱 더 주문하기 <span className="block text-xs font-medium text-gray-500">{t.padHere}</span>
        </button>
      </div>

      {/* 📸 찍은 인증샷: 보고, 저장하고, 한국어 해시태그를 배운다 */}
      {photo && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="max-h-full w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white p-3 text-[#5c3a1c] shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element -- 방금 만든 사진(data URL)이라 next/image가 필요 없다 */}
            <img src={photo} alt="인증샷" className="w-full rounded-lg" />
            <SpeakLine ko="인증샷 찍었어요!" roman="injeungsyat jjigeosseoyo!" mean={t.photoTaken} className="mt-2 text-center" />
            <p className="mt-1 text-center text-xs text-[#c26a0e]">{hashtags}</p>
            <p className="mt-1 text-center text-xs font-medium text-gray-500">{t.hashtagTip}</p>
            <div className="mt-2 flex justify-center gap-2">
              <a
                href={photo}
                download="korean-friend-cafe.png"
                className="rounded-full bg-amber-400 px-4 py-1 text-sm font-bold text-white hover:bg-amber-500"
              >
                💾 {t.savePhoto}
              </a>
              <button type="button" onClick={() => setPhoto(null)} className="rounded-full bg-gray-100 px-4 py-1 text-sm hover:bg-gray-200">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
