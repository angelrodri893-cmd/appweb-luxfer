-- LuxFer: catalogos definitivos, disponibilidad y administracion.
-- Esta migracion complementa el esquema inicial que ya fue ejecutado.

begin;

-- El horario comercial se conserva fijo de lunes a sabado, de 08:00 a 18:00.
insert into public.horarios_atencion (dia_semana, hora_apertura, hora_cierre, activo)
values
  (1, '08:00', '18:00', true),
  (2, '08:00', '18:00', true),
  (3, '08:00', '18:00', true),
  (4, '08:00', '18:00', true),
  (5, '08:00', '18:00', true),
  (6, '08:00', '18:00', true),
  (7, '08:00', '18:00', false)
on conflict (dia_semana) do update
set hora_apertura = excluded.hora_apertura,
    hora_cierre = excluded.hora_cierre,
    activo = excluded.activo;

-- Normaliza telefonos antiguos antes de activar la restriccion definitiva.
update public.perfiles
set telefono = nullif(regexp_replace(telefono, '[^0-9]', '', 'g'), '')
where telefono is not null;

update public.perfiles
set telefono = null
where telefono is not null
  and char_length(telefono) not between 9 and 10;

alter table public.perfiles
drop constraint if exists perfiles_telefono_formato;

alter table public.perfiles
add constraint perfiles_telefono_formato
check (telefono is null or telefono ~ '^[0-9]{9,10}$');

alter table public.servicios
add column if not exists imagen_ruta text,
add column if not exists incluye text[] not null default '{}';

update public.servicios set orden = 0 where orden < 0;

alter table public.servicios
drop constraint if exists servicios_orden_no_negativo;

alter table public.servicios
add constraint servicios_orden_no_negativo check (orden >= 0);

update public.servicios
set descripcion = coalesce(
      nullif(descripcion, ''),
      'Servicio personalizado realizado con cuidado y atencion en LuxFer.'
    ),
    incluye = case
      when cardinality(incluye) = 0
        then array['Valoracion inicial', 'Preparacion del servicio', 'Recomendaciones de cuidado']
      else incluye
    end;

create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  categoria text not null,
  descripcion text not null default '',
  precio numeric(10, 2) not null check (precio >= 0),
  imagen_ruta text,
  orden integer not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists productos_activos_idx
on public.productos (activo, orden);

update public.productos set orden = 0 where orden < 0;

alter table public.productos
drop constraint if exists productos_orden_no_negativo;

alter table public.productos
add constraint productos_orden_no_negativo check (orden >= 0);

alter table public.citas
drop constraint if exists citas_notas_longitud;

update public.citas
set nota_cliente = left(nota_cliente, 500),
    nota_administradora = left(nota_administradora, 500)
where char_length(coalesce(nota_cliente, '')) > 500
   or char_length(coalesce(nota_administradora, '')) > 500;

alter table public.citas
add constraint citas_notas_longitud check (
  char_length(coalesce(nota_cliente, '')) <= 500
  and char_length(coalesce(nota_administradora, '')) <= 500
);

drop trigger if exists productos_actualizar_fecha on public.productos;
create trigger productos_actualizar_fecha
before update on public.productos
for each row execute function public.actualizar_fecha_modificacion();

insert into public.productos (slug, nombre, categoria, descripcion, precio, orden)
values
  ('limpiador-facial', 'Limpiador facial', 'Limpieza', 'Limpieza suave para complementar el cuidado diario de la piel.', 12.00, 1),
  ('serum-hidratante', 'Serum hidratante', 'Hidratacion', 'Formula ligera para acompañar la hidratacion cotidiana del rostro.', 18.00, 2),
  ('protector-solar', 'Protector solar', 'Proteccion', 'Proteccion diaria para completar una rutina sencilla de skincare.', 20.00, 3)
on conflict (slug) do nothing;

alter table public.productos enable row level security;
revoke all on public.productos from anon, authenticated;
grant select on public.productos to anon, authenticated;
grant insert, update, delete on public.productos to authenticated;

drop policy if exists productos_publicos on public.productos;
create policy productos_publicos
on public.productos for select
to anon, authenticated
using (activo = true);

drop policy if exists productos_administracion on public.productos;
create policy productos_administracion
on public.productos for all
to authenticated
using (public.es_administrador())
with check (public.es_administrador());

-- La cuenta administrativa se determina en la base, nunca desde datos editables del navegador.
create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_telefono text;
begin
  v_telefono = nullif(
    regexp_replace(coalesce(new.raw_user_meta_data ->> 'telefono', ''), '[^0-9]', '', 'g'),
    ''
  );

  insert into public.perfiles (id, nombre_completo, telefono, rol)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nombre_completo'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Cliente'
    ),
    v_telefono,
    case
      when lower(coalesce(new.email, '')) = 'info.luxferr@gmail.com'
        and new.email_confirmed_at is not null
        then 'administrador'::public.rol_usuario
      else 'cliente'::public.rol_usuario
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Revoca cualquier rol administrativo que no corresponda al correo autorizado.
update public.perfiles p
set rol = case
  when lower(coalesce(u.email, '')) = 'info.luxferr@gmail.com'
    and u.email_confirmed_at is not null
    then 'administrador'::public.rol_usuario
  else 'cliente'::public.rol_usuario
end
from auth.users u
where u.id = p.id;

