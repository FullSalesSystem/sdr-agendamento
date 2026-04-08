-- ============================================
-- SDR Agendamento — Supabase Schema
-- ============================================

-- 1. Settings (one row per user)
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  closers text[] default array['Yan','José','Lorraynne'],
  sdrs text[] default array['Amiris','Marina','Samantha','Ticiane','Raúl','Stella'],
  produtos text[] default array['Aceleração','Bloqueia','Livre','Formação','Ativação','Overbook'],
  motivos text[] default array['Lead pediu para reagendar','No show'],
  config_h1 jsonb default '{"closers":["Yan","José","Lorraynne"],"overbook":1}',
  config_h2 jsonb default '{"closers":["Yan","José","Lorraynne"],"overbook":1}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Agendamentos
create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  horario text not null,
  closer text not null default '',
  produto text not null default '',
  sdr text default '',
  status text default 'Livre',
  motivo text default '',
  obs text default '',
  cancelado boolean default false,
  cancel_motivo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_agendamentos_user_date on public.agendamentos(user_id, date);
create index if not exists idx_agendamentos_user_month on public.agendamentos(user_id, date);

-- 3. RLS (Row Level Security)
alter table public.settings enable row level security;
alter table public.agendamentos enable row level security;

-- Settings: users can only see/edit their own
create policy "Users can view own settings" on public.settings
  for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.settings
  for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on public.settings
  for update using (auth.uid() = user_id);

-- Agendamentos: users can only see/edit their own
create policy "Users can view own agendamentos" on public.agendamentos
  for select using (auth.uid() = user_id);
create policy "Users can insert own agendamentos" on public.agendamentos
  for insert with check (auth.uid() = user_id);
create policy "Users can update own agendamentos" on public.agendamentos
  for update using (auth.uid() = user_id);
create policy "Users can delete own agendamentos" on public.agendamentos
  for delete using (auth.uid() = user_id);

-- 4. Function to auto-create settings on first login
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
