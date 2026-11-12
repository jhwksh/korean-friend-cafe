import Image from "next/image";
import { AuthProvider } from "./AuthProvider";
import Barista from "./Barista";
import CafeFriend from "./CafeFriend";
import CafeStage from "./CafeStage";
import CafeView from "./CafeView";
import Checkout from "./Checkout";
import { FoundProvider } from "./FoundProvider";
import { OrderProvider } from "./OrderProvider";
import FoundScore from "./FoundScore";
import ChatDock from "./ChatDock";
import RotateHint from "./RotateHint";
import Entrance from "./Entrance";
import CounterFood from "./CounterFood";
import LanguagePicker from "./LanguagePicker";
import MissionButton from "./MissionButton";
import { LanguageProvider, T } from "./LanguageProvider";
import WordTag from "./WordTag";
import MenuBoard from "./MenuBoard";
import MusicButton from "./MusicButton";
import { StampToast } from "./Stamps";

export default function Home() {
  return (
    <LanguageProvider>
    <AuthProvider>
    <FoundProvider>
    <OrderProvider>
    <Entrance>
    <main className="flex min-h-screen flex-col bg-[#2b1d14] md:flex-row">
      {/* 왼쪽: 가상 카페 화면. 화면 너비에 맞춰 통째로 커지고 작아진다 (CafeStage) */}
      <section className="flex-1">
        <CafeStage>
        <div className="relative h-full overflow-hidden bg-[#e9e4dc]">
        {/* 🌀 둘러보기 버튼을 누르면 이 2D 카페 대신 360° 카페가 보인다 (CafeView) */}
        <CafeView>
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
          {/* ⭐ 미션 6: 창밖 바다 보고 */}
          <MissionButton id="sea" className="right-10 top-6" />
          <WordTag word="sea" className="bottom-2 right-2" />
        </div>

        <CafeFriend />

        {/* 간판: 하얀 천장 아래에 걸린 판 */}
        <h1 className="absolute left-[400px] top-[56px] z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-[#8b5a2b] bg-white/90 px-5 py-1.5 text-center text-2xl font-extrabold text-[#5c3a1c] shadow-[0_6px_12px_rgba(0,0,0,0.25)]">
          ☕ 한국어 친구 카페
          <span className="block text-sm font-semibold text-[#7a5230]"><T k="title" /></span>
        </h1>

        {/* 유리 메뉴판: 창문 앞에 건다. 뒤의 바다가 뿌옇게 비친다 (메뉴 9개라 줄 간격을 좁혔다) */}
        <div className="absolute left-[196px] top-[196px] z-10 w-[408px] [perspective:900px]">
          <MenuBoard />
        </div>

        {/* 진열장: 사진 속 앞 계산대 위에 올려 둔다 */}
        <div className="absolute left-[262px] top-[462px] z-30 origin-top-left scale-[0.62]">
          <CounterFood />
        </div>

        {/* 점원(바리스타): 누르면 머리 위에 "어서 오세요!"가 보였다가, 다시 누르면 사라진다 */}
        <Barista />

        {/* 앞 계산대: 배경 사진에서 계산대 부분만 한 번 더 겹쳐 그린다.
            그래서 바리스타의 아랫몸이 계산대에 가려져, 계산대 뒤에 선 것처럼 보인다 */}
        <Image
          src="/cafe.jpg"
          alt=""
          fill
          sizes="(min-width: 768px) 60vw, 100vw"
          className="pointer-events-none z-[25] object-cover"
          style={{ clipPath: "polygon(91px 552px, 800px 552px, 800px 700px, 91px 700px)" }}
        />

        {/* 사진 속 물건 이름표 */}
        <WordTag word="lamp" className="left-[180px] top-[118px]" />
        <WordTag word="lamp" className="left-[580px] top-[118px]" />
        <WordTag word="beans" className="left-[44px] top-[250px]" />
        <WordTag word="coffeeMachine" className="left-[96px] top-[392px]" />
        <WordTag word="grinder" className="left-[700px] top-[318px]" />
        <WordTag word="counter" className="left-[300px] top-[626px]" />
        {/* ⭐ 미션: 계산대에서 계산, 쓰레기통 */}
        <MissionButton id="card" className="left-[470px] top-[622px]" />
        <MissionButton id="trash" className="left-[60px] top-[620px]" />
        {/* 왼쪽 아래 하얀 상자의 동그란 구멍: 다 먹은 컵과 쓰레기를 버리는 곳 */}
        <WordTag word="trash" className="left-[112px] top-[636px]" />
        {/* 오른쪽 회색 콘크리트 기둥 = 벽, 위쪽 하얀 면 = 천장 */}
        {/* 뒤쪽 하얀 작업대 = 싱크대 */}
        <WordTag word="sink" className="left-[150px] top-[505px]" />
        <WordTag word="wall" className="left-[752px] top-[200px]" />
        <WordTag word="ceiling" className="left-[660px] top-[40px]" />

        {/* 사진과 음악 출처 (음악은 CC BY 4.0이라 출처를 꼭 적는다) */}
        <p className="absolute bottom-1 right-2 z-10 text-[10px] text-gray-500">
          <a href="https://unsplash.com/photos/1lHFvq8SDQo" target="_blank" rel="noreferrer">
            Photo: Unsplash
          </a>
          {" · "}
          <a href="https://incompetech.com" target="_blank" rel="noreferrer">
            Music: Kevin MacLeod (incompetech.com), CC BY 4.0
          </a>
        </p>
        </CafeView>

        {/* 🔍 보물찾기 점수판과 상품 쿠폰 (2D와 360 둘 다에서 보인다) */}
        <FoundScore />

        {/* 🎵 카페 음악 켜기/끄기 (2D와 360 둘 다에서 보인다. 🌀 둘러보기 버튼 아래) */}
        <MusicButton />

        {/* 🧾 주문서 → 💳 계산(점원/키오스크) → 📳 진동벨 → 받으러 가기 (2D와 360 둘 다에서 보인다) */}
        <Checkout />

        {/* ☕ 도장을 받는 순간 "+1 도장!" (언제 적립되는지 눈으로 알게) */}
        <StampToast />

        {/* 🌐 언어 고르기: 고른 언어로 설명과 안내가 바뀐다 (2D와 360 둘 다에서 보인다) */}
        <div className="absolute left-1/2 top-3 z-40 -translate-x-1/2">
          <LanguagePicker />
        </div>
        </div>
        </CafeStage>
        {/* 📱 휴대폰 세로 화면: 카페 그림이 거의 정사각형이라 아래 반이 빈다. 가로로 돌리라고 알려 준다 */}
        <RotateHint />
      </section>

      {/* 💬 한국어 친구 채팅창: 평소엔 숨기고, 오른쪽 아래 친구 버튼을 누르면 연다 */}
      <ChatDock />
    </main>
    </Entrance>
    </OrderProvider>
    </FoundProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}
