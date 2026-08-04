<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSesion } from '../composables/useSesion'
import { supabase } from '../servicios/supabase'

const rutaActual = useRoute()
const sesion = useSesion()
const enviado = ref(false)
const enviando = ref(false)
const cargandoServicios = ref(true)
const errorFormulario = ref('')
const servicios = ref([])
const fechaLocal = new Date()
fechaLocal.setMinutes(fechaLocal.getMinutes() - fechaLocal.getTimezoneOffset())
const hoy = fechaLocal.toISOString().split('T')[0]

const solicitud = reactive({
  nombre: '',
  telefono: '',
  servicio: '',
  fecha: '',
  hora: '',
  nota: '',
})

const nombreServicio = computed(
  () => servicios.value.find((servicio) => servicio.id === solicitud.servicio)?.nombre || 'el servicio',
)

const cargarDatos = async () => {
  const [respuestaServicios, respuestaPerfil] = await Promise.all([
    supabase
      .from('servicios')
      .select('id, slug, nombre, precio_desde, precio_hasta, duracion_minutos')
      .eq('activo', true)
      .order('orden'),
    supabase
      .from('perfiles')
      .select('nombre_completo, telefono')
      .eq('id', sesion.usuario.id)
      .maybeSingle(),
  ])

  cargandoServicios.value = false
  if (respuestaServicios.error) {
    errorFormulario.value = 'No pudimos cargar los servicios. Inténtalo nuevamente.'
    return
  }

  servicios.value = respuestaServicios.data ?? []
  const slugInicial = typeof rutaActual.query.servicio === 'string' ? rutaActual.query.servicio : ''
  solicitud.servicio = servicios.value.find((servicio) => servicio.slug === slugInicial)?.id ?? ''
  solicitud.nombre = respuestaPerfil.data?.nombre_completo ?? ''
  solicitud.telefono = respuestaPerfil.data?.telefono ?? ''
}

const enviarSolicitud = async () => {
  enviando.value = true
  errorFormulario.value = ''
  const inicio = `${solicitud.fecha}T${solicitud.hora}:00-05:00`

  const { error: errorPerfil } = await supabase
    .from('perfiles')
    .update({ nombre_completo: solicitud.nombre, telefono: solicitud.telefono })
    .eq('id', sesion.usuario.id)

  if (errorPerfil) {
    enviando.value = false
    errorFormulario.value = 'No pudimos actualizar tus datos de contacto.'
    return
  }

  const { error } = await supabase.from('citas').insert({
    usuario_id: sesion.usuario.id,
    servicio_id: solicitud.servicio,
    inicio,
    nota_cliente: solicitud.nota || null,
  })

  enviando.value = false
  if (error) {
    errorFormulario.value = error.message.includes('conflicting key value')
      ? 'Ese horario ya no está disponible. Selecciona otro.'
      : error.message.replace(/^.*?: /, '')
    return
  }

  enviado.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(cargarDatos)
</script>

<template>
  <section class="pagina-formulario">
    <div class="pagina-formulario__intro">
      <p class="etiqueta-bloque"><span></span>Agenda tu momento</p>
      <h1>Solicita una fecha para tu cita.</h1>
      <p>
        Completa los datos y la encargada revisará si el horario está disponible. La solicitud
        quedará guardada en tu cuenta con estado pendiente.
      </p>
      <ol class="resumen-pasos">
        <li><span>1</span>Envías tu solicitud.</li>
        <li><span>2</span>LuxFer revisa el horario.</li>
        <li><span>3</span>Recibes la confirmación.</li>
      </ol>
    </div>

    <div class="tarjeta-formulario">
      <div v-if="enviado" class="mensaje-exito" role="status">
        <span aria-hidden="true">✓</span>
        <h2>Solicitud preparada</h2>
        <p>
          Solicitaste {{ nombreServicio }} para el {{ solicitud.fecha }} a las {{ solicitud.hora }}.
          Puedes consultar su estado desde tu cuenta.
        </p>
        <button class="control control--borde" type="button" @click="enviado = false">
          Editar solicitud
        </button>
      </div>

      <form v-else @submit.prevent="enviarSolicitud">
        <p v-if="errorFormulario" class="mensaje-formulario mensaje-formulario--error" role="alert">
          {{ errorFormulario }}
        </p>
        <div class="campo-formulario campo-formulario--completo">
          <label for="nombre">Nombre completo</label>
          <input id="nombre" v-model.trim="solicitud.nombre" type="text" required autocomplete="name" />
        </div>
        <div class="campo-formulario campo-formulario--completo">
          <label for="telefono">Número de contacto</label>
          <input id="telefono" v-model.trim="solicitud.telefono" type="tel" required autocomplete="tel" />
        </div>
        <div class="campo-formulario campo-formulario--completo">
          <label for="servicio">Servicio</label>
          <select id="servicio" v-model="solicitud.servicio" required :disabled="cargandoServicios">
            <option value="" disabled>{{ cargandoServicios ? 'Cargando servicios…' : 'Selecciona una opción' }}</option>
            <option v-for="servicio in servicios" :key="servicio.id" :value="servicio.id">
              {{ servicio.nombre }} · ${{ Number(servicio.precio_desde).toFixed(2) }}
            </option>
          </select>
        </div>
        <div class="campo-formulario">
          <label for="fecha">Fecha solicitada</label>
          <input id="fecha" v-model="solicitud.fecha" type="date" :min="hoy" required />
        </div>
        <div class="campo-formulario">
          <label for="hora">Hora solicitada</label>
          <input id="hora" v-model="solicitud.hora" type="time" required />
        </div>
        <div class="campo-formulario campo-formulario--completo">
          <label for="nota">Nota adicional <small>(opcional)</small></label>
          <textarea id="nota" v-model.trim="solicitud.nota" rows="4"></textarea>
        </div>
        <button class="control control--principal campo-formulario--completo" type="submit" :disabled="enviando || cargandoServicios">
          {{ enviando ? 'Guardando solicitud…' : 'Enviar a revisión' }}
        </button>
      </form>
    </div>
  </section>
</template>
