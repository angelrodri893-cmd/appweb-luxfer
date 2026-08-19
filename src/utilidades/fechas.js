export const ZONA_HORARIA_ECUADOR = 'America/Guayaquil'

export const obtenerFechaEcuador = (valor = new Date()) => {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA_ECUADOR,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(valor))
  const obtener = (tipo) => partes.find((parte) => parte.type === tipo)?.value

  return `${obtener('year')}-${obtener('month')}-${obtener('day')}`
}

export const obtenerDiaSemana = (fecha) => {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha || '')
  if (!coincidencia) return null

  const [, anio, mes, dia] = coincidencia.map(Number)
  const fechaUtc = new Date(Date.UTC(anio, mes - 1, dia))
  if (
    fechaUtc.getUTCFullYear() !== anio
    || fechaUtc.getUTCMonth() !== mes - 1
    || fechaUtc.getUTCDate() !== dia
  ) return null

  return fechaUtc.getUTCDay()
}

export const esFechaLaborableEcuador = (fecha, ahora = new Date()) => {
  const diaSemana = obtenerDiaSemana(fecha)
  return diaSemana !== null
    && diaSemana >= 1
    && diaSemana <= 6
    && fecha >= obtenerFechaEcuador(ahora)
}

export const obtenerProximaCita = (citas = [], ahora = new Date()) => {
  const instanteActual = new Date(ahora).getTime()

  return citas
    .filter((cita) => ['pendiente', 'confirmada'].includes(cita.estado))
    .filter((cita) => new Date(cita.inicio).getTime() > instanteActual)
    .sort((primera, segunda) => new Date(primera.inicio) - new Date(segunda.inicio))[0] ?? null
}
