import CafeFriend from "./CafeFriend";

const menu = [
  { name: "아메리카노", price: "4,500원" },
  { name: "카페라테", price: "5,000원" },
  { name: "녹차라테", price: "5,500원" },
  { name: "치즈케이크", price: "6,000원" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#2b1d14] md:flex-row">
      {/* 왼쪽: 가상 카페 화면 */}
      <section className="relative min-h-[620px] flex-1 overflow-hidden bg-gradient-to-b from-[#f8e7cc] to-[#e2bf8f] [perspective:1000px]">
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
          <div className="w-full max-w-xs rounded-xl border-8 border-[#6b4423] bg-[#2f3b2f] p-5 text-[#f1f5e9] shadow-[0_25px_40px_rgba(0,0,0,0.4)] transition-transform duration-500 [transform:rotateY(-14deg)_rotateX(4deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)]">
            <h2 className="mb-3 text-center text-lg font-semibold tracking-widest">MENU · 메뉴</h2>
            <ul className="space-y-2 font-mono">
              {menu.map((item) => (
                <li key={item.name} className="flex justify-between border-b border-dashed border-white/20 pb-1">
                  <span>{item.name}</span>
                  <span className="text-amber-200">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 계산대: 윗면은 기울여서 입체감을 준다 */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="relative flex justify-center gap-10 pb-1 text-4xl">
            <div className="relative">
              <span className="absolute -top-6 left-2 h-6 w-2 rounded-full bg-white/70 blur-[2px] animate-[steam_2.5s_ease-out_infinite]" />
              <span className="absolute -top-6 left-5 h-6 w-2 rounded-full bg-white/70 blur-[2px] animate-[steam_2.5s_ease-out_0.8s_infinite]" />
              <span className="drop-shadow-[0_6px_4px_rgba(0,0,0,0.35)]">☕</span>
            </div>
            <span className="drop-shadow-[0_6px_4px_rgba(0,0,0,0.35)]">🥐</span>
            <span className="drop-shadow-[0_6px_4px_rgba(0,0,0,0.35)]">🍰</span>
          </div>
          <div className="h-10 origin-bottom bg-gradient-to-b from-[#c48a52] to-[#a86f3c] [transform:perspective(600px)_rotateX(50deg)]" />
          <div className="h-24 bg-gradient-to-b from-[#8b5a2b] to-[#4a2e15] shadow-[inset_0_8px_12px_rgba(0,0,0,0.3)]" />
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
