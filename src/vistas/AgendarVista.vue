<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { servicios } from '../datos/servicios'

const rutaActual = useRoute()
const enviado = ref(false)
const fechaLocal = new Date()
fechaLocal.setMinutes(fechaLocal.getMinutes() - fechaLocal.getTimezoneOffset())
const hoy = fechaLocal.toISOString().split('T')[0]

const servicioInicial = servicios.some((servicio) => servicio.ruta === rutaActual.query.servicio)
  ? rutaActual.query.servicio
  : ''

const solicitud = reactive({
  nombre: '',
  telefono: '',
  servicio: servicioInicial,
  fecha: '',
  hora: '',
  nota: '',
})

const nombreServicio = computed(
  () => servicios.find((servicio) => servicio.ruta === solicitud.servicio)?.nombre || 'el servicio',
)

// Esta confirmación es local hasta conectar la base de datos y el panel administrativo.
const enviarSolicitud = () => {
  enviado.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <section class="pagina-formulario">
    <div class="pagina-formulario__intro">
      <p class="etiqueta-bloque"><span></span>Agenda tu momento</p>
      <h1>Solicita una fecha para tu cita.</h1>
      <p>
        Completa los datos y luego la encargada revisará si el horario está disponible. En esta
        etapa el formulario funciona como demostración y todavía no guarda información.
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
          La conexión con la base de datos se realizará en la siguiente etapa.
        </p>
        <button class="control control--borde" type="button" @click="enviado = false">
          Editar solicitud
        </button>
      </div>

      <form v-else @submit.prevent="enviarSolicitud">
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
          <select id="servicio" v-model="solicitud.servicio" required>
            <option value="" disabled>Selecciona una opción</option>
            <option v-for="servicio in servicios" :key="servicio.id" :value="servicio.ruta">
              {{ servicio.nombre }}
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
        <button class="control control--principal campo-formulario--completo" type="submit">
          Enviar a revisión
        </button>
      </form>
    </div>
  </section>
</template>
