<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const panelAbierto = ref(false)
const rutaActual = useRoute()

const cerrarPanel = () => {
  panelAbierto.value = false
}

// Evita que el panel móvil permanezca abierto después de navegar.
watch(() => rutaActual.fullPath, cerrarPanel)
</script>

<template>
  <div class="aviso-superior">
    <p>Hoy también puedes elegirte a ti</p>
    <RouterLink to="/agendar">Agenda tu momento <span aria-hidden="true">→</span></RouterLink>
  </div>

  <header class="encabezado-sitio">
    <RouterLink class="marca" to="/" aria-label="LuxFer, volver al inicio" @click="cerrarPanel">
      <span class="marca__inicial" aria-hidden="true">L</span>
      <span class="marca__nombre">LuxFer</span>
      <small>Centro de estética</small>
    </RouterLink>

    <button
      class="control-panel"
      type="button"
      aria-label="Abrir o cerrar el menú"
      aria-controls="panel-principal"
      :aria-expanded="panelAbierto"
      @click="panelAbierto = !panelAbierto"
    >
      <span></span>
      <span></span>
    </button>

    <nav
      id="panel-principal"
      class="panel-principal"
      :class="{ 'panel-principal--abierto': panelAbierto }"
      aria-label="Navegación principal"
    >
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/servicios">Servicios</RouterLink>
      <RouterLink to="/productos">Productos</RouterLink>
      <RouterLink to="/contacto">Contacto</RouterLink>
      <RouterLink to="/acceso">Mi cuenta</RouterLink>
      <RouterLink class="control control--principal control--compacto" to="/agendar">
        Agendar cita
      </RouterLink>
    </nav>
  </header>
</template>
