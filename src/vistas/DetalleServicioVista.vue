<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSesion } from '../composables/useSesion'
import { obtenerServicio, obtenerUrlImagen } from '../servicios/catalogos'
import { formatearDinero } from '../utilidades/validaciones'

const rutaActual = useRoute()
const sesion = useSesion()
const servicio = ref(null)
const cargando = ref(true)
const errorPagina = ref('')

const cargarServicio = async () => {
  cargando.value = true
  errorPagina.value = ''
  try { servicio.value = await obtenerServicio(rutaActual.params.ruta) }
  catch { errorPagina.value = 'No pudimos cargar el servicio.' }
  finally { cargando.value = false }
}

onMounted(cargarServicio)
watch(() => rutaActual.params.ruta, cargarServicio)
</script>

<template>
  <section v-if="cargando" class="estado-vacio"><h1>Cargando servicio…</h1></section>
  <section v-else-if="servicio" class="detalle-servicio">
    <div class="detalle-servicio__visual tarjeta-catalogo--rosa">
      <img v-if="servicio.imagen_ruta" :src="obtenerUrlImagen(servicio.imagen_ruta)" :alt="servicio.nombre" />
      <template v-else><span class="detalle-servicio__circulo"></span><span class="detalle-servicio__envase"></span></template>
      <small>{{ servicio.categorias_servicio?.nombre }} · LUXFER</small>
    </div>
    <div class="detalle-servicio__contenido">
      <p class="etiqueta-bloque"><span></span>Detalle del servicio</p><h1>{{ servicio.nombre }}</h1>
      <p class="detalle-servicio__descripcion">{{ servicio.descripcion }}</p>
      <dl class="datos-servicio"><div><dt>Duración</dt><dd>{{ servicio.duracion_minutos }} minutos</dd></div><div><dt>Valor</dt><dd>Desde {{ formatearDinero(servicio.precio_desde) }}</dd></div></dl>
      <div v-if="servicio.incluye?.length" class="incluye-servicio"><h2>¿Qué incluye?</h2><ul><li v-for="elemento in servicio.incluye" :key="elemento">{{ elemento }}</li></ul></div>
      <div class="grupo-acciones"><RouterLink v-if="sesion.puedeAgendarCitas" class="control control--principal" :to="{ name: 'agendar', query: { servicio: servicio.slug } }">Solicitar este servicio</RouterLink><RouterLink class="enlace-simple" to="/servicios">Volver a servicios</RouterLink></div>
    </div>
  </section>
  <section v-else class="estado-vacio"><p class="etiqueta-bloque"><span></span>No disponible</p><h1>{{ errorPagina || 'Ese servicio no está disponible.' }}</h1><RouterLink class="control control--principal" to="/servicios">Ver servicios</RouterLink></section>
</template>
