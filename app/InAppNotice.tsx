"use client";

import { useEffect, useState } from "react";
import type { LangCode } from "./i18n";
import { useLanguage } from "./LanguageProvider";
import { track } from "./tracking";

// 🔇 앱 안 브라우저 안내 (2026-11-22, 사용자 요청)
// 카카오톡·쓰레드·인스타 같은 앱 안에서 링크를 열면, 그 앱의 작은 브라우저는 한국어 읽어 주기(소리)가 안 되는 경우가 많다.
// (구글 로그인도 앱 안 브라우저에서는 막힌다.)
// - 카카오톡: 카톡이 공식으로 열어 주는 주소(kakaotalk://web/openExternal)로 크롬/사파리에 바로 넘긴다.
// - 다른 앱, 또는 한국어 목소리가 없는 휴대폰: 위에 작은 안내만 띄운다. 닫을 수 있고, 화면을 막지 않는다 (강요하지 않기).

type Why = "kakao" | "inapp" | "novoice";

const MSG: Record<LangCode, { title: string; how: string; chrome: string; novoice: string }> = {
  en: { title: "🔇 No sound?", how: "Tap ⋯ → “Open in browser” (Chrome / Safari).", chrome: "Open in Chrome", novoice: "This browser has no Korean voice. Try Chrome or Safari." },
  de: { title: "🔇 Kein Ton?", how: "Tippe auf ⋯ → „Im Browser öffnen“ (Chrome / Safari).", chrome: "In Chrome öffnen", novoice: "Dieser Browser hat keine koreanische Stimme. Probier Chrome oder Safari." },
  ja: { title: "🔇 音が出ない？", how: "⋯ →「ブラウザで開く」(Chrome / Safari) を押してね。", chrome: "Chromeで開く", novoice: "このブラウザには韓国語の音声がありません。Chrome か Safari で試してね。" },
  zh: { title: "🔇 没有声音？", how: "点 ⋯ →“在浏览器中打开”(Chrome / Safari)。", chrome: "用 Chrome 打开", novoice: "这个浏览器没有韩语语音。请试试 Chrome 或 Safari。" },
  es: { title: "🔇 ¿No hay sonido?", how: "Toca ⋯ → «Abrir en el navegador» (Chrome / Safari).", chrome: "Abrir en Chrome", novoice: "Este navegador no tiene voz en coreano. Prueba con Chrome o Safari." },
  vi: { title: "🔇 Không có tiếng?", how: "Chạm ⋯ → “Mở bằng trình duyệt” (Chrome / Safari).", chrome: "Mở bằng Chrome", novoice: "Trình duyệt này không có giọng tiếng Hàn. Hãy thử Chrome hoặc Safari." },
  ru: { title: "🔇 Нет звука?", how: "Нажмите ⋯ → „Открыть в браузере“ (Chrome / Safari).", chrome: "Открыть в Chrome", novoice: "В этом браузере нет корейского голоса. Попробуйте Chrome или Safari." },
};

// 어느 앱 안에서 열었는지 (휴대폰이 알려 주는 이름표 user agent로 본다)
function inAppName(ua: string): string | null {
  if (/KAKAOTALK/i.test(ua)) return "kakao";
  if (/Barcelona/i.test(ua)) return "threads"; // 쓰레드 앱의 이름표
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  if (/\bLine\//i.test(ua)) return "line";
  if (/NAVER\(inapp/i.test(ua)) return "naver";
  if (/DaumApps/i.test(ua)) return "daum";
  if (/Android.*;\s*wv\)/i.test(ua)) return "webview";
  return null;
}

export default function InAppNotice() {
  const { lang } = useLanguage();
  const [why, setWhy] = useState<Why | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const app = inAppName(ua);

    // 1) 카카오톡: 바깥 브라우저로 바로 넘긴다 (한 번만. 넘어가지 않으면 안내를 띄운다)
    if (app === "kakao") {
      let tried = false;
      try {
        tried = sessionStorage.getItem("kfc-kakao-out") === "1";
        sessionStorage.setItem("kfc-kakao-out", "1");
      } catch {}
      track("inapp", { app, action: tried ? "notice" : "redirect" });
      if (!tried) {
        location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(location.href)}`;
      }
      const timer = setTimeout(() => setWhy("kakao"), tried ? 0 : 1500);
      return () => clearTimeout(timer);
    }

    // 2) 다른 앱 안 브라우저: 안내
    if (app) {
      track("inapp", { app, action: "notice" });
      const timer = setTimeout(() => setWhy("inapp"), 0);
      return () => clearTimeout(timer);
    }

    // 3) 앱 밖인데 한국어 목소리가 없는 휴대폰: 목소리 목록이 올 때까지 잠깐(2초) 기다렸다가 본다
    if (!("speechSynthesis" in window)) {
      track("inapp", { app: "none", action: "novoice" });
      const timer = setTimeout(() => setWhy("novoice"), 0);
      return () => clearTimeout(timer);
    }
    const synth = window.speechSynthesis;
    const check = () => {
      const voices = synth.getVoices();
      if (voices.length > 0 && !voices.some((v) => v.lang.startsWith("ko"))) {
        track("inapp", { app: "none", action: "novoice" });
        setWhy("novoice");
      }
    };
    const timer = setTimeout(check, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!why) return null;
  const m = MSG[lang] ?? MSG.en;
  const android = /Android/i.test(navigator.userAgent);
  // 안드로이드는 크롬으로 바로 여는 버튼을 준다 (아이폰은 이런 방법이 없어서 ⋯ 안내만)
  const chromeUrl = `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=https;package=com.android.chrome;end`;

  return (
    <div className="fixed inset-x-0 top-2 z-[70] flex justify-center px-3">
      <div className="flex max-w-[460px] items-start gap-2 rounded-xl bg-white/95 px-3 py-2 text-[#5c3a1c] shadow-lg ring-2 ring-amber-300">
        <div className="flex-1 text-sm">
          <p className="font-bold">
            {m.title} <span className="font-semibold">소리가 안 나요?</span>
          </p>
          {why === "novoice" ? (
            <p className="text-xs">{m.novoice}</p>
          ) : (
            <p className="text-xs">{m.how}</p>
          )}
          {android && why !== "novoice" && (
            <a href={chromeUrl} className="mt-1 inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-white shadow">
              🌐 {m.chrome}
            </a>
          )}
        </div>
        <button type="button" onClick={() => setWhy(null)} aria-label="close" className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
    </div>
  );
}
