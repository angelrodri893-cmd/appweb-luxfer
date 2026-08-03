export const servicios = [
  {
    id: '01',
    ruta: 'rituales-faciales',
    nombre: 'Rituales faciales',
    resumen: 'Limpieza y cuidado personalizado para devolverle luminosidad a tu piel.',
    descripcion:
      'Una experiencia facial pensada para conocer las necesidades de tu piel y brindarle un cuidado suave y agradable.',
    tono: 'rosa',
    duracion: 'Duración por confirmar',
    precio: 'Precio por confirmar',
    incluye: ['Valoración inicial', 'Limpieza facial', 'Recomendaciones de cuidado'],
  },
  {
    id: '02',
    ruta: 'bienestar-corporal',
    nombre: 'Bienestar corporal',
    resumen: 'Una pausa para liberar tensiones y reconectar con la calma que necesitas.',
    descripcion:
      'Un servicio corporal relajante que busca ofrecerte un momento tranquilo dentro de tu rutina.',
    tono: 'arena',
    duracion: 'Duración por confirmar',
    precio: 'Precio por confirmar',
    incluye: ['Consulta breve', 'Preparación del espacio', 'Sesión de bienestar'],
  },
  {
    id: '03',
    ruta: 'belleza-esencial',
    nombre: 'Belleza esencial',
    resumen: 'Detalles sencillos para realzar tu belleza natural y acompañar tu estilo.',
    descripcion:
      'Opciones de belleza de acabado natural, adaptadas a tus preferencias y a la ocasión.',
    tono: 'salvia',
    duracion: 'Duración por confirmar',
    precio: 'Precio por confirmar',
    incluye: ['Elección del acabado', 'Preparación', 'Aplicación del servicio'],
  },
]

export const buscarServicio = (ruta) => servicios.find((servicio) => servicio.ruta === ruta)
