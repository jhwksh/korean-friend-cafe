"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "./LanguageProvider";
import { track, trackIds, trackOnce } from "./tracking";

// 📊 카페에 들어온 사람(방문), 머문 시간, 고른 언어를 센다. 화면에는 아무것도 보이지 않는다.
// 머문 시간 = 카페 화면을 실제로 보고 있던 시간 (다른 탭을 보던 시간은 빼고 센다)
export default function VisitTracker() {
  const { lang, picked } = useLanguage();
  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  // 🚪 방문: 이번 방문에 한 번. 언어는 브라우저 저장에서 조금 늦게 읽혀서 잠깐 기다렸다가 보낸다
  useEffect(() => {
    const timer = setTimeout(() => trackOnce("visit", { lang: langRef.current, returning: trackIds().returning }), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 🌐 언어를 직접 바꾸면 센다
  useEffect(() => {
    if (picked > 0) track("lang", { lang });
  }, [picked, lang]);

  // ⏱️ 머문 시간: 화면을 보는 동안만 시간을 더하고, 화면을 떠날 때(탭 바꾸기·창 닫기) 지금까지의 합을 보낸다
  useEffect(() => {
    let total = 0;
    let since = document.visibilityState === "visible" ? Date.now() : 0;
    const flush = () => {
      if (since) {
        total += Date.now() - since;
        since = 0;
      }
      const seconds = Math.round(total / 1000);
      if (seconds > 0) track("stay", { seconds }, true);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") since = Date.now();
      else flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
