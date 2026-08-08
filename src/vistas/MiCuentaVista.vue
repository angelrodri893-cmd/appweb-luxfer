<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mostrarNotificacion } from '../composables/useNotificacion'
import { cerrarSesion, useSesion } from '../composables/useSesion'
import { cancelarMiCita, listarMisCitas, obtenerHorariosDisponibles, reprogramarMiCita } from '../servicios/citas'
import { convertirFechaHora, fechaLaborableValida, formatearFecha, obtenerMensajeError } from '../utilidades/validaciones'

const enrutador = useRouter()
const sesion = useSesion()
const citas = ref([])
const cargando = ref(true)
const cerrando = ref(false)
const errorPagina = ref('')
const citaReprogramar = ref(null)
const reprogramacion = reactive({ fecha: '', hora: '', horarios: [], cargando: false, guardando: false, error: '' })

const ahoraLocal = new Date()
ahoraLocal.setMinutes(ahoraLocal.getMinutes() - ahoraLocal.getTimezoneOffset())
const hoy = ahoraLocal.toISOString().split('T')[0]
const citasPendientes = computed(() => citas.value.filter((cita) => cita.estado === 'pendiente').length)
const citasCompletadas = computed(() => citas.value.filter((cita) => cita.estado === 'completada').length)
const proximaCita = computed(() => citas.value.find((cita) => ['pendiente', 'confirmada'].includes(cita.estado) && new Date(cita.inicio) > new Date()))

const puedeModificar = (cita) => ['pendiente', 'confirmada'].includes(cita.estado)
  && new Date(cita.inicio).getTime() - Date.now() >= 24 * 60 * 60 * 1000

const cargarCuenta = async () => {
  errorPagina.value = ''
  try { citas.value = await listarMisCitas(sesion.usuario.id) }
  catch { errorPagina.value = 'No pudimos cargar la información de tu cuenta.' }
  finally { cargando.value = false }
}

const cancelarCita = async (cita) => {
  if (!window.confirm('¿Deseas cancelar esta cita?')) return
  try {
    await cancelarMiCita(cita.id)
    mostrarNotificacion({ titulo: 'Cita cancelada', mensaje: 'El horario volvió a estar disponible.' })
    await cargarCuenta()
  } catch (error) { errorPagina.value = obtenerMensajeError(error, 'No pudimos cancelar la cita.') }
}

const abrirReprogramacion = (cita) => {
  citaReprogramar.value = cita
  Object.assign(reprogramacion, { fecha: '', hora: '', horarios: [], cargando: false, guardando: false, error: '' })
}

const consultarHorasReprogramacion = async () => {
  reprogramacion.horarios = []
  reprogramacion.hora = ''
  if (!fechaLaborableValida(reprogramacion.fecha)) {
    reprogramacion.error = 'Selecciona una fecha futura de lunes a sábado.'
    return
  }
  reprogramacion.error = ''
  reprogramacion.cargando = true
  try { reprogramacion.horarios = await obtenerHorariosDisponibles(citaReprogramar.value.servicio_id, reprogramacion.fecha) }
  catch { reprogramacion.error = 'No pudimos consultar los horarios.' }
  finally { reprogramacion.cargando = false }
}

const guardarReprogramacion = async () => {
  if (!reprogramacion.horarios.includes(reprogramacion.hora)) {
    reprogramacion.error = 'Selecciona una hora disponible.'
    return
  }
  reprogramacion.guardando = true
  try {
    await reprogramarMiCita(citaReprogramar.value.id, convertirFechaHora(reprogramacion.fecha, reprogramacion.hora))
    citaReprogramar.value = null
    mostrarNotificacion({ titulo: 'Cambio solicitado', mensaje: 'La cita volvió al estado pendiente para su revisión.' })
    await cargarCuenta()
  } catch (error) { reprogramacion.error = obtenerMensajeError(error, 'No pudimos reprogramar la cita.') }
  finally { reprogramacion.guardando = false }
}

const salir = async () => {
  cerrando.value = true
  try { await cerrarSesion(); await enrutador.replace('/') }
  catch { errorPagina.value = 'No pudimos cerrar la sesión.'; cerrando.value = false }
}

onMounted(cargarCuenta)
</script>

