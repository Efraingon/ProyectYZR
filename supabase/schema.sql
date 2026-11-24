-- ============================================================
-- ProyectYZR - Script SQL para PostgreSQL / Supabase
-- Ejecutar tal cual en el SQL Editor de Supabase o con psql.
-- Idempotente y tolerante: funciona aunque NO exista auth.users.
-- ============================================================

-- 1. Extensiones (opcionales; si no hay permisos se omite y se usa gen_random_uuid)
do $$
begin
  begin
    execute 'create extension if not exists pgcrypto';
  exception when others then
    raise notice 'pgcrypto no disponible: %', sqlerrm;
  end;
  begin
    execute 'create extension if not exists "uuid-ossp"';
  exception when others then
    raise notice 'uuid-ossp no disponible: %', sqlerrm;
  end;
end $$;

-- Generador de UUID compatible con ambas extensiones (o con PG 13+)
create or replace function public.app_uuid() returns uuid
language plpgsql as $$
begin
  return gen_random_uuid();
exception when undefined_function then
  return uuid_generate_v4();
end $$;

-- 2. Compatibilidad con auth.uid() de Supabase.
-- Si no existe (PostgreSQL plano), devuelve NULL y las políticas usan el modo demo.
create or replace function public.app_uid() returns uuid
language plpgsql stable as $$
declare v uuid;
begin
  execute 'select auth.uid()' into v;
  return v;
exception when others then
  return null;
end $$;

-- 3. Schema y tabla auth.users SOLO si no existen.
-- En Supabase ya existen y se omite por completo.
do $$
begin
  if not exists (select 1 from information_schema.schemata where schema_name = 'auth') then
    create schema auth;
  end if;
exception when others then
  raise notice 'No se pudo crear el schema auth: %', sqlerrm;
end $$;

do $$
begin
  -- to_regclass devuelve NULL si la tabla no existe (incluso si el schema no existe)
  if to_regclass('auth.users') is null then
    create table auth.users (
      id uuid primary key default public.app_uuid(),
      email text unique,
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    );
  end if;
exception when others then
  raise notice 'No se pudo crear auth.users: %', sqlerrm;
end $$;

-- 4. Usuario demo en auth.users SOLO si la tabla existe.
-- ON CONFLICT DO NOTHING evita duplicarlo en ejecuciones repetidas.
do $$
begin
  if to_regclass('auth.users') is not null then
    execute $ins$
      insert into auth.users (id, email, created_at, updated_at)
      values (
        '00000000-0000-0000-0000-000000000000'::uuid,
        'demo@proyectos.local',
        now(),
        now()
      )
      on conflict (id) do nothing
    $ins$;
  end if;
exception when others then
  raise notice 'No se pudo insertar el usuario demo en auth.users: %', sqlerrm;
end $$;

-- 5. Perfiles. NO dependemos de auth.users: la FK se agrega después sólo si es posible.
do $$
begin
  if to_regclass('public.profiles') is not null then
    alter table public.profiles drop constraint if exists profiles_id_fkey;
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key default public.app_uuid(),
  full_name text,
  email text,
  role text default 'user' check (role in ('user', 'admin', 'demo')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint profiles_email_check check (email is not null)
);

-- FK opcional a auth.users (sólo si la tabla existe y el usuario demo fue insertado)
do $$
begin
  if to_regclass('auth.users') is not null
     and exists (
       select 1 from auth.users
       where id = '00000000-0000-0000-0000-000000000000'::uuid
     )
     and not exists (
       select 1 from pg_constraint
       where conname = 'profiles_id_auth_users_fkey'
         and conrelid = 'public.profiles'::regclass
     ) then
    alter table public.profiles
      add constraint profiles_id_auth_users_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  end if;
exception when others then
  raise notice 'No se pudo agregar la FK a auth.users: %', sqlerrm;
end $$;

-- 6. Proyectos
create table if not exists public.projects (
  id uuid primary key default public.app_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'active', 'completed', 'archived')),
  start_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint projects_name_check check (length(name) >= 3 and length(name) <= 100)
);

-- 7. Actividades / bitácora por proyecto
create table if not exists public.project_activities (
  id uuid primary key default public.app_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references public.profiles on delete set null,
  title text not null,
  description text,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. Trigger para mantener updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_activities_updated_at on public.project_activities;
create trigger trg_activities_updated_at before update on public.project_activities
  for each row execute function public.set_updated_at();

-- 9. Índices de rendimiento
create index if not exists idx_profiles_user_id on public.profiles (id);
create index if not exists idx_projects_user_id on public.projects (user_id);
create index if not exists idx_projects_status on public.projects (status);
create index if not exists idx_projects_created on public.projects (created_at desc);
create index if not exists idx_activities_project_id on public.project_activities (project_id);
create index if not exists idx_activities_user_id on public.project_activities (user_id);

-- 10. Row Level Security
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_activities enable row level security;

drop policy if exists "Public profiles read" on public.profiles;
create policy "Public profiles read" on public.profiles
  for select using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (public.app_uid() = id) with check (public.app_uid() = id);

-- Modo demo: se permite el usuario demo aunque no haya sesión (anon key).
-- En producción elimina las cláusulas "or user_id = '00000000-...'".
drop policy if exists "Users manage own projects" on public.projects;
create policy "Users manage own projects" on public.projects
  for all
  using (
    public.app_uid() = user_id
    or user_id = '00000000-0000-0000-0000-000000000000'::uuid
  )
  with check (
    public.app_uid() = user_id
    or user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

drop policy if exists "Users manage own activities" on public.project_activities;
create policy "Users manage own activities" on public.project_activities
  for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_id
        and (
          projects.user_id = public.app_uid()
          or projects.user_id = '00000000-0000-0000-0000-000000000000'::uuid
        )
    )
  )
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_id
        and (
          projects.user_id = public.app_uid()
          or projects.user_id = '00000000-0000-0000-0000-000000000000'::uuid
        )
    )
  );

-- 11. Permisos para los roles de la API (en Supabase ya existen)
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant usage on schema public to anon;
    grant select on public.profiles to anon;
    grant select, insert, update, delete on public.projects, public.project_activities to anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant usage on schema public to authenticated;
    grant select, update on public.profiles to authenticated;
    grant select, insert, update, delete on public.projects, public.project_activities to authenticated;
  end if;
end $$;

-- 12. Perfil demo (ON CONFLICT DO NOTHING)
insert into public.profiles (id, full_name, email, role, created_at)
values (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Usuario Demo',
  'demo@proyectos.local',
  'demo',
  timezone('utc'::text, now())
) on conflict (id) do nothing;

-- 13. Datos de ejemplo opcionales (descomenta si quieres ver la tabla llena)
-- insert into public.projects (user_id, name, description, status, start_date)
-- values
--   ('00000000-0000-0000-0000-000000000000'::uuid, 'Sistema de Registro', 'Registro centralizado de proyectos', 'active', current_date),
--   ('00000000-0000-0000-0000-000000000000'::uuid, 'Portal de Clientes', 'Panel de seguimiento para clientes', 'pending', current_date);

-- 14. Comentarios de documentación
comment on table public.profiles is 'Perfiles de usuario (FK opcional a auth.users si existe)';
comment on table public.projects is 'Proyectos registrados por usuarios - RLS aplica políticas de ownership';
comment on table public.project_activities is 'Bitácora de actividades realizadas dentro de cada proyecto';
comment on column public.profiles.role is 'Rol: user (estándar), admin (administrador), demo (usuario de prueba)';
comment on column public.projects.status is 'Estado: pending, active, completed, archived';
