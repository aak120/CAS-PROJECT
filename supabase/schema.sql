-- FiQuo research backend (Supabase / Postgres)
-- Paste this whole file into Supabase → SQL Editor → New query → Run. It is safe to run again.
--
-- Privacy design:
--  * No names, emails or accounts. Each device makes a random ID (anon_id) and only sends
--    Money Check scores, unit test scores and survey answers, and only if the player opts in.
--  * The public key in the app can ONLY insert rows. Nobody can read raw rows with it.
--    Numbers come out through the functions below, which return totals and averages only.
--  * Class averages are hidden until at least 3 students have results (so no one can be singled out).
--  * forget_me() lets a device delete everything it ever sent.
--  * Survey quotes are never shown publicly until you set approved = true in the Table Editor.

-- ---------- Tables ----------
create table if not exists public.money_checks (
  id bigint generated always as identity primary key,
  anon_id uuid not null,
  phase text not null check (phase in ('pre', 'post')),
  form text not null check (form in ('A', 'B')),
  score smallint not null check (score between 0 and 30),
  total smallint not null check (total between 1 and 30 and score <= total),
  confidence smallint check (confidence between 1 and 5),
  by_cat jsonb check (by_cat is null or pg_column_size(by_cat) < 2000),
  seconds integer check (seconds between 0 and 86400),
  lessons_done smallint check (lessons_done between 0 and 500),
  country text check (char_length(country) <= 2),
  difficulty text check (difficulty in ('easy', 'normal', 'hard')),
  age_band text check (age_band in ('u13', '13-15', '16-17', '18+', 'na')),
  class_code text check (char_length(class_code) <= 12),
  created_at timestamptz not null default now(),
  unique (anon_id, phase)
);

create table if not exists public.test_results (
  id bigint generated always as identity primary key,
  anon_id uuid not null,
  unit text not null check (char_length(unit) <= 24),
  kind text not null check (kind in ('quiz', 'test')),
  pct real not null check (pct between 0 and 1),
  questions smallint check (questions between 1 and 50),
  difficulty text check (difficulty in ('easy', 'normal', 'hard')),
  country text check (char_length(country) <= 2),
  class_code text check (char_length(class_code) <= 12),
  created_at timestamptz not null default now()
);

