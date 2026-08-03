<script setup>
import { servicios } from '../datos/servicios'
</script>

<template>
  <section class="cabecera-pagina">
    <p class="etiqueta-bloque"><span></span>Nuestros servicios</p>
    <h1>Encuentra un cuidado pensado para ti.</h1>
    <p>Este catálogo es provisional. Los nombres, precios y duraciones se completarán después.</p>
  </section>

  <section class="seccion-pagina" aria-label="Catálogo provisional de servicios">
    <div class="rejilla-catalogo">
      <article
        v-for="servicio in servicios"
        :key="servicio.id"
        class="tarjeta-catalogo"
        :class="`tarjeta-catalogo--${servicio.tono}`"
      >
        <span class="tarjeta-catalogo__numero">{{ servicio.id }}</span>
        <div class="tarjeta-catalogo__figura" aria-hidden="true"><span></span></div>
        <p class="tarjeta-catalogo__tipo">Servicio provisional</p>
        <h2>{{ servicio.nombre }}</h2>
        <p>{{ servicio.resumen }}</p>
        <RouterLink
          class="enlace-simple"
          :to="{ name: 'detalle-servicio', params: { ruta: servicio.ruta } }"
        >
          Ver detalle <span>→</span>
        </RouterLink>
      </article>
    </div>
  </section>
</template>
