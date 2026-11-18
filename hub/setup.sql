-- Flow State OS member hub (diygenius.com/flow-state)
-- Run once on the Flow State OS Supabase project. Safe to re-run.

-- 1. Member profiles: full name and email for everyone who signs up,
--    from the website or the Chrome extension.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  source text,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists source text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.fs_hub_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, source)
  values (new.id, new.email,
          new.raw_user_meta_data->>'full_name',
          coalesce(new.raw_user_meta_data->>'source', 'extension'))
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        source = coalesce(public.profiles.source, excluded.source);
  return new;
end $$;

drop trigger if exists fs_hub_on_auth_user_created on auth.users;
create trigger fs_hub_on_auth_user_created
  after insert on auth.users
  for each row execute function public.fs_hub_new_user();

-- Backfill anyone who signed up through the extension before this existed.
insert into public.profiles (id, email, full_name, source)
select u.id, u.email, u.raw_user_meta_data->>'full_name', coalesce(u.raw_user_meta_data->>'source', 'extension')
from auth.users u
on conflict (id) do nothing;

-- 2. Library: the ebooks and tools shown on the page.
--    Add a row here to add a new ebook or tool. No page edit needed.
create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('ebook', 'tool')),
  stage text not null check (stage in ('focus', 'purpose', 'genius')),
  title text not null,
  description text,
  url text,          -- for tools and web pages
  file_path text,    -- for PDFs in the private "library" bucket
  status text not null default 'live' check (status in ('live', 'soon', 'hidden')),
  sort int not null default 100,
  created_at timestamptz not null default now()
);
alter table public.library_items enable row level security;
drop policy if exists "anyone can see the library list" on public.library_items;
create policy "anyone can see the library list" on public.library_items
  for select to anon, authenticated using (status <> 'hidden');

insert into public.library_items (kind, stage, title, description, url, file_path, status, sort)
select * from (values
  ('tool','focus','Flow State OS for Chrome','Your new tab becomes a focus dashboard: flow timer, website blocker, focus music, weekly goals and an AI coach.','https://www.diygenius.com/flow-state-os/',null,'live',1),
  ('ebook','focus','Flow Experience Design','Break mindless habits, build mindful ones and design your days for more time in flow.',null,'flow-experience-design.pdf','live',2),
  ('tool','purpose','Ikigai Mapper','Map what you love, what you''re good at, what helps people and what pays, then find the overlap.',null,null,'soon',3),
  ('ebook','genius','Productize Your Genius','The 7 Ps framework for turning what you know into an offer people can buy.',null,'productize-your-genius.pdf','live',4),
  ('tool','genius','Transformational Offer Builder','Talk through the 7 Ps and get a one-page offer sheet, a full offer doc and an AI file in your voice.','https://www.diygenius.com/offer-builder/',null,'live',5),
  ('ebook','genius','The 10 Mistakes Experts Make Selling Their Expertise Online','What stops experts from getting consistent clients, and what to do instead.',null,'10-mistakes-experts-make.pdf','live',6),
  ('ebook','genius','The AI Playbook for Sold Out Retreats','How to fill retreats using AI search, content and ads.','https://www.diygenius.com/the-ai-playbook-for-sold-out-retreats/',null,'live',7)
) as v(kind, stage, title, description, url, file_path, status, sort)
where not exists (select 1 from public.library_items);

-- 3. Private bucket for the ebook PDFs. Only signed-in members get a download link.
insert into storage.buckets (id, name, public)
values ('library', 'library', false)
on conflict (id) do nothing;

drop policy if exists "members read library files" on storage.objects;
create policy "members read library files" on storage.objects
  for select to authenticated using (bucket_id = 'library');
