export const TIPOS_IMAGEN_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const LIMITE_ENTRADA_IMAGEN = 5 * 1024 * 1024
export const LIMITE_SALIDA_IMAGEN = 2 * 1024 * 1024
export const LADO_MAXIMO_IMAGEN = 1600
export const CALIDAD_WEBP = 0.82

export const calcularDimensionesImagen = (ancho, alto, ladoMaximo = LADO_MAXIMO_IMAGEN) => {
  if (!Number.isFinite(ancho) || !Number.isFinite(alto) || ancho <= 0 || alto <= 0) {
    throw new Error('No pudimos leer las dimensiones de la imagen.')
  }

  const escala = Math.min(1, ladoMaximo / Math.max(ancho, alto))
  return {
    ancho: Math.max(1, Math.round(ancho * escala)),
    alto: Math.max(1, Math.round(alto * escala)),
  }
}

const validarArchivoImagen = (archivo) => {
  if (!archivo || !TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
    throw new Error('Selecciona una imagen JPG, PNG, WEBP o AVIF.')
  }
  if (archivo.size > LIMITE_ENTRADA_IMAGEN) {
    throw new Error('La imagen original no puede superar 5 MB.')
  }
}

const convertirCanvasABlob = (canvas) => new Promise((resolve, reject) => {
  canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error('No pudimos convertir la imagen a WebP.')),
    'image/webp',
    CALIDAD_WEBP,
  )
})

export const optimizarImagenCatalogo = async (archivo) => {
  validarArchivoImagen(archivo)

  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    throw new Error('Este navegador no permite optimizar imágenes. Actualízalo e inténtalo nuevamente.')
  }

  const mapaBits = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
  try {
    const dimensiones = calcularDimensionesImagen(mapaBits.width, mapaBits.height)
    const canvas = document.createElement('canvas')
    canvas.width = dimensiones.ancho
    canvas.height = dimensiones.alto
    const contexto = canvas.getContext('2d', { alpha: true })
    if (!contexto) throw new Error('No pudimos preparar la imagen para subirla.')

    contexto.drawImage(mapaBits, 0, 0, dimensiones.ancho, dimensiones.alto)
    const webp = await convertirCanvasABlob(canvas)
    const fueRedimensionada = dimensiones.ancho !== mapaBits.width || dimensiones.alto !== mapaBits.height
    const salida = !fueRedimensionada && archivo.size <= webp.size
      ? archivo
      : new File([webp], `${archivo.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' })

    if (salida.size > LIMITE_SALIDA_IMAGEN) {
      throw new Error('La imagen optimizada supera 2 MB. Elige una imagen más liviana.')
    }

    return salida
  } finally {
    mapaBits.close()
  }
}
