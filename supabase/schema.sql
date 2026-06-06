-- ============================================================
-- ReplyAI — Supabase Schema
-- Coller dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Table profiles (liée à auth.users)
create table public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  email      text not null,
  name       text not null default '',
  credits    integer not null default 20,
  is_pro     boolean not null default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;

-- Les utilisateurs peuvent lire leur propre profil
create policy "select_own_profile" on public.profiles
  for select using (auth.uid() = id);

-- Le service role peut tout faire (backend)
create policy "service_role_all" on public.profiles
  for all using (true) with check (true);

-- ── Trigger : auto-créer le profil lors de l'inscription ──────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
