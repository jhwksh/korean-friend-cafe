# 구글 로그인 설정 지침 (처음부터 새로)

한국어 친구 카페의 "구글로 계속하기"를 켜는 순서다.
화면은 사용자가 직접 누르고, 비밀 값(보안 비밀번호, 키)은 채팅이나 코드에 적지 않는다.

이미 정해진 값

| 이름 | 값 |
|---|---|
| Supabase 프로젝트 주소 | `https://qpijcjojmbgvgsbtqfys.supabase.co` |
| 구글이 돌려보낼 주소 (리디렉션 URI) | `https://qpijcjojmbgvgsbtqfys.supabase.co/auth/v1/callback` |
| 내 컴퓨터 카페 | `http://localhost:3000` |
| 배포한 카페 | `https://korean-friend-cafe.vercel.app` |

---

## 0. 구글 계정을 하나로 정한다

- 구글 클라우드는 **한 계정**으로만 관리한다. (예: 프로젝트를 만든 계정)
- 구글 클라우드 오른쪽 위 프로필 사진을 눌러, 그 계정인지 늘 확인한다.
- 카페에 로그인해 볼 계정(예: 시험용 지메일)은 달라도 된다. 대신 3단계에서 테스트 사용자로 넣는다.

> 왜: 카페 로그인을 다른 계정으로 시험하면, 브라우저가 구글 클라우드도 그 계정으로 열어서
> "추가 액세스 권한 필요" 화면이 뜬다.

## 1. 프로젝트 고르기 (또는 새로 만들기)

- 있는 프로젝트를 쓴다: https://console.cloud.google.com → 맨 위 프로젝트 칸 → `korean-friend-cafe`
- 새로 만든다: https://console.cloud.google.com/projectcreate → 이름 `korean-friend-cafe` → 만들기 → 🔔 알림에서 "프로젝트 선택"
- 맨 위 프로젝트 칸에 내 프로젝트 이름이 보여야 다음으로 간다.

## 2. 앱 정보 (Google Auth Platform → 브랜딩)

https://console.cloud.google.com/auth/overview

- 처음이면 **시작하기** → 앱 이름 `한국어 친구 카페`, 지원 이메일, 대상 **외부**, 연락처 이메일, 동의 → 만들기
- 이미 했으면 건너뛴다.

## 3. 테스트 사용자 넣기 (대상)

https://console.cloud.google.com/auth/audience

- **테스트 사용자 → + Add users** → 카페에 로그인해 볼 지메일 → 저장
- 테스트 모드에서는 이 목록에 있는 사람만 로그인할 수 있다.
- 숙제 낼 때: 같은 화면의 **앱 게시**를 눌러 누구나 로그인하게 바꾼다 (이름·이메일만 받아서 심사 없이 게시된다).

## 4. 새 로그인 열쇠(OAuth 클라이언트) 만들기

https://console.cloud.google.com/auth/clients/create

**만들기를 누르기 전에** 아래를 모두 채운다.

1. 애플리케이션 유형: **웹 애플리케이션** (데스크톱 앱 아님)
2. 이름: `cafe web` (나만 보는 이름)
3. 승인된 JavaScript 원본: **+ URI 추가** 두 번
   - `http://localhost:3000`
   - `https://korean-friend-cafe.vercel.app`
4. 승인된 리디렉션 URI: **+ URI 추가** 한 번 ← 가장 중요
   - `https://qpijcjojmbgvgsbtqfys.supabase.co/auth/v1/callback`
5. 끝에 `/`를 붙이지 않았는지, 띄어쓰기가 없는지 본다.
6. "AI 기반 에이전트에 이 클라이언트 사용"은 체크하지 않는다.
7. 맨 아래 **만들기**

## 5. 열쇠 두 개를 바로 챙긴다

만들기 직후 창에 두 값이 나온다. **이 창을 닫기 전에** 한다.

- 클라이언트 ID: `....apps.googleusercontent.com`
- 클라이언트 보안 비밀번호: `GOCSPX-...` (지금만 다 보인다)
- **JSON 다운로드**를 눌러 받아 둔다. 받은 파일은 다운로드 폴더에 두고, 카페 폴더에는 넣지 않는다 (GitHub에 올라갈 수 있다).
- 보안 비밀번호를 놓쳤으면: 클라이언트 화면 → 클라이언트 보안 비밀번호 → **+ Add secret** 으로 새로 만든다.

## 6. Supabase에 열쇠 넣기

https://supabase.com/dashboard/project/qpijcjojmbgvgsbtqfys/auth/providers

1. **Google** 누르기 → **Enable Sign in with Google** 켜기
2. Client IDs ← 클라이언트 ID (예전 값이 있으면 지우고 새 값)
3. Client Secret (for OAuth) ← 보안 비밀번호 (예전 값이 있으면 지우고 새 값)
4. Skip nonce checks, Allow users without an email: 끈 채로 / Callback URL: 그대로
5. **Save**

## 7. 돌아올 주소 정하기 (Supabase)

https://supabase.com/dashboard/project/qpijcjojmbgvgsbtqfys/auth/url-configuration

- Site URL: `https://korean-friend-cafe.vercel.app` → Save changes
- Redirect URLs: `http://localhost:3000`, `https://korean-friend-cafe.vercel.app` → Save URLs

## 8. 예전 클라이언트 정리 (선택)

https://console.cloud.google.com/auth/clients

- 새 클라이언트로 로그인이 되는 것을 확인한 **뒤에** 예전 `웹 클라이언트 1`을 지운다. 지우기는 사용자가 직접.

## 9. 시험

1. 구글 설정이 퍼지도록 **5~10분** 기다린다.
2. 크롬에서 `http://localhost:3000` 새로고침 → **구글로 계속하기**
3. 3단계에서 넣은 지메일로 고른다. "확인하지 않은 앱" 경고가 나오면 **계속**.
4. 채팅창 위에 `👤 내 이름 ☁️ 내 계정에 저장됨 로그아웃`이 보이면 성공.

## 오류가 날 때

| 오류 | 뜻 | 고치기 |
|---|---|---|
| `redirect_uri_mismatch` | 구글 목록에 돌아갈 주소가 없다 | 4단계 4번 주소가 저장됐는지 보고, 5~10분 기다린다 |
| 추가 액세스 권한 필요 | 다른 구글 계정으로 클라우드를 열었다 | 0단계: 오른쪽 위 프로필에서 관리 계정으로 바꾼다 |
| 액세스 차단: 테스트 사용자 아님 | 테스트 모드인데 목록에 없는 계정 | 3단계에서 그 지메일을 넣는다 |
| `Unsupported provider` | Supabase에서 Google이 꺼져 있다 | 6단계 스위치를 켜고 Save |
| 로그인 뒤 다른 주소로 감 | 돌아올 주소 목록에 없다 | 7단계 Redirect URLs |
