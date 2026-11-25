-- 📊 카페 기록 현황 (/stats 화면용): 합계 숫자만 돌려준다. 방문자 번호·세션 번호 같은 줄 자체는 절대 안 나간다.
-- 표 cafe_events의 "읽기 금지"는 그대로 두고, 이 함수 하나만 숫자 합계를 알려 준다 (security definer).
create or replace function public.cafe_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total',    (select count(*) from public.cafe_events),
    'visitors', (select count(distinct visitor) from public.cafe_events),
    'sessions', (select count(distinct session) from public.cafe_events),
    'last',     (select max(created_at) from public.cafe_events),
    'events',   coalesce((select jsonb_object_agg(name, n) from (select name, count(*) as n from public.cafe_events group by name) e), '{}'::jsonb),
    'countries',coalesce((select jsonb_object_agg(c, n) from (select coalesce(country, '??') as c, count(*) as n from public.cafe_events group by 1) k), '{}'::jsonb),
    'days',     coalesce((select jsonb_object_agg(d, n) from (select to_char(created_at at time zone 'Asia/Seoul', 'YYYY-MM-DD') as d, count(*) as n from public.cafe_events group by 1) x), '{}'::jsonb)
  );
$$;

revoke all on function public.cafe_stats() from public;
grant execute on function public.cafe_stats() to anon, authenticated;
