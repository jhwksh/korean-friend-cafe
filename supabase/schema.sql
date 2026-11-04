-- 한국어 친구 카페: 회원마다 한 줄씩 공부 기록을 저장하는 표
-- Supabase 화면 → SQL Editor → 이 내용을 붙여 넣고 Run 한 번.

create table if not exists public.cafe_progress (
  user_id      uuid primary key references auth.users (id) on delete cascade, -- 누구의 기록인지 (구글 로그인한 회원)
  found        text[]      not null default '{}', -- 써서 맞힌 숨은 단어
  stamps       text[]      not null default '{}', -- 깬 ⭐ 미션 (미션 도장)
  buy_stamps   integer     not null default 0,    -- 💳 계산할 때 적립한 도장 수
  coupons_used text[]      not null default '{}', -- 이미 쓴 🎟️ 쿠폰
  chances      integer     not null default 5,    -- 🙋 친구 찬스
  updated_at   timestamptz not null default now()
);

-- RLS(줄 단위 보안): 켜면 규칙에 맞는 줄만 읽고 쓸 수 있다.
-- 공개용 키가 브라우저에 보여도, 남의 줄은 읽을 수도 고칠 수도 없게 지켜 준다.
alter table public.cafe_progress enable row level security;

create policy "내 기록 읽기" on public.cafe_progress
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "내 기록 만들기" on public.cafe_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "내 기록 고치기" on public.cafe_progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 로그인한 사람(authenticated)만 이 표를 쓸 수 있다. 로그인 안 한 사람(anon)은 못 쓴다.
grant select, insert, update on public.cafe_progress to authenticated;
