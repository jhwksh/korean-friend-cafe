"use client";

import { useState } from "react";
import ChatPanel from "./ChatPanel";
import { useLanguage } from "./LanguageProvider";

// 💬 한국어 친구 채팅창: 평소엔 숨겨 두고(카페 그림이 크게 보이게), 오른쪽 아래 동그란 친구 버튼을 누르면 연다.
// 컴퓨터에선 오른쪽에, 휴대폰에선 아래에서 올라온다. 닫아도 대화는 그대로 남는다(창을 숨기기만 한다).
export default function ChatDock() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <section
        className={
          open
            ? "fixed inset-x-0 bottom-0 z-[60] flex h-[88dvh] flex-col p-2 md:static md:z-auto md:h-auto md:max-w-md md:flex-1 md:p-6"
            : "hidden"
        }
      >
        <div className="mb-1 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-[#5c3a1c] shadow hover:bg-white"
          >
            ✕ 닫기 · {t.close}
          </button>
        </div>
        {/* 채팅창이 가로로 꽉 차게 (세로 줄 안에서는 내용 길이만큼 늘어나 버린다) */}
        <div className="flex min-h-0 flex-1">
          <ChatPanel />
        </div>
      </section>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`한국어 친구 · ${t.friend}`}
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-left text-[#5c3a1c] shadow-[0_8px_20px_rgba(0,0,0,0.45)] ring-2 ring-amber-400 hover:bg-amber-50"
        >
          {/* 친구 그림에서 얼굴 부분만 동그랗게 (채팅창 프로필과 같다) */}
          <span
            className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-pink-200 to-amber-200 bg-no-repeat"
            style={{ backgroundImage: "url(/friend.png)", backgroundSize: "240%", backgroundPosition: "62% 6%" }}
          />
          <span className="text-sm font-bold">
            💬 한국어 친구
            <span className="block text-xs font-medium text-gray-500">{t.friend}</span>
          </span>
        </button>
      )}
    </>
  );
}