<template>
  <section class="cabecera-pagina cabecera-pagina--cuenta">
    <p class="etiqueta-bloque"><span></span>Tu espacio LuxFer</p><h1>Hola{{ sesion.perfil?.nombre_completo ? `, ${sesion.perfil.nombre_completo}` : '' }}.</h1>
    <p>Consulta tus solicitudes y el historial de servicios realizados.</p>
    <div class="grupo-acciones"><RouterLink v-if="sesion.esAdministrador" class="control control--principal" to="/administracion">Ir a administración</RouterLink><button class="control control--borde cuenta-salir" type="button" :disabled="cerrando" @click="salir">{{ cerrando ? 'Cerrando…' : 'Cerrar sesión' }}</button></div>
  </section>
  <section class="seccion-pagina">
    <p v-if="errorPagina" class="mensaje-formulario mensaje-formulario--error" role="alert">{{ errorPagina }}</p>
    <div v-if="cargando" class="estado-vacio estado-vacio--interno"><h2>Cargando tu cuenta…</h2></div>
    <template v-else>
      <div class="resumen-cuenta"><article><small>Próxima cita</small><h2>{{ proximaCita ? proximaCita.servicios?.nombre : 'Sin citas próximas' }}</h2><p v-if="proximaCita">{{ formatearFecha(proximaCita.inicio) }}</p><RouterLink v-else to="/agendar">Solicitar una cita</RouterLink></article><article><small>Solicitudes</small><h2>{{ citasPendientes }} pendientes</h2><p>LuxFer revisará cada horario.</p></article><article><small>Servicios realizados</small><h2>{{ citasCompletadas }}</h2><p>Tu historial se conserva aquí.</p></article></div>
      <div v-if="citas.length" class="lista-citas">
        <article v-for="cita in citas" :key="cita.id" class="cita-cuenta">
          <div><span class="estado-cita" :class="`estado-cita--${cita.estado}`">{{ cita.estado }}</span><h2>{{ cita.servicios?.nombre }}</h2><p>{{ formatearFecha(cita.inicio) }}</p><p v-if="cita.nota_administradora" class="nota-administradora"><strong>Respuesta de LuxFer:</strong> {{ cita.nota_administradora }}</p></div>
          <div v-if="puedeModificar(cita)" class="acciones-cita"><button class="control control--borde control--compacto" type="button" @click="abrirReprogramacion(cita)">Reprogramar</button><button class="control control--borde control--compacto" type="button" @click="cancelarCita(cita)">Cancelar</button></div>
        </article>
      </div>
      <div v-else class="estado-vacio estado-vacio--interno"><h2>Tu historial comenzará aquí.</h2><p>Cuando solicites una cita podrás consultar su fecha y estado.</p><RouterLink class="control control--principal" to="/agendar">Agendar una cita</RouterLink></div>
    </template>
  </section>

  <div v-if="citaReprogramar" class="fondo-modal" @click.self="citaReprogramar = null">
    <form class="tarjeta-modal" @submit.prevent="guardarReprogramacion">
      <button class="cerrar-modal" type="button" aria-label="Cerrar" @click="citaReprogramar = null">×</button><p class="etiqueta-bloque"><span></span>Reprogramar</p><h2>{{ citaReprogramar.servicios?.nombre }}</h2><p>La cita volverá a revisión y debe conservar al menos 24 horas de anticipación.</p>
      <p v-if="reprogramacion.error" class="mensaje-formulario mensaje-formulario--error">{{ reprogramacion.error }}</p>
      <div class="campo-formulario"><label for="nueva-fecha">Nueva fecha</label><input id="nueva-fecha" v-model="reprogramacion.fecha" type="date" :min="hoy" required @change="consultarHorasReprogramacion" /></div>
      <div class="campo-formulario"><label for="nueva-hora">Hora disponible</label><select id="nueva-hora" v-model="reprogramacion.hora" required :disabled="reprogramacion.cargando"><option value="" disabled>{{ reprogramacion.cargando ? 'Consultando…' : reprogramacion.horarios.length ? 'Selecciona una hora' : 'Sin horas disponibles' }}</option><option v-for="hora in reprogramacion.horarios" :key="hora" :value="hora">{{ hora }}</option></select></div>
      <button class="control control--principal" type="submit" :disabled="reprogramacion.guardando">{{ reprogramacion.guardando ? 'Guardando…' : 'Solicitar cambio' }}</button>
    </form>
  </div>
</template>
