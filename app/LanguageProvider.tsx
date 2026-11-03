"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { isLangCode, ui, type LangCode, type UiKey } from "./i18n";

const STORAGE_KEY = "kfc-lang";

const LanguageContext = createContext<{ lang: LangCode; setLang: (lang: LangCode) => void }>({
  lang: "en",
  setLang: () => {},
});

// 고른 언어를 화면 전체가 같이 쓰게 해 준다. 고른 언어는 이 브라우저에 기억한다.
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    // 전에 고른 언어가 있으면 그것을, 없으면 브라우저 언어(예: de-DE → de)를 쓴다
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    const browser = navigator.language.slice(0, 2);
    // 브라우저 저장소는 화면이 뜬 뒤에만 읽을 수 있어서(서버엔 없음) 여기서 바꾸는 것이 맞다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isLangCode(saved)) setLangState(saved);
    else if (isLangCode(browser)) setLangState(browser);
  }, []);

  function setLang(next: LangCode) {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const { lang, setLang } = useContext(LanguageContext);
  return { lang, setLang, t: ui[lang] };
}

// 서버에서 그리는 화면(page.tsx) 안에 고른 언어 글자를 넣을 때 쓴다
export function T({ k }: { k: UiKey }) {
  return <>{useLanguage().t[k]}</>;
}
