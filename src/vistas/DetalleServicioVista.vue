<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { buscarServicio } from '../datos/servicios'

const rutaActual = useRoute()
const servicio = computed(() => buscarServicio(rutaActual.params.ruta))
</script>

<template>
  <section v-if="servicio" class="detalle-servicio">
    <div class="detalle-servicio__visual" :class="`tarjeta-catalogo--${servicio.tono}`">
      <span class="detalle-servicio__circulo"></span>
      <span class="detalle-servicio__envase"></span>
      <small>{{ servicio.id }} · LUXFER</small>
    </div>
    <div class="detalle-servicio__contenido">
      <p class="etiqueta-bloque"><span></span>Detalle provisional</p>
      <h1>{{ servicio.nombre }}</h1>
      <p class="detalle-servicio__descripcion">{{ servicio.descripcion }}</p>
      <dl class="datos-servicio">
        <div><dt>Duración</dt><dd>{{ servicio.duracion }}</dd></div>
        <div><dt>Valor</dt><dd>{{ servicio.precio }}</dd></div>
      </dl>
      <div class="incluye-servicio">
        <h2>¿Qué podría incluir?</h2>
        <ul><li v-for="elemento in servicio.incluye" :key="elemento">{{ elemento }}</li></ul>
      </div>
      <div class="grupo-acciones">
        <RouterLink
          class="control control--principal"
          :to="{ name: 'agendar', query: { servicio: servicio.ruta } }"
        >Solicitar este servicio</RouterLink>
        <RouterLink class="enlace-simple" to="/servicios">Volver a servicios</RouterLink>
      </div>
    </div>
  </section>

  <section v-else class="estado-vacio">
    <p class="etiqueta-bloque"><span></span>No disponible</p>
    <h1>Ese servicio todavía no existe.</h1>
    <RouterLink class="control control--principal" to="/servicios">Ver servicios</RouterLink>
  </section>
</template>
