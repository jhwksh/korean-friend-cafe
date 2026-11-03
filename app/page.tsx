import Image from "next/image";
import CafeFriend from "./CafeFriend";
import CafeStage from "./CafeStage";
import ChatPanel from "./ChatPanel";
import CounterFood from "./CounterFood";
import LanguagePicker from "./LanguagePicker";
import { LanguageProvider, T } from "./LanguageProvider";
import WordTag from "./WordTag";
import MenuBoard from "./MenuBoard";

export default function Home() {
  return (
    <LanguageProvider>
    <main className="flex min-h-screen flex-col bg-[#2b1d14] md:flex-row">
      {/* 왼쪽: 가상 카페 화면. 화면 너비에 맞춰 통째로 커지고 작아진다 (CafeStage) */}
      <section className="flex-1">
        <CafeStage>
        <div className="relative h-full overflow-hidden bg-[#e9e4dc]">
        {/* 배경 사진: Unsplash 무료 사진. 실제 브랜드 로고가 있는 곳은 흐리게 처리했다.
            아래 물건들의 위치는 이 사진(가로 800 × 세로 700 무대)에 맞춰 잡았다 */}
        <Image
          src="/cafe.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 60vw, 100vw"
          className="object-cover"
        />

        {/* 뒤쪽 큰 창문: 사진 속 나무 선반 자리에 딱 맞춘 하얀 창틀. 창밖으로 바다가 보인다 (Unsplash 무료 사진) */}
        <div className="absolute left-[166px] top-[176px] h-[296px] w-[450px] overflow-hidden rounded-[3px] border-[9px] border-[#fbfaf7] shadow-[inset_0_0_14px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.2)]">
          <Image src="/window-sea.jpg" alt="" fill sizes="40vw" className="object-cover" />
          {/* 하얀 창살 (가운데 세로, 가로) */}
          <div className="absolute inset-y-0 left-1/2 w-[7px] -translate-x-1/2 bg-[#fbfaf7] shadow-[0_0_4px_rgba(0,0,0,0.2)]" />
          <div className="absolute inset-x-0 top-1/2 h-[7px] -translate-y-1/2 bg-[#fbfaf7] shadow-[0_0_4px_rgba(0,0,0,0.2)]" />
          <WordTag word="window" className="left-2 top-2" />
          <WordTag word="sea" className="bottom-2 right-2" />
        </div>

        <CafeFriend />

        {/* 🌐 언어 고르기: 고른 언어로 설명과 안내가 바뀐다 */}
        <div className="absolute left-1/2 top-3 z-30 -translate-x-1/2">
          <LanguagePicker />
        </div>

        {/* 간판: 하얀 천장 아래에 걸린 판 */}
        <h1 className="absolute left-[400px] top-[56px] z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-[#8b5a2b] bg-white/90 px-5 py-1.5 text-center text-2xl font-extrabold text-[#5c3a1c] shadow-[0_6px_12px_rgba(0,0,0,0.25)]">
          ☕ 한국어 친구 카페
          <span className="block text-sm font-semibold text-[#7a5230]"><T k="title" /></span>
        </h1>

        {/* 유리 메뉴판: 창문 앞에 건다. 뒤의 바다가 뿌옇게 비친다 */}
        <div className="absolute left-[196px] top-[196px] z-10 w-[408px] [perspective:900px]">
          <MenuBoard />
        </div>

        {/* 진열장: 사진 속 앞 계산대 위에 올려 둔다 */}
        <div className="absolute left-[262px] top-[462px] z-20 origin-top-left scale-[0.62]">
          <CounterFood />
        </div>

        {/* 점원(바리스타): 앞 계산대 오른쪽 뒤에 서서 손을 흔든다. 계산대 아래로는 가려진다 (지금은 모습만, 대화는 나중 단계)
            그림(public/barista.png)은 사용자가 Gemini로 만든 그림이다 (실제 사람 아님) */}
        <div className="absolute left-[612px] top-[352px] z-20 flex flex-col items-center">
          <div className="mb-1 whitespace-nowrap rounded-2xl bg-white px-3 py-1 text-center text-sm text-gray-800 shadow-lg">
            <span className="font-semibold">어서 오세요! 😊</span>
            <br />
            <span className="text-xs text-gray-500"><T k="welcome" /></span>
          </div>
          <div className="h-[178px] w-[161px] overflow-hidden">
            <Image src="/barista.png" alt="바리스타" width={161} height={300} className="h-[300px] w-auto drop-shadow-[0_8px_10px_rgba(0,0,0,0.25)]" />
          </div>
          <WordTag word="staff" className="-left-10 bottom-10" />
        </div>

        {/* 사진 속 물건 이름표 */}
        <WordTag word="lamp" className="left-[180px] top-[118px]" />
        <WordTag word="lamp" className="left-[580px] top-[118px]" />
        <WordTag word="beans" className="left-[44px] top-[250px]" />
        <WordTag word="coffeeMachine" className="left-[96px] top-[392px]" />
        <WordTag word="grinder" className="left-[700px] top-[318px]" />
        <WordTag word="counter" className="left-[300px] top-[626px]" />

        {/* 사진 출처 */}
        <a
          href="https://unsplash.com/photos/1lHFvq8SDQo"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-1 right-2 z-10 text-[10px] text-gray-500"
        >
          Photo: Unsplash
        </a>
        </div>
        </CafeStage>
      </section>

      {/* 오른쪽: 한국어 친구 채팅창 */}
      <section className="flex flex-1 p-4 md:max-w-md md:p-6">
        <ChatPanel />
      </section>
    </main>
    </LanguageProvider>
  );
}
