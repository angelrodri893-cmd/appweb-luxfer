import { supabase } from './supabase'

const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const limiteBytes = 5 * 1024 * 1024

export const subirImagenCatalogo = async (archivo, carpeta) => {
  if (!tiposPermitidos.includes(archivo.type)) {
    throw new Error('Selecciona una imagen JPG, PNG, WEBP o AVIF.')
  }

  if (archivo.size > limiteBytes) throw new Error('La imagen no puede superar 5 MB.')

  const extension = archivo.name.split('.').pop()?.toLowerCase() || 'jpg'
  const identificador = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
  const ruta = `${carpeta}/${identificador}.${extension}`
  const { error } = await supabase.storage.from('catalogo').upload(ruta, archivo, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error
  return ruta
}

export const eliminarImagenCatalogo = async (ruta) => {
  if (!ruta || /^https?:\/\//.test(ruta)) return
  const { error } = await supabase.storage.from('catalogo').remove([ruta])
  if (error) throw error
}
