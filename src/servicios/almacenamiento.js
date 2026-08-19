import { supabase } from './supabase'
import { optimizarImagenCatalogo } from '../utilidades/imagenes'

const extensionesPorTipo = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export const subirImagenCatalogo = async (archivo, carpeta) => {
  const archivoOptimizado = await optimizarImagenCatalogo(archivo)
  const extension = extensionesPorTipo[archivoOptimizado.type] || 'webp'
  const identificador = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
  const ruta = `${carpeta}/${identificador}.${extension}`
  const { error } = await supabase.storage.from('catalogo').upload(ruta, archivoOptimizado, {
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
