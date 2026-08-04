-- LuxFer: esquema inicial para Supabase
-- Zona horaria comercial: America/Guayaquil
-- Ejecutar una sola vez desde Supabase > SQL Editor.

begin;

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.rol_usuario as enum ('cliente', 'administrador');
create type public.estado_cita as enum (
  'pendiente',
  'confirmada',
  'completada',
  'rechazada',
  'cancelada'
);

create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null default '',
  telefono text,
  rol public.rol_usuario not null default 'cliente',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.categorias_servicio (
  id bigint generated always as identity primary key,
  slug text not null unique,
  nombre text not null,
  descripcion text,
  orden integer not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  categoria_id bigint not null references public.categorias_servicio(id),
  slug text not null unique,
  nombre text not null,
  descripcion text,
  precio_desde numeric(10, 2) not null check (precio_desde >= 0),
  precio_hasta numeric(10, 2) check (
    precio_hasta is null or precio_hasta >= precio_desde
  ),
  duracion_minutos integer not null check (duracion_minutos between 15 and 720),
  orden integer not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- ISO: lunes = 1, domingo = 7.
create table public.horarios_atencion (
  dia_semana smallint primary key check (dia_semana between 1 and 7),
  hora_apertura time not null,
  hora_cierre time not null,
  activo boolean not null default true,
  actualizado_en timestamptz not null default now(),
  check (hora_cierre > hora_apertura)
);

create table public.periodos_bloqueados (
  id uuid primary key default gen_random_uuid(),
  inicio timestamptz not null,
  fin timestamptz not null,
  motivo text,
  creado_por uuid references public.perfiles(id) on delete set null,
  creado_en timestamptz not null default now(),
  check (fin > inicio)
);

create table public.citas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles(id) on delete restrict,
  servicio_id uuid not null references public.servicios(id) on delete restrict,
  inicio timestamptz not null,
  fin timestamptz not null,
  estado public.estado_cita not null default 'pendiente',
  nota_cliente text,
  nota_administradora text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  check (fin > inicio),
  constraint citas_sin_solapamiento
    exclude using gist (
      tstzrange(inicio, fin, '[)') with &&
    )
    where (estado in ('pendiente', 'confirmada'))
);

create index perfiles_rol_idx on public.perfiles(rol);
create index servicios_categoria_idx on public.servicios(categoria_id);
create index servicios_activos_idx on public.servicios(activo, orden);
create index citas_usuario_inicio_idx on public.citas(usuario_id, inicio desc);
create index citas_estado_inicio_idx on public.citas(estado, inicio);
create index periodos_bloqueados_rango_idx
  on public.periodos_bloqueados using gist (tstzrange(inicio, fin, '[)'));

create or replace function public.actualizar_fecha_modificacion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create or replace function public.es_administrador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfiles
    where id = (select auth.uid())
      and rol = 'administrador'
  );
$$;

create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre_completo, telefono, rol)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nombre_completo', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Cliente'
    ),
    nullif(new.raw_user_meta_data ->> 'telefono', ''),
    case
      when lower(coalesce(new.email, '')) = 'info.luxferr@gmail.com'
        then 'administrador'::public.rol_usuario
      else 'cliente'::public.rol_usuario
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.preparar_y_validar_cita()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_duracion integer;
  v_inicio_local timestamp;
  v_fin_local timestamp;
  v_dia smallint;
begin
  -- Desde el navegador, cada cliente solo puede crear citas para sí mismo.
  if tg_op = 'INSERT' and not public.es_administrador() then
    new.usuario_id = (select auth.uid());
    new.estado = 'pendiente';
  end if;

  select duracion_minutos
  into v_duracion
  from public.servicios
  where id = new.servicio_id
    and activo = true;

  if v_duracion is null then
    raise exception 'El servicio seleccionado no está disponible.';
  end if;

  new.fin = new.inicio + make_interval(mins => v_duracion);

  if new.inicio <= now() then
    raise exception 'La cita debe programarse para una fecha futura.';
  end if;

  v_inicio_local = new.inicio at time zone 'America/Guayaquil';
  v_fin_local = new.fin at time zone 'America/Guayaquil';
  v_dia = extract(isodow from v_inicio_local)::smallint;

  if not exists (
    select 1
    from public.horarios_atencion h
    where h.dia_semana = v_dia
      and h.activo = true
      and v_inicio_local::date = v_fin_local::date
      and v_inicio_local::time >= h.hora_apertura
      and v_fin_local::time <= h.hora_cierre
  ) then
    raise exception 'El horario solicitado está fuera del horario de atención.';
  end if;

  if exists (
    select 1
    from public.periodos_bloqueados b
    where tstzrange(b.inicio, b.fin, '[)') && tstzrange(new.inicio, new.fin, '[)')
  ) then
    raise exception 'El horario solicitado no está disponible.';
  end if;

  return new;
