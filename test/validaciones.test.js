import test from 'node:test'
import assert from 'node:assert/strict'
import {
  claveValida,
  convertirFechaHora,
  crearSlug,
  fechaLaborableValida,
  limpiarTelefono,
  obtenerMensajeError,
  telefonoValido,
} from '../src/utilidades/validaciones.js'
import { rolPuedeAgendarCitas } from '../src/utilidades/permisos.js'

test('reserva citas únicamente desde cuentas no administrativas', () => {
  assert.equal(rolPuedeAgendarCitas('administrador'), false)
  assert.equal(rolPuedeAgendarCitas('cliente'), true)
  assert.equal(rolPuedeAgendarCitas(undefined), true)
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

test('traduce un conflicto de agenda a un mensaje comprensible', () => {
  const error = { message: 'conflicting key value violates exclusion constraint citas_sin_solapamiento' }
  assert.equal(obtenerMensajeError(error, 'Error'), 'Ese horario ya no está disponible. Selecciona otro.')
})
