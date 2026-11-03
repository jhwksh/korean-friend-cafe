import CafeFriend from "./CafeFriend";
import ChatPanel from "./ChatPanel";
import CounterFood from "./CounterFood";
import LanguagePicker from "./LanguagePicker";
import { LanguageProvider, T } from "./LanguageProvider";
import MenuBoard from "./MenuBoard";

export default function Home() {
  return (
    <LanguageProvider>
    <main className="flex min-h-screen flex-col bg-[#2b1d14] md:flex-row">
      {/* 왼쪽: 가상 카페 화면 */}
      <section className="relative flex min-h-[680px] flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#f8e7cc] to-[#e2bf8f] [perspective:1000px]">
        <CafeFriend />

        {/* 🌐 언어 고르기: 고른 언어로 설명과 안내가 바뀐다 */}
        <div className="absolute left-1/2 top-3 z-30 -translate-x-1/2">
          <LanguagePicker />
        </div>

        {/* 창문 */}
        <div className="absolute left-8 top-10 hidden h-32 w-44 rounded-t-full border-8 border-[#8b5a2b] bg-gradient-to-b from-sky-400 to-sky-100 shadow-[inset_0_0_20px_rgba(0,0,0,0.25)] sm:block">
          <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-[#8b5a2b]" />
        </div>

        {/* 매달린 조명 두 개 */}
        {["right-16", "right-36"].map((pos) => (
          <div key={pos} className={`absolute top-0 ${pos} flex flex-col items-center`}>
            <div className="h-14 w-px bg-[#5c3a1c]" />
            <div className="h-6 w-10 rounded-b-full bg-amber-400 shadow-[0_12px_40px_12px_rgba(251,191,36,0.55)]" />
          </div>
        ))}

        {/* 간판과 메뉴판 */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 pb-6 pt-20 sm:pt-24">
          <h1 className="text-3xl font-extrabold text-[#5c3a1c] [text-shadow:0_3px_0_#f8e7cc,0_6px_12px_rgba(0,0,0,0.25)]">
            ☕ 한국어 친구 카페
            <span className="block text-center text-base font-semibold text-[#7a5230]"><T k="title" /></span>
          </h1>
          <MenuBoard />
        </div>

        {/* 계산대: 메뉴판 아래 맨 밑에 놓인다 (겹치지 않게). 윗면은 기울여서 입체감을 준다 */}
        <div className="relative mt-auto pt-12">
          {/* 점원: 계산대 뒤에 서 있어서 아랫부분은 계산대에 가려진다 (지금은 모습만, 대화는 나중 단계) */}
          <div className="absolute bottom-[120px] right-2 flex flex-col items-center sm:right-[3%]">
            <div className="relative z-20 mb-1 whitespace-nowrap rounded-2xl bg-white px-3 py-1 text-center text-sm text-gray-800 shadow-lg">
              <span className="font-semibold">어서 오세요! 😊</span>
              <br />
              <span className="text-xs text-gray-500"><T k="welcome" /></span>
            </div>
            <span className="text-6xl drop-shadow-[0_6px_4px_rgba(0,0,0,0.3)]">🧑‍🍳</span>
          </div>
          {/* 계산대 위 음식 (한국어 + 고른 언어 이름표) */}
          <CounterFood />
          <div className="relative z-10 h-10 origin-bottom bg-gradient-to-b from-[#c48a52] to-[#a86f3c] [transform:perspective(600px)_rotateX(50deg)]" />
          <div className="relative z-10 h-24 bg-gradient-to-b from-[#8b5a2b] to-[#4a2e15] shadow-[inset_0_8px_12px_rgba(0,0,0,0.3)]" />
        </div>
      </section>

      {/* 오른쪽: 한국어 친구 채팅창 */}
      <section className="flex flex-1 p-4 md:max-w-md md:p-6">
        <ChatPanel />
      </section>
    </main>
    </LanguageProvider>
  );
}