create table if not exists public.surveys (
  id bigint generated always as identity primary key,
  anon_id uuid not null unique,
  learned smallint check (learned between 1 and 5),
  habits smallint check (habits between 1 and 5),
  nps smallint check (nps between 0 and 10),
  favourite text check (char_length(favourite) <= 40),
  quote text check (char_length(quote) <= 280),
  quote_ok boolean not null default false,
  approved boolean not null default false,
  country text check (char_length(country) <= 2),
  age_band text check (age_band in ('u13', '13-15', '16-17', '18+', 'na')),
  class_code text check (char_length(class_code) <= 12),
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  code text primary key,
  name text not null check (char_length(name) between 1 and 60),
  key_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists money_checks_class on public.money_checks (class_code);
create index if not exists test_results_class on public.test_results (class_code);
create index if not exists surveys_class on public.surveys (class_code);

-- ---------- Row level security: the app can insert, never read ----------
alter table public.money_checks enable row level security;
alter table public.test_results enable row level security;
alter table public.surveys enable row level security;
alter table public.classes enable row level security;

revoke all on public.money_checks, public.test_results, public.surveys, public.classes from anon, authenticated;
grant insert on public.money_checks, public.test_results, public.surveys to anon, authenticated;

drop policy if exists "app can insert" on public.money_checks;
create policy "app can insert" on public.money_checks for insert to anon, authenticated with check (true);
drop policy if exists "app can insert" on public.test_results;
create policy "app can insert" on public.test_results for insert to anon, authenticated with check (true);
drop policy if exists "app can insert" on public.surveys;
create policy "app can insert" on public.surveys for insert to anon, authenticated with check (approved = false);
-- classes: no policies, so only the functions below (and you, in the dashboard) can touch it.

-- ---------- Statistics (shared by the public impact page and teacher dashboards) ----------
-- p_code = null → everyone; otherwise one class.
create or replace function public.impact_stats_for(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with mc as (
    select * from money_checks where p_code is null or class_code = p_code
  ),
  -- A fair before/after pair: the "before" check was taken early (3 lessons or fewer)
  -- and the "after" check came later with more lessons done.
  pairs as (
    select a.anon_id,
           a.score::numeric / a.total as pre, b.score::numeric / b.total as post,
           a.confidence as c_pre, b.confidence as c_post,
           a.by_cat as cat_pre, b.by_cat as cat_post
    from mc a join mc b on a.anon_id = b.anon_id and a.phase = 'pre' and b.phase = 'post'
    where b.created_at > a.created_at and a.lessons_done <= 3 and b.lessons_done > a.lessons_done
  ),
  cats as (
    select k as cat,
           avg((p.cat_pre -> k ->> 0)::numeric / nullif((p.cat_pre -> k ->> 1)::numeric, 0)) as pre,
           avg((p.cat_post -> k ->> 0)::numeric / nullif((p.cat_post -> k ->> 1)::numeric, 0)) as post,
           count(*) as n
    from pairs p, jsonb_object_keys(coalesce(p.cat_pre, '{}'::jsonb)) as k
    where p.cat_post ? k
    group by k
  ),
  tr as (select * from test_results where p_code is null or class_code = p_code),
  sv as (select * from surveys where p_code is null or class_code = p_code),
  learners as (
    select anon_id from mc union select anon_id from tr union select anon_id from sv
  )
  select jsonb_build_object(
    'learners', (select count(*) from learners),
    'countries', (select coalesce(jsonb_object_agg(country, n), '{}'::jsonb) from (
        select country, count(distinct anon_id) as n from (
          select anon_id, country from mc union all select anon_id, country from tr union all select anon_id, country from sv
        ) x where country is not null group by country) c),
    'checks_pre', (select count(*) from mc where phase = 'pre'),
    'checks_post', (select count(*) from mc where phase = 'post'),
    'pairs', (select count(*) from pairs),
    'avg_pre', (select round(avg(pre) * 100, 1) from pairs),
    'avg_post', (select round(avg(post) * 100, 1) from pairs),
    'avg_gain', (select round(avg(post - pre) * 100, 1) from pairs),
    'sd_gain', (select round(stddev_samp(post - pre) * 100, 1) from pairs),
    'pct_improved', (select round(avg(case when post > pre then 1 else 0 end) * 100) from pairs),
    'conf_pre', (select round(avg(c_pre), 2) from pairs),
    'conf_post', (select round(avg(c_post), 2) from pairs),
    'by_cat', (select coalesce(jsonb_object_agg(cat, jsonb_build_object('pre', round(pre * 100), 'post', round(post * 100), 'n', n)), '{}'::jsonb) from cats),
    'tests', (select count(*) from tr where kind = 'test'),
    'quizzes', (select count(*) from tr where kind = 'quiz'),
    'avg_test', (select round(avg(pct) * 100) from tr where kind = 'test'),
    'units', (select coalesce(jsonb_object_agg(unit, jsonb_build_object('avg', a, 'n', n)), '{}'::jsonb) from (
        select unit, round(avg(pct) * 100) as a, count(*) as n from tr where kind = 'test' group by unit) u),
    'surveys', (select count(*) from sv),
    'learned_agree', (select round(avg(case when learned >= 4 then 1 else 0 end) * 100) from sv where learned is not null),
    'habits_agree', (select round(avg(case when habits >= 4 then 1 else 0 end) * 100) from sv where habits is not null),
    'nps', (select round((avg(case when nps >= 9 then 1 else 0 end) - avg(case when nps <= 6 then 1 else 0 end)) * 100) from sv where nps is not null),
    'favourites', (select coalesce(jsonb_object_agg(favourite, n), '{}'::jsonb) from (
        select favourite, count(*) as n from sv where favourite is not null group by favourite) f),
    'quotes', (select coalesce(jsonb_agg(jsonb_build_object('q', quote, 'age', age_band, 'country', country)), '[]'::jsonb) from (
        select quote, age_band, country from sv where approved and quote_ok and quote is not null order by created_at desc limit 8) q),
    'updated', now()
  );
$$;
revoke all on function public.impact_stats_for(text) from public, anon, authenticated;

-- Public numbers for the "Our story" page.
create or replace function public.public_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$ select impact_stats_for(null); $$;

-- ---------- Classes (teacher dashboards) ----------
-- Creates a class and returns its join code plus a secret teacher key (shown once).
create or replace function public.create_class(p_name text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_code text;
  v_key text := replace(gen_random_uuid()::text, '-', '');
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
begin
  if p_name is null or char_length(trim(p_name)) = 0 or char_length(p_name) > 60 then
    raise exception 'Class name must be 1-60 characters';
  end if;
  loop
    v_code := 'FQ-';
    for i in 1..6 loop
      v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from classes where code = v_code);
  end loop;
  insert into classes (code, name, key_hash) values (v_code, trim(p_name), encode(sha256(convert_to(v_key, 'UTF8')), 'hex'));
  return jsonb_build_object('code', v_code, 'key', v_key, 'name', trim(p_name));
end;
$$;

-- Students check a code before joining. Returns the class name, or null.
create or replace function public.class_name(p_code text)
returns text
language sql
stable
security definer
set search_path = public
as $$ select name from classes where code = upper(trim(p_code)); $$;

-- Teacher dashboard: averages only, and hidden until a class has at least 3 learners with results.
create or replace function public.class_stats(p_code text, p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  c classes%rowtype;
  s jsonb;
begin
  select * into c from classes where code = upper(trim(p_code));
  if not found or c.key_hash <> encode(sha256(convert_to(coalesce(p_key, ''), 'UTF8')), 'hex') then
    raise exception 'Wrong class code or teacher key';
  end if;
  s := impact_stats_for(c.code);
  if (s ->> 'learners')::int < 3 then
    s := jsonb_build_object('learners', s -> 'learners', 'hidden', true);
  elsif (s ->> 'pairs')::int < 3 then
    s := s - 'avg_pre' - 'avg_post' - 'avg_gain' - 'sd_gain' - 'pct_improved' - 'conf_pre' - 'conf_post' - 'by_cat';
  end if;
  return s || jsonb_build_object('name', c.name, 'code', c.code, 'created', c.created_at);
end;
$$;

-- Deletes everything a device has sent (its anon_id is a random secret only that device knows).
create or replace function public.forget_me(p_anon uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = public
as $$
declare n integer := 0; k integer;
begin
  delete from money_checks where anon_id = p_anon; get diagnostics k = row_count; n := n + k;
  delete from test_results where anon_id = p_anon; get diagnostics k = row_count; n := n + k;
  delete from surveys where anon_id = p_anon; get diagnostics k = row_count; n := n + k;
  return n;
end;
$$;

revoke all on function public.public_stats(), public.create_class(text), public.class_name(text), public.class_stats(text, text), public.forget_me(uuid) from public;
grant execute on function public.public_stats(), public.create_class(text), public.class_name(text), public.class_stats(text, text), public.forget_me(uuid) to anon, authenticated;
