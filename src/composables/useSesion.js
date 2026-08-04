import { readonly, reactive } from 'vue'
import { supabase } from '../servicios/supabase'

const sesion = reactive({
  usuario: null,
  cargando: true,
  inicializada: false,
})

let suscripcionAutenticacion

export const inicializarSesion = async () => {
  if (sesion.inicializada) return

  const { data, error } = await supabase.auth.getSession()
  if (error) console.error('No se pudo recuperar la sesión:', error.message)

  sesion.usuario = data.session?.user ?? null
  sesion.cargando = false
  sesion.inicializada = true

  const { data: escucha } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
    sesion.usuario = nuevaSesion?.user ?? null
    sesion.cargando = false
  })

  suscripcionAutenticacion = escucha.subscription
}

export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const useSesion = () => readonly(sesion)

export const detenerSesion = () => suscripcionAutenticacion?.unsubscribe()
