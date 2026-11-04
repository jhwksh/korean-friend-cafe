import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 · Privacy Policy | 한국어 친구 카페",
};

// 🔒 개인정보처리방침. 구글 로그인 앱을 게시하려면 이 주소가 필요하다.
// 실제로 받는 것과 쓰는 곳만 적는다 (AuthProvider, FoundProvider, api/chat).
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-stone-800">
      <h1 className="text-2xl font-bold">개인정보처리방침 · Privacy Policy</h1>
      <p className="mt-1 text-sm text-stone-500">한국어 친구 카페 (Korean Friend Cafe) · 2026-11-04</p>

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-bold">1. 받는 정보 · What we collect</h2>
        <p>구글로 로그인하면 구글이 알려 주는 <b>이름, 이메일 주소, 프로필 사진</b>만 받습니다.</p>
        <p className="text-sm text-stone-500">
          When you sign in with Google, we receive only your name, email address and profile picture.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold">2. 쓰는 곳 · How we use it</h2>
        <p>
          로그인한 사람의 <b>공부 기록(찾은 단어, 도장, 쿠폰, 미션)</b>을 저장해서 다른 기기에서도 이어지게 하는 데만 씁니다.
          광고나 판매에 쓰지 않습니다.
        </p>
        <p className="text-sm text-stone-500">
          We only use it to save your study progress (words, stamps, coupons, missions) so it follows you to other devices.
          We do not use it for ads or sell it.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold">3. 저장하는 곳 · Where it is stored</h2>
        <p>
          로그인과 공부 기록은 Supabase에 저장됩니다. 각 사람은 자기 기록만 읽고 고칠 수 있습니다.
          채팅에 쓴 글은 대답을 만들기 위해 Google Gemini API로 보내지며, 이 사이트에는 저장하지 않습니다.
        </p>
        <p className="text-sm text-stone-500">
          Sign-in and progress are stored in Supabase; each user can read and change only their own record.
          Chat messages are sent to the Google Gemini API to create replies and are not stored by this site.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold">4. 지우기 · Deleting your data</h2>
        <p>
          로그아웃하면 이 기기의 기록이 지워집니다. 계정 기록까지 지우고 싶으면 아래 이메일로 알려 주세요.
          구글 계정 설정(https://myaccount.google.com/connections)에서 연결을 끊을 수도 있습니다.
        </p>
        <p className="text-sm text-stone-500">
          Logging out clears this device. To delete your account record, email us below. You can also remove access in your
          Google account settings.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold">5. 문의 · Contact</h2>
        <p>jhwksh@gmail.com</p>
      </section>

      <p className="mt-10">
        <Link href="/" className="text-amber-700 underline">
          ← 카페로 돌아가기 · Back to the cafe
        </Link>
      </p>
    </main>
  );
}
