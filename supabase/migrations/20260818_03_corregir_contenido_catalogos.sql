-- LuxFer: correcciones seguras de contenido en registros que conservan textos conocidos.
-- Ejecuta primero las consultas de previsualizacion y confirma que solo aparezcan
-- los registros esperados. La migracion no modifica precios, imagenes ni citas.

-- Previsualizacion antes de aplicar:
-- select s.id, s.nombre, c.slug as categoria, s.descripcion, s.incluye
-- from public.servicios s
-- join public.categorias_servicio c on c.id = s.categoria_id
-- where s.descripcion in (
--   'Servicio personalizado realizado con cuidado y atencion en LuxFer.',
--   'Servicio personalizado realizado con cuidado y atención en LuxFer.'
-- )
-- or s.incluye && array['Valoracion inicial', 'Preparacion del servicio'];
--
-- select id, nombre, categoria, descripcion
-- from public.productos
-- where categoria in ('Tratamiento Capilares', 'Tratamiento capilares')
--    or nombre = 'Ritual Botanico'
--    or descripcion ilike '%sin formal%';

begin;

update public.servicios s
set descripcion = case c.slug
  when 'manicura' then 'Cuidado de uñas realizado de forma personalizada en LuxFer.'
  when 'pedicura' then 'Cuidado de pies realizado de forma personalizada en LuxFer.'
  when 'cuidado-capilar' then 'Tratamiento capilar realizado de forma personalizada en LuxFer.'
  else s.descripcion
end
from public.categorias_servicio c
where c.id = s.categoria_id
  and s.descripcion in (
    'Servicio personalizado realizado con cuidado y atencion en LuxFer.',
    'Servicio personalizado realizado con cuidado y atención en LuxFer.'
  );

update public.servicios
set incluye = array_replace(
  array_replace(incluye, 'Valoracion inicial', 'Valoración inicial'),
  'Preparacion del servicio',
  'Preparación del servicio'
)
where incluye && array['Valoracion inicial', 'Preparacion del servicio'];

update public.productos
set categoria = 'Tratamientos capilares'
where categoria in ('Tratamiento Capilares', 'Tratamiento capilares');

update public.productos
set nombre = 'Ritual Botánico'
where nombre = 'Ritual Botanico';

update public.productos
set descripcion = replace(descripcion, 'sin formal', 'sin formol')
where descripcion like '%sin formal%';

commit;

-- Verificacion posterior: ambas consultas deben devolver cero filas.
-- select id, nombre from public.servicios
-- where descripcion in (
--   'Servicio personalizado realizado con cuidado y atencion en LuxFer.',
--   'Servicio personalizado realizado con cuidado y atención en LuxFer.'
-- ) or incluye && array['Valoracion inicial', 'Preparacion del servicio'];
--
-- select id, nombre, categoria, descripcion from public.productos
-- where categoria in ('Tratamiento Capilares', 'Tratamiento capilares')
--    or nombre = 'Ritual Botanico'
--    or descripcion like '%sin formal%';