end;
$$;

create trigger perfiles_actualizar_fecha
before update on public.perfiles
for each row execute function public.actualizar_fecha_modificacion();

create trigger categorias_actualizar_fecha
before update on public.categorias_servicio
for each row execute function public.actualizar_fecha_modificacion();

create trigger servicios_actualizar_fecha
before update on public.servicios
for each row execute function public.actualizar_fecha_modificacion();

create trigger horarios_actualizar_fecha
before update on public.horarios_atencion
for each row execute function public.actualizar_fecha_modificacion();

create trigger citas_actualizar_fecha
before update on public.citas
for each row execute function public.actualizar_fecha_modificacion();

create trigger citas_preparar_insert
before insert on public.citas
for each row execute function public.preparar_y_validar_cita();

create trigger citas_preparar_reprogramacion
before update of inicio, servicio_id on public.citas
for each row execute function public.preparar_y_validar_cita();

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
after insert on auth.users
for each row execute function public.crear_perfil_usuario();

-- Cancelación del cliente: únicamente con 24 horas o más de anticipación.
create or replace function public.cancelar_mi_cita(p_cita_id uuid)
returns public.citas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cita public.citas;
begin
  select * into v_cita
  from public.citas
  where id = p_cita_id
    and usuario_id = (select auth.uid());

  if not found then
    raise exception 'Cita no encontrada.';
  end if;

  if v_cita.estado not in ('pendiente', 'confirmada') then
    raise exception 'Esta cita ya no puede cancelarse.';
  end if;

  if v_cita.inicio < now() + interval '24 hours' then
    raise exception 'Solo puedes cancelar con al menos 24 horas de anticipación.';
  end if;

  update public.citas
  set estado = 'cancelada'
  where id = p_cita_id
  returning * into v_cita;

  return v_cita;
end;
$$;

-- Reprogramar cambia el estado nuevamente a pendiente.
create or replace function public.reprogramar_mi_cita(
  p_cita_id uuid,
  p_nuevo_inicio timestamptz
)
returns public.citas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cita public.citas;
begin
  select * into v_cita
  from public.citas
  where id = p_cita_id
    and usuario_id = (select auth.uid());

  if not found then
    raise exception 'Cita no encontrada.';
  end if;

  if v_cita.estado not in ('pendiente', 'confirmada') then
    raise exception 'Esta cita ya no puede reprogramarse.';
  end if;

  if v_cita.inicio < now() + interval '24 hours' then
    raise exception 'Solo puedes reprogramar con al menos 24 horas de anticipación.';
  end if;

  update public.citas
  set inicio = p_nuevo_inicio,
      estado = 'pendiente'
  where id = p_cita_id
  returning * into v_cita;

  return v_cita;
end;
$$;

alter table public.perfiles enable row level security;
alter table public.categorias_servicio enable row level security;
alter table public.servicios enable row level security;
alter table public.horarios_atencion enable row level security;
alter table public.periodos_bloqueados enable row level security;
alter table public.citas enable row level security;

-- Se eliminan permisos implícitos y se conceden solo los necesarios.
revoke all on public.perfiles from anon, authenticated;
revoke all on public.categorias_servicio from anon, authenticated;
revoke all on public.servicios from anon, authenticated;
revoke all on public.horarios_atencion from anon, authenticated;
revoke all on public.periodos_bloqueados from anon, authenticated;
revoke all on public.citas from anon, authenticated;

