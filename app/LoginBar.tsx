"use client";

import { useAuth } from "./AuthProvider";
import { useFound } from "./FoundProvider";
import { useLanguage } from "./LanguageProvider";

// 채팅창 머리 아래의 로그인 줄.
// 로그인 전: "구글로 계속하기" + 왜 로그인하는지. 로그인 뒤: 내 이름, 저장 상태, 로그아웃.
export default function LoginBar() {
  const { enabled, user, signIn, signOut } = useAuth();
  const { cloud } = useFound();
  const { t } = useLanguage();
  if (!enabled) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-3 border-b border-gray-100 bg-amber-50/70 px-4 py-2">
        <button
          type="button"
          onClick={signIn}
          className="flex shrink-0 items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold shadow-sm hover:bg-gray-50"
        >
          <span aria-hidden className="font-bold text-[#4285f4]">G</span>
          구글로 계속하기
          <span className="text-xs font-normal text-gray-500">· {t.loginGoogle}</span>
        </button>
        <p className="text-xs font-medium text-gray-600">{t.loginWhy}</p>
      </div>
    );
  }

  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
  const status = {
    off: "",
    loading: `⏳ ${t.cloudLoading}`,
    saving: `⏳ ${t.cloudSaving}`,
    saved: `☁️ ${t.cloudSaved}`,
    error: `⚠️ ${t.cloudError}`,
  }[cloud];

  return (
    <div className="flex items-center gap-2 border-b border-gray-100 bg-emerald-50/70 px-4 py-2 text-xs">
      <span className="truncate font-semibold text-gray-800">👤 {name}</span>
      <span className={cloud === "error" ? "font-medium text-red-600" : "font-medium text-emerald-700"}>{status}</span>
      <button
        type="button"
        onClick={signOut}
        className="ml-auto shrink-0 rounded-full border border-gray-300 bg-white px-2.5 py-1 font-semibold text-gray-700 hover:bg-gray-50"
      >
        로그아웃 <span className="font-normal text-gray-500">· {t.logout}</span>
      </button>
    </div>
  );
}
