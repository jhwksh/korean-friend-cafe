"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

// 🔐 구글 로그인. 누가 로그인했는지(user)를 화면 전체가 같이 쓴다.
// 순서: "구글로 계속하기" → 구글 화면에서 계정 고르기 → Supabase가 확인 → 우리 사이트로 돌아옴(?code=...)
// → supabase-js가 code를 로그인 정보로 바꿔 이 브라우저에 기억한다.
type Ctx = {
  enabled: boolean; // Supabase 키가 들어 있는지
  user: User | null;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<Ctx>({ enabled: false, user: null, signIn: () => {}, signOut: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) return;
    // 처음 열 때(INITIAL_SESSION), 로그인(SIGNED_IN), 로그아웃(SIGNED_OUT) 때마다 불린다
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // 구글에서 돌아온 주소의 ?code=...는 다 쓴 뒤라 주소창에서 지운다
      const here = new URL(window.location.href);
      if (session && here.searchParams.has("code")) {
        here.searchParams.delete("code");
        window.history.replaceState(null, "", here.pathname + here.search + here.hash);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  function signIn() {
    // 로그인이 끝나면 지금 보고 있던 주소(로컬이면 localhost, 배포면 vercel)로 돌아온다
    supabase?.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  }

  function signOut() {
    supabase?.auth.signOut();
  }

  return <AuthContext.Provider value={{ enabled: !!supabase, user, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
