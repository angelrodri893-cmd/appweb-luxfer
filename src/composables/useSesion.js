import { readonly, reactive } from 'vue'
import { supabase } from '../servicios/supabase'
import { rolPuedeAgendarCitas } from '../utilidades/permisos'

const sesion = reactive({
  usuario: null,
  perfil: null,
  cargando: true,
  inicializada: false,
  get esAdministrador() {
    return this.perfil?.rol === 'administrador'
  },
  get puedeAgendarCitas() {
    return rolPuedeAgendarCitas(this.perfil?.rol)
  },
})

let suscripcionAutenticacion

const cargarPerfil = async (usuario) => {
  if (!usuario) {
    sesion.perfil = null
    return
  }

  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, telefono, rol')
    .eq('id', usuario.id)
    .maybeSingle()

  if (error) {
    console.error('No se pudo recuperar el perfil:', error.message)
    sesion.perfil = null
    return
  }

  sesion.perfil = data
}

export const refrescarSesion = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  sesion.usuario = data.session?.user ?? null
  await cargarPerfil(sesion.usuario)
  return sesion
}

export const inicializarSesion = async () => {
  if (sesion.inicializada) return sesion

  try {
    await refrescarSesion()
  } catch (error) {
    console.error('No se pudo recuperar la sesión:', error.message)
  }

  sesion.cargando = false
  sesion.inicializada = true

  const { data: escucha } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
    sesion.usuario = nuevaSesion?.user ?? null
    sesion.cargando = false

    // Se difiere la consulta para no bloquear el cambio interno de autenticacion.
    setTimeout(() => cargarPerfil(sesion.usuario), 0)
  })

  suscripcionAutenticacion = escucha.subscription
  return sesion
}

export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error

  sesion.usuario = null
  sesion.perfil = null
}

export const useSesion = () => readonly(sesion)

export const detenerSesion = () => suscripcionAutenticacion?.unsubscribe()
