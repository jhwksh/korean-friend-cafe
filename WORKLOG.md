# 작업 기록

단계가 끝날 때마다 아래 형식으로 하나씩 추가한다.
회고와 README를 쓸 때 이 기록을 근거로 쓴다.

---

## 1. PRD — 프로젝트 기본 준비 (2026-11-03)

**한 일**
- `git init`으로 git 저장소를 만들었다.
- `.gitignore`에 `.env*`를 넣었다.
- `.env.local`에 `GEMINI_API_KEY=`를 넣고 값은 비워 두었다.
- `CLAUDE.md`(작업 규칙)와 `PRD.md`(목표와 성공 조건)를 만들었다.

**왜**
- 코드를 쓰기 전에 키가 GitHub에 올라가지 않게 막아 두려고.
- 무엇을 만들지와 언제 다 됐다고 할지를 먼저 정하려고.

**확인한 방법**
- `git check-ignore -v .env.local` → `.gitignore:1:.env*`가 나와서 무시되는 것을 확인했다.
- 커밋 전에 `git status`와 `git diff`를 확인했다. 키는 없었다.

**커밋**: `f403d05` CLAUDE.md와 PRD.md로 프로젝트 규칙과 목표 정리

---

## 2. 작업대 — Next.js 준비 (2026-11-03)

**한 일**
- `create-next-app`으로 Next.js 프로젝트를 만들었다. (TypeScript, Tailwind, App Router)
- `npm install`로 필요한 프로그램을 설치했다.
- `.gitignore`를 Next.js용으로 바꿨다. 이 파일에도 `.env*`가 들어 있다.

**왜**
- 화면과 서버(API 경로)를 한 프로젝트에서 만들 수 있어서.
- 서버에서 Gemini를 불러야 키를 브라우저에 숨길 수 있다.

**확인한 방법**
- `npm run build`가 오류 없이 통과했다.
- `npm run dev`를 실행하고 http://localhost:3000 에서 기본 화면이 보이는 것을 사용자가 직접 확인했다.
- 커밋 전에 `git status`와 `git diff`를 확인했다. 키는 없었고 `.env.local`도 빠져 있었다.

**커밋**: `e7c597d` Next.js 기본 화면이 localhost:3000에서 열림

**남은 것 / 메모**
- `npm audit` 경고가 있었지만 `--force`로 고치지 않았다. 프로그램이 망가질 수 있어서.
- 배포는 GitHub Pages가 아니라 Vercel로 해야 한다. GitHub Pages는 서버(API 경로)를 돌릴 수 없다.
- 제출 양식(homework-submit)은 README에 '왜, 실행·접속 방법, 확인 결과, 접속 주소'를 요구한다. 배포 뒤에 채운다.