grant select on public.perfiles to authenticated;
grant update (nombre_completo, telefono) on public.perfiles to authenticated;

grant select on public.categorias_servicio, public.servicios, public.horarios_atencion
  to anon, authenticated;
grant insert, update, delete on public.categorias_servicio, public.servicios, public.horarios_atencion
  to authenticated;
grant usage, select on sequence public.categorias_servicio_id_seq to authenticated;

grant select, insert, update, delete on public.periodos_bloqueados to authenticated;
grant select, insert, update on public.citas to authenticated;

create policy perfiles_ver
on public.perfiles for select
to authenticated
using (id = (select auth.uid()) or public.es_administrador());

create policy perfiles_actualizar_propios
on public.perfiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy categorias_publicas
on public.categorias_servicio for select
to anon, authenticated
using (activo = true);

create policy categorias_administracion
on public.categorias_servicio for all
to authenticated
using (public.es_administrador())
with check (public.es_administrador());

create policy servicios_publicos
on public.servicios for select
to anon, authenticated
using (activo = true);

create policy servicios_administracion
on public.servicios for all
to authenticated
using (public.es_administrador())
with check (public.es_administrador());

create policy horarios_publicos
on public.horarios_atencion for select
to anon, authenticated
using (activo = true);

create policy horarios_administracion
on public.horarios_atencion for all
to authenticated
using (public.es_administrador())
with check (public.es_administrador());

create policy bloqueos_administracion
on public.periodos_bloqueados for all
to authenticated
using (public.es_administrador())
with check (public.es_administrador());

create policy citas_ver_propias
on public.citas for select
to authenticated
using (usuario_id = (select auth.uid()));

create policy citas_ver_administradora
on public.citas for select
to authenticated
using (public.es_administrador());

create policy citas_crear_propias
on public.citas for insert
to authenticated
with check (
  usuario_id = (select auth.uid())
  and estado = 'pendiente'
);

create policy citas_crear_administradora
on public.citas for insert
to authenticated
with check (public.es_administrador());

create policy citas_actualizar_administradora
on public.citas for update
to authenticated
using (public.es_administrador())
with check (public.es_administrador());

revoke execute on function public.actualizar_fecha_modificacion() from public, anon, authenticated;
revoke execute on function public.crear_perfil_usuario() from public, anon, authenticated;
revoke execute on function public.preparar_y_validar_cita() from public, anon, authenticated;
revoke execute on function public.es_administrador() from public, anon, authenticated;
revoke execute on function public.cancelar_mi_cita(uuid) from public, anon, authenticated;
revoke execute on function public.reprogramar_mi_cita(uuid, timestamptz) from public, anon, authenticated;

grant execute on function public.es_administrador() to authenticated;
grant execute on function public.cancelar_mi_cita(uuid) to authenticated;
grant execute on function public.reprogramar_mi_cita(uuid, timestamptz) to authenticated;

-- Categorías iniciales.
insert into public.categorias_servicio (slug, nombre, descripcion, orden)
values
  ('manicura', 'Manicura', 'Cuidado, fortalecimiento y diseño para tus uñas.', 1),
  ('pedicura', 'Pedicura', 'Cuidado y acabados para tus pies.', 2),
  ('cuidado-capilar', 'Cuidado capilar', 'Tratamientos de renovación y color para tu cabello.', 3);

