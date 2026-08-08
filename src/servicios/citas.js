import { supabase } from './supabase'

export const obtenerHorariosDisponibles = async (servicioId, fecha) => {
  if (!servicioId || !fecha) return []

  const { data, error } = await supabase.rpc('obtener_horarios_disponibles', {
    p_servicio_id: servicioId,
    p_fecha: fecha,
  })

  if (error) throw error
  return (data ?? []).map((registro) => registro.hora.slice(0, 5))
}

export const crearCita = async ({ usuarioId, servicioId, inicio, nota }) => {
  const { data, error } = await supabase
    .from('citas')
    .insert({
      usuario_id: usuarioId,
      servicio_id: servicioId,
      inicio,
      nota_cliente: nota || null,
    })
    .select('id, inicio, fin, estado')
    .single()

  if (error) throw error
  return data
}

export const listarMisCitas = async (usuarioId) => {
  const { data, error } = await supabase
    .from('citas')
    .select('id, servicio_id, inicio, fin, estado, nota_cliente, nota_administradora, servicios(nombre, slug, duracion_minutos)')
    .eq('usuario_id', usuarioId)
    .order('inicio', { ascending: false })

  if (error) throw error
  return data ?? []
}

export const cancelarMiCita = async (citaId) => {
  const { data, error } = await supabase.rpc('cancelar_mi_cita', { p_cita_id: citaId })
  if (error) throw error
  return data
}

export const reprogramarMiCita = async (citaId, nuevoInicio) => {
  const { data, error } = await supabase.rpc('reprogramar_mi_cita', {
    p_cita_id: citaId,
    p_nuevo_inicio: nuevoInicio,
  })

  if (error) throw error
  return data
}
