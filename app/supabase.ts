import { createClient } from "@supabase/supabase-js";

// 카페 전용 Supabase 프로젝트에 붙는 통로 (로그인 + 도장·쿠폰·미션 저장).
// 두 값은 사용자가 .env.local과 Vercel에 직접 넣는다.
// NEXT_PUBLIC_가 붙어서 브라우저에 보이지만 괜찮은 키다: "공개용(publishable) 키"라서
// 표의 RLS 규칙(내 줄만 읽고 쓰기)이 데이터를 지킨다. secret(service_role) 키는 절대 여기에 넣지 않는다.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 키가 아직 없으면 null: 로그인 버튼만 숨고, 카페는 예전처럼 이 브라우저 저장으로 돌아간다
export const supabase = url && key ? createClient(url, key, { auth: { flowType: "pkce" } }) : null;
