<script setup>
import EncabezadoSitio from './componentes/EncabezadoSitio.vue'
import PieSitio from './componentes/PieSitio.vue'
</script>

<template>
  <div class="contenedor-sitio">
    <EncabezadoSitio />
    <main class="contenido-principal">
      <RouterView />
    </main>
    <PieSitio />
  </div>
</template>
