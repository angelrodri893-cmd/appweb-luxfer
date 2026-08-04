import { supabase } from './supabase'
import { crearSlug } from '../utilidades/validaciones'

export const listarCitasAdministracion = async () => {
  const { data, error } = await supabase
    .from('citas')
    .select(`
      id, inicio, fin, estado, nota_cliente, nota_administradora, creado_en,
      perfiles(id, nombre_completo, telefono),
      servicios(id, nombre, slug, duracion_minutos)
    `)
    .order('inicio')

  if (error) throw error
  return data ?? []
}

export const gestionarCita = async (citaId, estado, nota) => {
  const { data, error } = await supabase.rpc('gestionar_cita', {
    p_cita_id: citaId,
    p_estado: estado,
    p_nota: nota || null,
  })

  if (error) throw error
  return data
}

export const guardarServicio = async (servicio) => {
  const registro = {
    categoria_id: Number(servicio.categoria_id),
    slug: servicio.slug || crearSlug(servicio.nombre),
    nombre: servicio.nombre.trim(),
    descripcion: servicio.descripcion.trim(),
    precio_desde: Number(servicio.precio_desde),
    precio_hasta: servicio.precio_hasta === '' ? null : Number(servicio.precio_hasta),
    duracion_minutos: Number(servicio.duracion_minutos),
    imagen_ruta: servicio.imagen_ruta || null,
    incluye: servicio.incluye,
    orden: Number(servicio.orden || 0),
    activo: Boolean(servicio.activo),
  }

  const consulta = servicio.id
    ? supabase.from('servicios').update(registro).eq('id', servicio.id)
    : supabase.from('servicios').insert(registro)
  const { data, error } = await consulta.select().single()

  if (error) throw error
  return data
}

export const guardarProducto = async (producto) => {
  const registro = {
    slug: producto.slug || crearSlug(producto.nombre),
    nombre: producto.nombre.trim(),
    categoria: producto.categoria.trim(),
    descripcion: producto.descripcion.trim(),
    precio: Number(producto.precio),
    imagen_ruta: producto.imagen_ruta || null,
    orden: Number(producto.orden || 0),
    activo: Boolean(producto.activo),
  }

  const consulta = producto.id
    ? supabase.from('productos').update(registro).eq('id', producto.id)
    : supabase.from('productos').insert(registro)
  const { data, error } = await consulta.select().single()

  if (error) throw error
  return data
}

export const listarCategorias = async () => {
  const { data, error } = await supabase
    .from('categorias_servicio')
    .select('id, nombre, slug, activo')
    .order('orden')

  if (error) throw error
  return data ?? []
}

export const listarBloqueos = async () => {
  const { data, error } = await supabase.from('periodos_bloqueados').select('*').order('inicio')
  if (error) throw error
  return data ?? []
}

export const crearBloqueo = async ({ inicio, fin, motivo, creadoPor }) => {
  const { data, error } = await supabase
    .from('periodos_bloqueados')
    .insert({ inicio, fin, motivo: motivo || null, creado_por: creadoPor })
    .select()
    .single()

  if (error) throw error
  return data
}

export const eliminarBloqueo = async (id) => {
  const { error } = await supabase.from('periodos_bloqueados').delete().eq('id', id)
  if (error) throw error
}
