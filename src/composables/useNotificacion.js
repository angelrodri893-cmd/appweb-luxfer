import { readonly, reactive } from 'vue'

const notificacion = reactive({ visible: false, titulo: '', mensaje: '' })
let temporizador

export const cerrarNotificacion = () => {
  clearTimeout(temporizador)
  notificacion.visible = false
}

export const mostrarNotificacion = ({ titulo = 'Acción completada', mensaje = '', duracion = 3500 }) => {
  clearTimeout(temporizador)
  notificacion.titulo = titulo
  notificacion.mensaje = mensaje
  notificacion.visible = true
  temporizador = setTimeout(cerrarNotificacion, duracion)
}

export const useNotificacion = () => readonly(notificacion)
