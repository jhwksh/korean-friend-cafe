import CafeStage from "../../CafeStage";
import { LanguageProvider } from "../../LanguageProvider";
import Store from "./Store";

// 🏪 /place/store 주소: 가상 명동의 편의점. 카페(/place/cafe)와 같은 화면 틀을 쓴다.
// 계산대 대답 연습만 있고, 로그인·음악·채팅 친구·주문서는 없다.
export default function StorePage() {
  return (
    <LanguageProvider>
      <main className="flex min-h-screen flex-col bg-[#2b1d14]">
        <section className="min-w-0 flex-1">
          <CafeStage>
            <div className="relative h-full overflow-hidden bg-[#e9e4dc]">
              <Store />
            </div>
          </CafeStage>
        </section>
      </main>
    </LanguageProvider>
  );
}
