<script setup>
import { computed, onMounted, ref } from 'vue'
import { listarServicios, obtenerUrlImagen } from '../servicios/catalogos'
import { formatearPrecioServicio } from '../utilidades/validaciones'

const servicios = ref([])
const cargando = ref(true)
const errorPagina = ref('')
const filtroActivo = ref('todos')
const filtros = [
  { slug: 'todos', nombre: 'Todos' },
  { slug: 'manicura', nombre: 'Manicura' },
  { slug: 'pedicura', nombre: 'Pedicura' },
  { slug: 'cuidado-capilar', nombre: 'Cuidado capilar' },
]
const serviciosFiltrados = computed(() => filtroActivo.value === 'todos'
  ? servicios.value
  : servicios.value.filter((servicio) => servicio.categorias_servicio?.slug === filtroActivo.value))

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
    <template v-else-if="servicios.length">
      <div class="filtros-catalogo" role="group" aria-label="Filtrar servicios por categoría">
        <button v-for="filtro in filtros" :key="filtro.slug" type="button" :class="{ activo: filtroActivo === filtro.slug }" :aria-pressed="filtroActivo === filtro.slug" @click="filtroActivo = filtro.slug">{{ filtro.nombre }}</button>
      </div>
      <div v-if="serviciosFiltrados.length" class="rejilla-catalogo">
        <article v-for="(servicio, indice) in serviciosFiltrados" :key="servicio.id" class="tarjeta-catalogo" :class="`tarjeta-catalogo--${['rosa', 'arena', 'salvia'][indice % 3]}`">
          <span class="tarjeta-catalogo__numero">{{ String(indice + 1).padStart(2, '0') }}</span>
          <div class="tarjeta-catalogo__figura" :class="{ 'tarjeta-catalogo__figura--imagen': servicio.imagen_ruta }">
            <img v-if="servicio.imagen_ruta" :src="obtenerUrlImagen(servicio.imagen_ruta)" :alt="servicio.nombre" loading="lazy" decoding="async" />
            <span v-else aria-hidden="true"></span>
          </div>
          <div class="tarjeta-catalogo__contenido">
            <p class="tarjeta-catalogo__tipo">{{ servicio.categorias_servicio?.nombre }}</p>
            <h2>{{ servicio.nombre }}</h2><p>{{ servicio.descripcion }}</p>
          </div>
          <footer class="tarjeta-catalogo__pie">
            <strong><span>{{ formatearPrecioServicio(servicio.precio_desde, servicio.precio_hasta) }}</span><small>{{ servicio.duracion_minutos }} min</small></strong>
            <RouterLink class="enlace-simple" :to="{ name: 'detalle-servicio', params: { ruta: servicio.slug } }">Ver detalle <span aria-hidden="true">→</span></RouterLink>
          </footer>
        </article>
      </div>
      <div v-else class="estado-vacio estado-vacio--interno"><h2>No hay servicios en esta categoría.</h2></div>
    </template>
    <div v-else class="estado-vacio estado-vacio--interno"><h2>No hay servicios disponibles.</h2></div>
  </section>
</template>