-- Promueve o revoca el rol cuando Supabase confirma o cambia el correo.
create or replace function public.sincronizar_rol_por_correo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.perfiles
  set rol = case
    when lower(coalesce(new.email, '')) = 'info.luxferr@gmail.com'
      and new.email_confirmed_at is not null
      then 'administrador'::public.rol_usuario
    else 'cliente'::public.rol_usuario
  end
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists al_actualizar_correo_usuario on auth.users;
create trigger al_actualizar_correo_usuario
after update of email, email_confirmed_at on auth.users
for each row execute function public.sincronizar_rol_por_correo();

revoke execute on function public.sincronizar_rol_por_correo()
from public, anon, authenticated;

-- Devuelve unicamente horas libres; no expone informacion de otros clientes.
create or replace function public.obtener_horarios_disponibles(
  p_servicio_id uuid,
  p_fecha date
)
returns table (hora time)
language sql
stable
security definer
set search_path = ''
as $$
  select candidato.hora_local::time as hora
  from public.servicios s
  join public.horarios_atencion h
    on h.dia_semana = extract(isodow from p_fecha)::smallint
   and h.activo = true
  cross join lateral generate_series(
    p_fecha::timestamp + h.hora_apertura,
    p_fecha::timestamp + h.hora_cierre - interval '30 minutes',
    interval '30 minutes'
  ) as candidato(hora_local)
  where s.id = p_servicio_id
    and s.activo = true
    and extract(isodow from p_fecha) between 1 and 6
    and candidato.hora_local at time zone 'America/Guayaquil' > now()
    and candidato.hora_local + make_interval(mins => s.duracion_minutos)
        <= p_fecha::timestamp + h.hora_cierre
    and not exists (
      select 1
      from public.citas c
      where c.estado in ('pendiente', 'confirmada')
        and tstzrange(c.inicio, c.fin, '[)') && tstzrange(
          candidato.hora_local at time zone 'America/Guayaquil',
          (candidato.hora_local + make_interval(mins => s.duracion_minutos)) at time zone 'America/Guayaquil',
          '[)'
        )
    )
    and not exists (
      select 1
      from public.periodos_bloqueados b
      where tstzrange(b.inicio, b.fin, '[)') && tstzrange(
        candidato.hora_local at time zone 'America/Guayaquil',
        (candidato.hora_local + make_interval(mins => s.duracion_minutos)) at time zone 'America/Guayaquil',
        '[)'
      )
    )
  order by candidato.hora_local;
$$;

revoke execute on function public.obtener_horarios_disponibles(uuid, date)
from public, anon, authenticated;
grant execute on function public.obtener_horarios_disponibles(uuid, date)
to authenticated;

-- Centraliza los cambios de estado permitidos para la administradora.
create or replace function public.gestionar_cita(
  p_cita_id uuid,
  p_estado public.estado_cita,
  p_nota text default null
)
returns public.citas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cita public.citas;
begin
  if not public.es_administrador() then
    raise exception 'No tienes permisos para gestionar citas.';
  end if;

  select * into v_cita
  from public.citas
  where id = p_cita_id
  for update;

  if not found then
    raise exception 'Cita no encontrada.';
  end if;

  if not (
    (v_cita.estado = 'pendiente' and p_estado in ('confirmada', 'rechazada', 'cancelada'))
    or (v_cita.estado = 'confirmada' and p_estado in ('completada', 'cancelada'))
  ) then
    raise exception 'El cambio de estado solicitado no esta permitido.';
  end if;

  update public.citas
  set estado = p_estado,
      nota_administradora = nullif(trim(coalesce(p_nota, '')), '')
  where id = p_cita_id
  returning * into v_cita;

  return v_cita;
end;
$$;

revoke execute on function public.gestionar_cita(uuid, public.estado_cita, text)
from public, anon, authenticated;
grant execute on function public.gestionar_cita(uuid, public.estado_cita, text)
to authenticated;

-- El cliente puede reprogramar, pero la cita vuelve a revision y se limpia la nota anterior.
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
    raise exception 'Solo puedes reprogramar con al menos 24 horas de anticipacion.';
  end if;

  update public.citas
  set inicio = p_nuevo_inicio,
      estado = 'pendiente',
      nota_administradora = null
  where id = p_cita_id
  returning * into v_cita;

  return v_cita;
end;
$$;

revoke execute on function public.reprogramar_mi_cita(uuid, timestamptz)
from public, anon, authenticated;
grant execute on function public.reprogramar_mi_cita(uuid, timestamptz)
to authenticated;

-- Las imagenes son publicas; solo la administradora puede modificarlas.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalogo',
  'catalogo',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists catalogo_lectura_publica on storage.objects;
create policy catalogo_lectura_publica
on storage.objects for select
to anon, authenticated
using (bucket_id = 'catalogo');

drop policy if exists catalogo_administracion_insertar on storage.objects;
create policy catalogo_administracion_insertar
on storage.objects for insert
to authenticated
with check (bucket_id = 'catalogo' and public.es_administrador());

drop policy if exists catalogo_administracion_actualizar on storage.objects;
create policy catalogo_administracion_actualizar
on storage.objects for update
to authenticated
using (bucket_id = 'catalogo' and public.es_administrador())
with check (bucket_id = 'catalogo' and public.es_administrador());

drop policy if exists catalogo_administracion_eliminar on storage.objects;
create policy catalogo_administracion_eliminar
on storage.objects for delete
to authenticated
using (bucket_id = 'catalogo' and public.es_administrador());

commit;

-- Verificacion posterior:
-- select * from public.horarios_atencion order by dia_semana;
-- select * from public.productos order by orden;
-- select public.obtener_horarios_disponibles('<servicio-id>', current_date + 1);
