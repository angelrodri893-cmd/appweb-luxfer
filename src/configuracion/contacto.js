export const CONTACTO_LUXFER = Object.freeze({
  correo: 'info.luxferr@gmail.com',
  telefonoVisible: '098 606 6172',
  telefonoInternacional: '+593986066172',
  telefonoEnlace: 'tel:+593986066172',
  whatsappBase: 'https://wa.me/593986066172',
  mensajeGeneral: 'Hola LuxFer, quisiera recibir información sobre sus servicios.',
})

export const crearEnlaceWhatsApp = (mensaje = CONTACTO_LUXFER.mensajeGeneral) =>
  `${CONTACTO_LUXFER.whatsappBase}?text=${encodeURIComponent(mensaje)}`

export const crearEnlaceWhatsAppProducto = (nombreProducto) =>
  crearEnlaceWhatsApp(`Hola LuxFer, quisiera consultar la disponibilidad de ${nombreProducto}.`)
