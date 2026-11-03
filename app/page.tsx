import CafeFriend from "./CafeFriend";
import MenuBoard from "./MenuBoard";
import { menu } from "./menu";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#2b1d14] md:flex-row">
      {/* 왼쪽: 가상 카페 화면 */}
      <section className="relative min-h-[680px] flex-1 overflow-hidden bg-gradient-to-b from-[#f8e7cc] to-[#e2bf8f] [perspective:1000px]">
        <CafeFriend />

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
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 pt-36 sm:pt-48">
          <h1 className="text-3xl font-extrabold text-[#5c3a1c] [text-shadow:0_3px_0_#f8e7cc,0_6px_12px_rgba(0,0,0,0.25)]">
            ☕ 한국어 친구 카페
          </h1>
          <MenuBoard />
        </div>

        {/* 계산대: 윗면은 기울여서 입체감을 준다 */}
        <div className="absolute inset-x-0 bottom-0">
          {/* 점원: 계산대 뒤에 서 있어서 아랫부분은 계산대에 가려진다 (지금은 모습만, 대화는 나중 단계) */}
          <div className="absolute bottom-[120px] right-[10%] flex flex-col items-center">
            <div className="mb-1 whitespace-nowrap rounded-2xl bg-white px-3 py-1 text-sm text-gray-800 shadow-lg">
              어서 오세요! 😊
            </div>
            <span className="text-6xl drop-shadow-[0_6px_4px_rgba(0,0,0,0.3)]">🧑‍🍳</span>
          </div>
          {/* 계산대 위 음식: 메뉴판과 같은 목록에서 그려서 항상 메뉴와 맞는다 */}
          <div className="relative z-10 flex justify-center gap-4 pb-1 sm:gap-8">
            {menu.map((item) => (
              <div key={item.name} className="relative flex flex-col items-center">
                {item.hot && (
                  <>
                    <span className="absolute -top-6 left-2 h-6 w-2 rounded-full bg-white/70 blur-[2px] animate-[steam_2.5s_ease-out_infinite]" />
                    <span className="absolute -top-6 left-5 h-6 w-2 rounded-full bg-white/70 blur-[2px] animate-[steam_2.5s_ease-out_0.8s_infinite]" />
                  </>
                )}
                <span className="text-4xl drop-shadow-[0_6px_4px_rgba(0,0,0,0.35)]">{item.emoji}</span>
                <span className="text-[11px] font-semibold text-[#5c3a1c]">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="relative z-10 h-10 origin-bottom bg-gradient-to-b from-[#c48a52] to-[#a86f3c] [transform:perspective(600px)_rotateX(50deg)]" />
          <div className="relative z-10 h-24 bg-gradient-to-b from-[#8b5a2b] to-[#4a2e15] shadow-[inset_0_8px_12px_rgba(0,0,0,0.3)]" />
        </div>
      </section>

      {/* 오른쪽: 한국어 친구 채팅창 */}
      <section className="flex flex-1 p-4 md:max-w-md md:p-6">
        <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-3xl bg-white/95 text-gray-900 shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
          <header className="flex items-center gap-3 border-b border-gray-100 p-4">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-amber-400 text-2xl shadow-md">
              🙂
            </div>
            <div>
              <p className="font-semibold">한국어 친구</p>
              <p className="text-xs text-emerald-600">● 온라인</p>
            </div>
          </header>
          <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-amber-50/60 to-white p-4 text-gray-400">
            대화가 여기에 나와요
          </div>
        </div>
      </section>
    </main>
  );
}
