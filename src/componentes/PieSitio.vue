<script setup>
import { useSesion } from '../composables/useSesion'
import { CONTACTO_LUXFER, crearEnlaceWhatsApp } from '../configuracion/contacto'

const periodoActual = new Date().getFullYear()
const sesion = useSesion()
</script>

<template>
  <footer class="pie-sitio">
    <div class="pie-sitio__principal">
      <RouterLink class="marca" to="/" aria-label="LuxFer, volver al inicio">
        <span class="marca__inicial" aria-hidden="true">L</span>
        <span class="marca__nombre">LuxFer</span>
        <small>Centro de estética</small>
      </RouterLink>
      <p>Un espacio cercano y agradable para regalarte el cuidado que mereces.</p>
      <nav aria-label="Navegación del pie de página">
        <RouterLink to="/servicios">Servicios</RouterLink>
        <RouterLink to="/productos">Productos</RouterLink>
        <RouterLink v-if="sesion.puedeVerContacto" to="/contacto">Contacto</RouterLink>
        <RouterLink v-if="sesion.puedeAgendarCitas" to="/agendar">Citas</RouterLink>
        <a :href="CONTACTO_LUXFER.telefonoEnlace">{{ CONTACTO_LUXFER.telefonoVisible }}</a>
        <a :href="crearEnlaceWhatsApp()" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </nav>
    </div>
    <div class="pie-sitio__inferior">
      <span>© {{ periodoActual }} LuxFer</span>
      <a :href="`mailto:${CONTACTO_LUXFER.correo}`">{{ CONTACTO_LUXFER.correo }}</a>
    </div>
  </footer>
</template>