-- Servicios, precios y duraciones estimadas editables.
insert into public.servicios (
  categoria_id,
  slug,
  nombre,
  precio_desde,
  precio_hasta,
  duracion_minutos,
  orden
)
values
  ((select id from public.categorias_servicio where slug = 'manicura'), 'soft-gel', 'Soft gel', 18, null, 120, 1),
  ((select id from public.categorias_servicio where slug = 'manicura'), 'base-rubber', 'Base rubber', 13, null, 90, 2),
  ((select id from public.categorias_servicio where slug = 'manicura'), 'acrilico', 'Acrílico', 18, null, 150, 3),
  ((select id from public.categorias_servicio where slug = 'manicura'), 'polygel', 'Polygel', 18, null, 150, 4),
  ((select id from public.categorias_servicio where slug = 'manicura'), 'semipermanente-manos', 'Semipermanente', 13, null, 60, 5),
  ((select id from public.categorias_servicio where slug = 'manicura'), 'manicura-rusa', 'Manicura rusa', 5, null, 45, 6),
  ((select id from public.categorias_servicio where slug = 'manicura'), 'dipping', 'Dipping', 13, null, 90, 7),
  ((select id from public.categorias_servicio where slug = 'manicura'), 'builder-gel', 'Builder gel', 15, 18, 120, 8),

  ((select id from public.categorias_servicio where slug = 'pedicura'), 'tradicional-pies', 'Tradicional', 3.50, null, 45, 1),
  ((select id from public.categorias_servicio where slug = 'pedicura'), 'semipermanente-pies', 'Semipermanente', 10, null, 60, 2),
  ((select id from public.categorias_servicio where slug = 'pedicura'), 'limpieza-pies', 'Limpieza', 3, null, 45, 3),
  ((select id from public.categorias_servicio where slug = 'pedicura'), 'acripies', 'Acripies', 15, null, 120, 4),
  ((select id from public.categorias_servicio where slug = 'pedicura'), 'tecnica-del-hilo', 'Técnica del hilo', 10, null, 60, 5),

  ((select id from public.categorias_servicio where slug = 'cuidado-capilar'), 'keratina', 'Keratina', 60, null, 180, 1),
  ((select id from public.categorias_servicio where slug = 'cuidado-capilar'), 'botox-capilar', 'Botox capilar', 80, null, 180, 2),
  ((select id from public.categorias_servicio where slug = 'cuidado-capilar'), 'repolarizacion', 'Repolarización', 30, null, 120, 3),
  ((select id from public.categorias_servicio where slug = 'cuidado-capilar'), 'coctel-de-ampollas', 'Cóctel de ampollas', 50, null, 90, 4),
  ((select id from public.categorias_servicio where slug = 'cuidado-capilar'), 'hidratacion', 'Hidratación', 25, null, 60, 5),
  ((select id from public.categorias_servicio where slug = 'cuidado-capilar'), 'limpieza-profunda', 'Limpieza profunda', 20, null, 60, 6),
  ((select id from public.categorias_servicio where slug = 'cuidado-capilar'), 'rayitos', 'Rayitos', 20, null, 180, 7),
  ((select id from public.categorias_servicio where slug = 'cuidado-capilar'), 'tinturado', 'Tinturado', 25, null, 150, 8),
  ((select id from public.categorias_servicio where slug = 'cuidado-capilar'), 'mechas', 'Mechas', 60, null, 240, 9),
  ((select id from public.categorias_servicio where slug = 'cuidado-capilar'), 'mechones', 'Mechones', 80, null, 240, 10);

-- Atención todos los días de 08:00 a 18:00.
insert into public.horarios_atencion (dia_semana, hora_apertura, hora_cierre, activo)
values
  (1, '08:00', '18:00', true),
  (2, '08:00', '18:00', true),
  (3, '08:00', '18:00', true),
  (4, '08:00', '18:00', true),
  (5, '08:00', '18:00', true),
  (6, '08:00', '18:00', true),
  (7, '08:00', '18:00', true);

-- Sincroniza usuarios que se hayan registrado antes de ejecutar esta migración.
insert into public.perfiles (id, nombre_completo, telefono, rol)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'nombre_completo', ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'Cliente'
  ),
  nullif(u.raw_user_meta_data ->> 'telefono', ''),
  case
    when lower(coalesce(u.email, '')) = 'info.luxferr@gmail.com'
      then 'administrador'::public.rol_usuario
    else 'cliente'::public.rol_usuario
  end
from auth.users u
on conflict (id) do update
set rol = case
  when excluded.rol = 'administrador'::public.rol_usuario
    then 'administrador'::public.rol_usuario
  else public.perfiles.rol
end;

commit;

-- Verificación rápida posterior a la ejecución:
-- select * from public.categorias_servicio order by orden;
-- select nombre, precio_desde, precio_hasta, duracion_minutos from public.servicios order by categoria_id, orden;
-- select * from public.horarios_atencion order by dia_semana;
