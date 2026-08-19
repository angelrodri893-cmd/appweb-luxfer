<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mostrarNotificacion } from '../composables/useNotificacion'
import { refrescarSesion, useSesion } from '../composables/useSesion'
import { listarServicios } from '../servicios/catalogos'
import { crearCita, obtenerHorariosDisponibles } from '../servicios/citas'
import { supabase } from '../servicios/supabase'
import { obtenerFechaEcuador } from '../utilidades/fechas'
import {
  convertirFechaHora,
  fechaLaborableValida,
  limpiarTelefono,
  obtenerMensajeError,
  telefonoValido,
} from '../utilidades/validaciones'

const rutaActual = useRoute()
const enrutador = useRouter()
const sesion = useSesion()
const servicios = ref([])
const horarios = ref([])
const cargando = ref(true)
const cargandoHorarios = ref(false)
const enviando = ref(false)
const errores = reactive({ nombre: '', telefono: '', fecha: '', hora: '', general: '' })

const hoy = obtenerFechaEcuador()

const solicitud = reactive({ nombre: '', telefono: '', servicio: '', fecha: '', hora: '', nota: '' })
const servicioElegido = computed(() => servicios.value.find((item) => item.id === solicitud.servicio))

const cargarHorarios = async () => {
  horarios.value = []
  solicitud.hora = ''
  errores.fecha = ''

  if (!solicitud.servicio || !solicitud.fecha) return
  if (!fechaLaborableValida(solicitud.fecha)) {
    errores.fecha = 'Selecciona una fecha futura de lunes a sábado.'
    return
  }

  cargandoHorarios.value = true
  try {
    horarios.value = await obtenerHorariosDisponibles(solicitud.servicio, solicitud.fecha)
  } catch {
    errores.general = 'No pudimos consultar los horarios disponibles.'
  } finally {
    cargandoHorarios.value = false
  }
}

const cargarDatos = async () => {
  try {
    servicios.value = await listarServicios()
    solicitud.nombre = sesion.perfil?.nombre_completo ?? ''
    solicitud.telefono = sesion.perfil?.telefono ?? ''
    const slugInicial = typeof rutaActual.query.servicio === 'string' ? rutaActual.query.servicio : ''
    solicitud.servicio = servicios.value.find((servicio) => servicio.slug === slugInicial)?.id ?? ''
  } catch {
    errores.general = 'No pudimos preparar el formulario de citas.'
  } finally {
    cargando.value = false
  }
}

const validarFormulario = () => {
  errores.nombre = solicitud.nombre.trim().length >= 3 ? '' : 'Escribe tu nombre completo.'
  errores.telefono = telefonoValido(solicitud.telefono) ? '' : 'Ingresa entre 9 y 10 dígitos.'
  errores.fecha = fechaLaborableValida(solicitud.fecha) ? '' : 'Selecciona una fecha futura de lunes a sábado.'
  errores.hora = horarios.value.includes(solicitud.hora) ? '' : 'Selecciona una hora disponible.'
  return !errores.nombre && !errores.telefono && !errores.fecha && !errores.hora
}

const enviarSolicitud = async () => {
  errores.general = ''
  if (!validarFormulario()) return

  enviando.value = true
  try {
    const { error: errorPerfil } = await supabase
      .from('perfiles')
      .update({ nombre_completo: solicitud.nombre.trim(), telefono: solicitud.telefono })
      .eq('id', sesion.usuario.id)
    if (errorPerfil) throw errorPerfil

    await crearCita({
      usuarioId: sesion.usuario.id,
      servicioId: solicitud.servicio,
      inicio: convertirFechaHora(solicitud.fecha, solicitud.hora),
      nota: solicitud.nota.trim().slice(0, 500),
    })

    await refrescarSesion()
    mostrarNotificacion({
      titulo: 'Solicitud enviada',
      mensaje: `LuxFer revisará tu cita para ${servicioElegido.value?.nombre}.`,
      duracion: 5000,
    })
    await enrutador.push('/mi-cuenta')
  } catch (error) {
    errores.general = obtenerMensajeError(error, 'No pudimos guardar la cita. Inténtalo nuevamente.')
    await cargarHorarios()
  } finally {
    enviando.value = false
  }
}

watch(() => [solicitud.servicio, solicitud.fecha], cargarHorarios)
onMounted(cargarDatos)
</script>

<template>
  <section class="pagina-formulario">
    <div class="pagina-formulario__intro">
      <p class="etiqueta-bloque"><span></span>Agenda tu momento</p><h1>Solicita una fecha para tu cita.</h1>
      <p>Los horarios mostrados ya consideran la duración del servicio, otras solicitudes y bloqueos del centro.</p>
      <ol class="resumen-pasos"><li><span>1</span>Seleccionas una hora libre.</li><li><span>2</span>LuxFer revisa la solicitud.</li><li><span>3</span>Consultas la respuesta en tu cuenta.</li></ol>
    </div>
    <div class="tarjeta-formulario">
      <form @submit.prevent="enviarSolicitud">
        <p v-if="errores.general" class="mensaje-formulario mensaje-formulario--error" role="alert">{{ errores.general }}</p>
        <div class="campo-formulario campo-formulario--completo"><label for="nombre">Nombre completo</label><input id="nombre" v-model.trim="solicitud.nombre" type="text" minlength="3" maxlength="80" required autocomplete="name" /><small v-if="errores.nombre" class="error-campo">{{ errores.nombre }}</small></div>
        <div class="campo-formulario campo-formulario--completo"><label for="telefono">Número de contacto</label><input id="telefono" :value="solicitud.telefono" type="tel" inputmode="numeric" minlength="9" maxlength="10" pattern="[0-9]{9,10}" required autocomplete="tel" @input="solicitud.telefono = limpiarTelefono($event.target.value)" /><small v-if="errores.telefono" class="error-campo">{{ errores.telefono }}</small></div>
        <div class="campo-formulario campo-formulario--completo"><label for="servicio">Servicio</label><select id="servicio" v-model="solicitud.servicio" required :disabled="cargando"><option value="" disabled>{{ cargando ? 'Cargando servicios…' : 'Selecciona una opción' }}</option><option v-for="servicio in servicios" :key="servicio.id" :value="servicio.id">{{ servicio.nombre }} · {{ servicio.duracion_minutos }} min</option></select></div>
        <div class="campo-formulario"><label for="fecha">Fecha</label><input id="fecha" v-model="solicitud.fecha" type="date" :min="hoy" required /><small v-if="errores.fecha" class="error-campo">{{ errores.fecha }}</small></div>
        <div class="campo-formulario"><label for="hora">Hora disponible</label><select id="hora" v-model="solicitud.hora" required :disabled="!solicitud.fecha || cargandoHorarios"><option value="" disabled>{{ cargandoHorarios ? 'Consultando…' : horarios.length ? 'Selecciona una hora' : 'Sin horas disponibles' }}</option><option v-for="hora in horarios" :key="hora" :value="hora">{{ hora }}</option></select><small v-if="errores.hora" class="error-campo">{{ errores.hora }}</small></div>
        <div class="campo-formulario campo-formulario--completo"><label for="nota">Nota adicional <small>(opcional)</small></label><textarea id="nota" v-model.trim="solicitud.nota" rows="4" maxlength="500"></textarea><small>{{ solicitud.nota.length }}/500</small></div>
        <button class="control control--principal campo-formulario--completo" type="submit" :disabled="enviando || cargando || cargandoHorarios">{{ enviando ? 'Guardando solicitud…' : 'Enviar a revisión' }}</button>
      </form>
    </div>
  </section>
</template>
