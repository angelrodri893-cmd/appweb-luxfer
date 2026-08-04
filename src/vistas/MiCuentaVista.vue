<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cerrarSesion, useSesion } from '../composables/useSesion'
import { supabase } from '../servicios/supabase'

const enrutador = useRouter()
const sesion = useSesion()
const perfil = ref(null)
const citas = ref([])
const cargando = ref(true)
const cerrando = ref(false)
const errorPagina = ref('')

const citasPendientes = computed(
  () => citas.value.filter((cita) => cita.estado === 'pendiente').length,
)
const citasCompletadas = computed(
  () => citas.value.filter((cita) => cita.estado === 'completada').length,
)
const proximaCita = computed(() =>
  citas.value.find(
    (cita) => ['pendiente', 'confirmada'].includes(cita.estado) && new Date(cita.inicio) > new Date(),
  ),
)

const formatearFecha = (fecha) =>
  new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Guayaquil',
  }).format(new Date(fecha))

const cargarCuenta = async () => {
  const [respuestaPerfil, respuestaCitas] = await Promise.all([
    supabase.from('perfiles').select('nombre_completo, telefono, rol').eq('id', sesion.usuario.id).single(),
    supabase
      .from('citas')
      .select('id, inicio, fin, estado, nota_cliente, servicios(nombre)')
      .eq('usuario_id', sesion.usuario.id)
      .order('inicio', { ascending: false }),
  ])

  cargando.value = false
  if (respuestaPerfil.error || respuestaCitas.error) {
    errorPagina.value = 'No pudimos cargar la información de tu cuenta.'
    return
  }

  perfil.value = respuestaPerfil.data
  citas.value = respuestaCitas.data ?? []
}

const cancelarCita = async (id) => {
  if (!window.confirm('¿Deseas cancelar esta cita?')) return

  const { error } = await supabase.rpc('cancelar_mi_cita', { p_cita_id: id })
  if (error) {
    errorPagina.value = error.message
    return
  }

  await cargarCuenta()
}

const salir = async () => {
  cerrando.value = true
  try {
    await cerrarSesion()
    await enrutador.replace('/')
  } catch {
    errorPagina.value = 'No pudimos cerrar la sesión.'
    cerrando.value = false
  }
}

onMounted(cargarCuenta)
</script>

<template>
  <section class="cabecera-pagina cabecera-pagina--cuenta">
    <p class="etiqueta-bloque"><span></span>Tu espacio LuxFer</p>
    <h1>Hola{{ perfil?.nombre_completo ? `, ${perfil.nombre_completo}` : '' }}.</h1>
    <p>Consulta tus solicitudes y mantén el control de tus próximas visitas.</p>
    <button class="control control--borde cuenta-salir" type="button" :disabled="cerrando" @click="salir">
      {{ cerrando ? 'Cerrando…' : 'Cerrar sesión' }}
    </button>
  </section>

  <section class="seccion-pagina">
    <p v-if="errorPagina" class="mensaje-formulario mensaje-formulario--error" role="alert">
      {{ errorPagina }}
    </p>

    <div v-if="cargando" class="estado-vacio estado-vacio--interno" aria-live="polite">
      <span aria-hidden="true">✦</span><h2>Cargando tu cuenta…</h2>
    </div>

    <template v-else>
      <div class="resumen-cuenta">
        <article>
          <small>Próxima cita</small>
          <h2>{{ proximaCita ? proximaCita.servicios?.nombre : 'Sin citas próximas' }}</h2>
          <p v-if="proximaCita">{{ formatearFecha(proximaCita.inicio) }}</p>
          <RouterLink v-else to="/agendar">Solicitar una cita</RouterLink>
        </article>
        <article><small>Solicitudes</small><h2>{{ citasPendientes }} pendientes</h2><p>LuxFer revisará cada horario solicitado.</p></article>
        <article><small>Servicios realizados</small><h2>{{ citasCompletadas }}</h2><p>Tu historial se conservará en esta cuenta.</p></article>
      </div>

      <div v-if="citas.length" class="lista-citas">
        <article v-for="cita in citas" :key="cita.id" class="cita-cuenta">
          <div>
            <span class="estado-cita" :class="`estado-cita--${cita.estado}`">{{ cita.estado }}</span>
            <h2>{{ cita.servicios?.nombre }}</h2>
            <p>{{ formatearFecha(cita.inicio) }}</p>
          </div>
          <button
            v-if="['pendiente', 'confirmada'].includes(cita.estado) && new Date(cita.inicio) > new Date()"
            class="control control--borde control--compacto"
            type="button"
            @click="cancelarCita(cita.id)"
          >
            Cancelar
          </button>
        </article>
      </div>

      <div v-else class="estado-vacio estado-vacio--interno">
        <span aria-hidden="true">✦</span><h2>Tu historial comenzará aquí.</h2>
        <p>Cuando solicites una cita, podrás consultar su servicio, fecha y estado.</p>
        <RouterLink class="control control--principal" to="/agendar">Agendar una cita</RouterLink>
      </div>
    </template>
  </section>
</template>
