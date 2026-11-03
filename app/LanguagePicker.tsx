"use client";

import { languages, type LangCode } from "./i18n";
import { useLanguage } from "./LanguageProvider";

// 🌐 언어 고르기. 고르면 메뉴판, 말풍선, 채팅창, 친구의 설명이 모두 그 언어로 바뀐다.
export default function LanguagePicker() {
  const { lang, setLang, t } = useLanguage();
  return (
    <label className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm text-gray-800 shadow-lg">
      <span aria-hidden>🌐</span>
      <span className="sr-only">{t.language}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as LangCode)}
        className="bg-transparent font-semibold outline-none"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
