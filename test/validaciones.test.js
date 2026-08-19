import test from 'node:test'
import assert from 'node:assert/strict'
import {
  claveValida,
  convertirFechaHora,
  crearSlug,
  fechaLaborableValida,
  formatearPrecioServicio,
  limpiarTelefono,
  obtenerMensajeError,
  telefonoValido,
} from '../src/utilidades/validaciones.js'
import { CONTACTO_LUXFER, crearEnlaceWhatsAppProducto } from '../src/configuracion/contacto.js'
import { obtenerFechaEcuador, obtenerProximaCita } from '../src/utilidades/fechas.js'
import { calcularDimensionesImagen } from '../src/utilidades/imagenes.js'
import { estadoCitaPermiteGestion, rolPuedeAgendarCitas, rolPuedeVerContacto } from '../src/utilidades/permisos.js'

test('reserva citas únicamente desde cuentas no administrativas', () => {
  assert.equal(rolPuedeAgendarCitas('administrador'), false)
  assert.equal(rolPuedeAgendarCitas('cliente'), true)
  assert.equal(rolPuedeAgendarCitas(undefined), true)
})

test('oculta contacto únicamente en la cuenta administrativa', () => {
  assert.equal(rolPuedeVerContacto('administrador'), false)
  assert.equal(rolPuedeVerContacto('cliente'), true)
  assert.equal(rolPuedeVerContacto(undefined), true)
})

test('bloquea la gestión de notas cuando una cita alcanza un estado final', () => {
  assert.equal(estadoCitaPermiteGestion('pendiente'), true)
  assert.equal(estadoCitaPermiteGestion('confirmada'), true)
  assert.equal(estadoCitaPermiteGestion('completada'), false)
  assert.equal(estadoCitaPermiteGestion('rechazada'), false)
  assert.equal(estadoCitaPermiteGestion('cancelada'), false)
})

test('limpia y limita el teléfono a diez dígitos', () => {
  assert.equal(limpiarTelefono('098-765-43210'), '0987654321')
  assert.equal(limpiarTelefono('+593 987 654 321'), '5939876543')
})

test('acepta únicamente teléfonos de nueve o diez dígitos', () => {
  assert.equal(telefonoValido('987654321'), true)
  assert.equal(telefonoValido('0987654321'), true)
  assert.equal(telefonoValido('12345678'), false)
  assert.equal(telefonoValido('09876A4321'), false)
})

test('exige contraseña de ocho caracteres con letra y número', () => {
  assert.equal(claveValida('luxfer2026'), true)
  assert.equal(claveValida('sololetras'), false)
  assert.equal(claveValida('12345678'), false)
  assert.equal(claveValida('abc123'), false)
})

test('crea identificadores de ruta sencillos y sin caracteres especiales', () => {
  assert.equal(crearSlug('Hidratación Capilar'), 'hidratacion-capilar')
  assert.equal(crearSlug('  Sérum facial  '), 'serum-facial')
})

test('convierte fecha y hora a la zona horaria de Ecuador', () => {
  assert.equal(convertirFechaHora('2026-08-10', '08:30'), '2026-08-10T08:30:00-05:00')
})

test('calcula la fecha actual con la zona horaria de Ecuador', () => {
  assert.equal(obtenerFechaEcuador('2026-08-18T02:30:00.000Z'), '2026-08-17')
})

test('rechaza domingos y acepta un lunes futuro', () => {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + 1)
  while (fecha.getDay() !== 1) fecha.setDate(fecha.getDate() + 1)
  const lunes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
  fecha.setDate(fecha.getDate() + 6)
  const domingo = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`

  assert.equal(fechaLaborableValida(lunes), true)
  assert.equal(fechaLaborableValida(domingo), false)
})

test('rechaza domingos usando una fecha de referencia estable', () => {
  const referencia = new Date('2026-08-17T12:00:00.000Z')
  assert.equal(fechaLaborableValida('2026-08-17', referencia), true)
  assert.equal(fechaLaborableValida('2026-08-23', referencia), false)
  assert.equal(fechaLaborableValida('2026-08-16', referencia), false)
})

test('elige la cita futura más cercana aunque la lista esté en orden descendente', () => {
  const citas = [
    { id: 'lejana', estado: 'confirmada', inicio: '2026-09-20T15:00:00.000Z' },
    { id: 'cercana', estado: 'pendiente', inicio: '2026-08-20T15:00:00.000Z' },
    { id: 'pasada', estado: 'confirmada', inicio: '2026-08-01T15:00:00.000Z' },
  ]

  assert.equal(obtenerProximaCita(citas, '2026-08-18T12:00:00.000Z').id, 'cercana')
})

test('muestra precio simple o rango según los valores del servicio', () => {
  assert.equal(formatearPrecioServicio(15, null), '$15,00')
  assert.equal(formatearPrecioServicio(15, 18), '$15,00 – $18,00')
})

test('construye el contacto internacional y el mensaje de producto para WhatsApp', () => {
  assert.equal(CONTACTO_LUXFER.telefonoInternacional, '+593986066172')
  const enlace = crearEnlaceWhatsAppProducto('Ritual Botánico')
  assert.ok(enlace.startsWith('https://wa.me/593986066172?text='))
  assert.equal(
    decodeURIComponent(enlace.split('?text=')[1]),
    'Hola LuxFer, quisiera consultar la disponibilidad de Ritual Botánico.',
  )
})

test('reduce imágenes grandes sin deformarlas y conserva las pequeñas', () => {
  assert.deepEqual(calcularDimensionesImagen(4000, 2000), { ancho: 1600, alto: 800 })
  assert.deepEqual(calcularDimensionesImagen(800, 1200), { ancho: 800, alto: 1200 })
})

test('traduce un conflicto de agenda a un mensaje comprensible', () => {
  const error = { message: 'conflicting key value violates exclusion constraint citas_sin_solapamiento' }
  assert.equal(obtenerMensajeError(error, 'Error'), 'Ese horario ya no está disponible. Selecciona otro.')
})
