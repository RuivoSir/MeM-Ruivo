-- Mutantes & Malfeitores — Mesa Virtual
-- Rode este arquivo inteiro no SQL Editor do Supabase (Dashboard > SQL Editor > New query).
-- Pode rodar de novo com segurança: usa "if not exists" / "or replace" onde possível.

-- ---------------------------------------------------------------------------
-- 1. TABELAS
-- ---------------------------------------------------------------------------

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- Cria o perfil sozinho quando alguém se registra (o nome de exibição vem
-- de options.data.display_name no supabase.auth.signUp do app).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create table if not exists rooms (
  code text primary key,
  name text not null,
  owner_uid uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists room_members (
  room_code text not null references rooms(code) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('gm', 'player')),
  joined_at timestamptz not null default now(),
  primary key (room_code, user_id)
);

create table if not exists characters (
  room_code text not null references rooms(code) on delete cascade,
  owner_uid uuid not null references auth.users(id) on delete cascade,
  hero_name text default '',
  player_name text default '',
  identity text default '',
  secret_identity boolean default true,
  gender text default '',
  age text default '',
  height text default '',
  weight text default '',
  eyes text default '',
  hair text default '',
  group_name text default '',
  base_of_operations text default '',
  power_level integer default 10,
  photo_url text default '',
  points_breakdown jsonb default '{"abilities":0,"powers":0,"advantages":0,"skills":0,"defenses":0}',
  abilities jsonb default '{}',
  defenses jsonb default '{}',
  initiative integer default 0,
  attacks jsonb default '[]',
  skill_ranks jsonb default '{}',
  advantages jsonb default '[]',
  powers jsonb default '[]',
  equipment jsonb default '[]',
  complications text default '',
  hero_points integer default 1,
  power_points integer default 0,
  updated_at timestamptz not null default now(),
  primary key (room_code, owner_uid)
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  name text not null,
  phone text default '',
  description text default '',
  photo_url text default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  name text not null,
  info text default '',
  description text default '',
  photo_url text default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists npcs (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  name text not null,
  bio text default '',
  photo_url text default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists npc_news (
  id uuid primary key default gen_random_uuid(),
  npc_id uuid not null references npcs(id) on delete cascade,
  room_code text not null references rooms(code) on delete cascade,
  title text default '',
  body text default '',
  photo_url text default '',
  author_uid uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Log de rolagens de dados: qualquer membro pode registrar a própria
-- rolagem, mas só o mestre (ou super-admin) pode LER o log — ver política
-- dice_rolls_select mais abaixo.
create table if not exists dice_rolls (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  user_id uuid references auth.users(id),
  character_name text default '',
  label text default '',
  die_result integer not null,
  modifier integer not null default 0,
  total integer not null,
  is_critical boolean not null default false,
  is_fumble boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. FUNÇÕES AUXILIARES (security definer: evitam recursão nas policies)
-- ---------------------------------------------------------------------------

-- Super-admin: acesso total a QUALQUER sala do sistema, identificado pelo
-- e-mail da conta (não precisa ser membro/mestre de uma sala específica).
-- Para adicionar/trocar quem é super-admin, edite a lista abaixo e rode este
-- arquivo de novo — depois ajuste também SUPER_ADMIN_EMAIL em
-- src/supabaseConfig.js para a UI (botões de mestre) acompanhar.
create or replace function is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') in (
    'silva.paulosoares07@gmail.com'
  );
$$;

create or replace function is_room_member(_room_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select is_super_admin() or exists (
    select 1 from room_members
    where room_code = _room_code and user_id = auth.uid()
  );
$$;

create or replace function is_room_gm(_room_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select is_super_admin() or exists (
    select 1 from room_members
    where room_code = _room_code and user_id = auth.uid() and role = 'gm'
  );
$$;

create or replace function is_room_owner(_room_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select is_super_admin() or exists (
    select 1 from rooms
    where code = _room_code and owner_uid = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table rooms enable row level security;
alter table room_members enable row level security;
alter table characters enable row level security;
alter table contacts enable row level security;
alter table locations enable row level security;
alter table npcs enable row level security;
alter table npc_news enable row level security;
alter table dice_rolls enable row level security;

drop policy if exists "profiles_self" on profiles;
create policy "profiles_self" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "rooms_select" on rooms;
create policy "rooms_select" on rooms
  for select using (auth.uid() is not null);

drop policy if exists "rooms_insert" on rooms;
create policy "rooms_insert" on rooms
  for insert with check (owner_uid = auth.uid());

drop policy if exists "rooms_update" on rooms;
create policy "rooms_update" on rooms
  for update using (is_room_gm(code));

drop policy if exists "members_select" on room_members;
create policy "members_select" on room_members
  for select using (is_room_member(room_code));

drop policy if exists "members_insert" on room_members;
create policy "members_insert" on room_members
  for insert with check (
    user_id = auth.uid()
    and (role = 'player' or (role = 'gm' and is_room_owner(room_code)))
  );

drop policy if exists "members_update" on room_members;
create policy "members_update" on room_members
  for update using (is_room_gm(room_code));

drop policy if exists "members_delete" on room_members;
create policy "members_delete" on room_members
  for delete using (is_room_gm(room_code) or user_id = auth.uid());

drop policy if exists "characters_select" on characters;
create policy "characters_select" on characters
  for select using (is_room_member(room_code));

drop policy if exists "characters_write" on characters;
create policy "characters_write" on characters
  for all
  using (is_room_member(room_code) and (owner_uid = auth.uid() or is_room_gm(room_code)))
  with check (is_room_member(room_code) and (owner_uid = auth.uid() or is_room_gm(room_code)));

drop policy if exists "contacts_select" on contacts;
create policy "contacts_select" on contacts
  for select using (is_room_member(room_code));
drop policy if exists "contacts_write" on contacts;
create policy "contacts_write" on contacts
  for all using (is_room_gm(room_code)) with check (is_room_gm(room_code));

drop policy if exists "locations_select" on locations;
create policy "locations_select" on locations
  for select using (is_room_member(room_code));
drop policy if exists "locations_write" on locations;
create policy "locations_write" on locations
  for all using (is_room_gm(room_code)) with check (is_room_gm(room_code));

drop policy if exists "npcs_select" on npcs;
create policy "npcs_select" on npcs
  for select using (is_room_member(room_code));
drop policy if exists "npcs_write" on npcs;
create policy "npcs_write" on npcs
  for all using (is_room_gm(room_code)) with check (is_room_gm(room_code));

drop policy if exists "npc_news_select" on npc_news;
create policy "npc_news_select" on npc_news
  for select using (is_room_member(room_code));
drop policy if exists "npc_news_write" on npc_news;
create policy "npc_news_write" on npc_news
  for all using (is_room_gm(room_code)) with check (is_room_gm(room_code));

-- Qualquer membro da sala pode REGISTRAR sua própria rolagem...
drop policy if exists "dice_rolls_insert" on dice_rolls;
create policy "dice_rolls_insert" on dice_rolls
  for insert with check (is_room_member(room_code) and user_id = auth.uid());
-- ...mas só o mestre (ou super-admin) pode LER o log de rolagens.
drop policy if exists "dice_rolls_select" on dice_rolls;
create policy "dice_rolls_select" on dice_rolls
  for select using (is_room_gm(room_code));

-- ---------------------------------------------------------------------------
-- 4. REALTIME (para as telas atualizarem sozinhas, tipo Firestore onSnapshot)
-- ---------------------------------------------------------------------------
-- Em um DO block com checagem prévia: "alter publication ... add table" não
-- aceita "if not exists", então sem isso rodar este arquivo pela segunda vez
-- quebraria aqui.

do $$
declare
  t text;
begin
  foreach t in array array[
    'rooms', 'room_members', 'characters', 'contacts',
    'locations', 'npcs', 'npc_news', 'dice_rolls'
  ]
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 5. STORAGE (fotos de fichas, contatos, locais e notícias)
-- ---------------------------------------------------------------------------
-- Bucket público de leitura (fotos de uma mesa de RPG entre amigos não são
-- sigilosas) mas só membros da sala podem enviar/editar/remover arquivos.

insert into storage.buckets (id, name, public)
values ('room-photos', 'room-photos', true)
on conflict (id) do nothing;

drop policy if exists "room_photos_read" on storage.objects;
create policy "room_photos_read" on storage.objects
  for select using (bucket_id = 'room-photos');

drop policy if exists "room_photos_insert" on storage.objects;
create policy "room_photos_insert" on storage.objects
  for insert with check (
    bucket_id = 'room-photos'
    and is_room_member((storage.foldername(name))[2])
  );

drop policy if exists "room_photos_update" on storage.objects;
create policy "room_photos_update" on storage.objects
  for update using (
    bucket_id = 'room-photos'
    and is_room_member((storage.foldername(name))[2])
  );

drop policy if exists "room_photos_delete" on storage.objects;
create policy "room_photos_delete" on storage.objects
  for delete using (
    bucket_id = 'room-photos'
    and is_room_member((storage.foldername(name))[2])
  );
