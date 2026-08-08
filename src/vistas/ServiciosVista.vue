<script setup>
import { onMounted, ref } from 'vue'
import { listarServicios, obtenerUrlImagen } from '../servicios/catalogos'
import { formatearDinero } from '../utilidades/validaciones'

const servicios = ref([])
const cargando = ref(true)
const errorPagina = ref('')

onMounted(async () => {
  try { servicios.value = await listarServicios() }
  catch { errorPagina.value = 'No pudimos cargar los servicios. Inténtalo nuevamente.' }
  finally { cargando.value = false }
})
</script>

<template>
  <section class="cabecera-pagina">
    <p class="etiqueta-bloque"><span></span>Nuestros servicios</p>
    <h1>Encuentra un cuidado pensado para ti.</h1>
    <p>Consulta precios y duración antes de elegir el momento de tu cita.</p>
  </section>
  <section class="seccion-pagina" aria-label="Catálogo de servicios">
    <p v-if="errorPagina" class="mensaje-formulario mensaje-formulario--error" role="alert">{{ errorPagina }}</p>
    <div v-if="cargando" class="estado-vacio estado-vacio--interno"><h2>Cargando servicios…</h2></div>
    <div v-else-if="servicios.length" class="rejilla-catalogo">
      <article v-for="(servicio, indice) in servicios" :key="servicio.id" class="tarjeta-catalogo" :class="`tarjeta-catalogo--${['rosa', 'arena', 'salvia'][indice % 3]}`">
        <span class="tarjeta-catalogo__numero">{{ String(indice + 1).padStart(2, '0') }}</span>
        <div class="tarjeta-catalogo__figura"><img v-if="servicio.imagen_ruta" :src="obtenerUrlImagen(servicio.imagen_ruta)" :alt="servicio.nombre" /><span v-else aria-hidden="true"></span></div>
        <p class="tarjeta-catalogo__tipo">{{ servicio.categorias_servicio?.nombre }}</p>
        <h2>{{ servicio.nombre }}</h2><p>{{ servicio.descripcion }}</p>
        <strong>{{ formatearDinero(servicio.precio_desde) }} · {{ servicio.duracion_minutos }} min</strong>
        <RouterLink class="enlace-simple" :to="{ name: 'detalle-servicio', params: { ruta: servicio.slug } }">Ver detalle <span>→</span></RouterLink>
      </article>
    </div>
    <div v-else class="estado-vacio estado-vacio--interno"><h2>No hay servicios disponibles.</h2></div>
  </section>
</template>
