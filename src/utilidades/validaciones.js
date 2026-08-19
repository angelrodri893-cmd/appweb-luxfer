import { esFechaLaborableEcuador } from './fechas.js'

export const TELEFONO_PATRON = /^[0-9]{9,10}$/

export const limpiarTelefono = (valor = '') => valor.replace(/\D/g, '').slice(0, 10)

export const telefonoValido = (valor = '') => TELEFONO_PATRON.test(valor)

export const claveValida = (valor = '') =>
  valor.length >= 8 && /[A-Za-z]/.test(valor) && /[0-9]/.test(valor)

export const fechaLaborableValida = (fecha, ahora = new Date()) =>
  esFechaLaborableEcuador(fecha, ahora)

export const convertirFechaHora = (fecha, hora) => `${fecha}T${hora}:00-05:00`

export const crearSlug = (texto = '') =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const formatearDinero = (valor) =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(valor || 0))

export const formatearPrecioServicio = (precioDesde, precioHasta) => {
  const desde = formatearDinero(precioDesde)
  const hasta = Number(precioHasta)

  return Number.isFinite(hasta) && hasta > Number(precioDesde)
    ? `${desde} – ${formatearDinero(hasta)}`
    : desde
}

export const formatearFecha = (fecha) =>
  new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Guayaquil',
  }).format(new Date(fecha))

export const obtenerMensajeError = (error, mensajePredeterminado) => {
  const mensaje = error?.message || ''

  if (mensaje.includes('conflicting key value') || mensaje.includes('citas_sin_solapamiento')) {
    return 'Ese horario ya no está disponible. Selecciona otro.'
  }

  if (mensaje.includes('horario de atención') || mensaje.includes('horario de atencion')) {
    return 'Selecciona un horario de lunes a sábado, entre 08:00 y 18:00.'
  }

  if (mensaje.includes('24 horas')) return mensaje
  if (mensaje.includes('duplicate key')) return 'Ya existe un registro con esos datos.'

  return mensajePredeterminado
}
