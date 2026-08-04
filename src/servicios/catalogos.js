import { supabase } from './supabase'

const camposServicio = `
  id, slug, nombre, descripcion, precio_desde, precio_hasta,
  duracion_minutos, orden, activo, imagen_ruta, incluye,
  categorias_servicio(id, nombre, slug)
`

export const listarServicios = async ({ incluirInactivos = false, limite } = {}) => {
  let consulta = supabase.from('servicios').select(camposServicio).order('orden')
  if (!incluirInactivos) consulta = consulta.eq('activo', true)
  if (limite) consulta = consulta.limit(limite)

  const { data, error } = await consulta
  if (error) throw error
  return data ?? []
}

export const obtenerServicio = async (slug) => {
  const { data, error } = await supabase
    .from('servicios')
    .select(camposServicio)
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle()

  if (error) throw error
  return data
}

export const listarProductos = async ({ incluirInactivos = false, limite } = {}) => {
  let consulta = supabase.from('productos').select('*').order('orden')
  if (!incluirInactivos) consulta = consulta.eq('activo', true)
  if (limite) consulta = consulta.limit(limite)

  const { data, error } = await consulta
  if (error) throw error
  return data ?? []
}

export const obtenerUrlImagen = (ruta) => {
  if (!ruta) return ''
  if (/^https?:\/\//.test(ruta)) return ruta

  return supabase.storage.from('catalogo').getPublicUrl(ruta).data.publicUrl
}
