<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSesion } from '../composables/useSesion'

const panelAbierto = ref(false)
const panelMovil = ref(false)
const rutaActual = useRoute()
const sesion = useSesion()
let consultaPanelMovil

const cerrarPanel = () => {
  panelAbierto.value = false
}

const sincronizarPanelMovil = (evento) => {
  panelMovil.value = evento.matches
  if (!evento.matches) cerrarPanel()
}

const cerrarConEscape = (evento) => {
  if (evento.key === 'Escape' && panelAbierto.value) {
    cerrarPanel()
    document.querySelector('.control-panel')?.focus()
  }
}

onMounted(() => {
  consultaPanelMovil = window.matchMedia('(max-width: 1080px)')
  sincronizarPanelMovil(consultaPanelMovil)
  consultaPanelMovil.addEventListener('change', sincronizarPanelMovil)
  document.addEventListener('keydown', cerrarConEscape)
})

onBeforeUnmount(() => {
  consultaPanelMovil?.removeEventListener('change', sincronizarPanelMovil)
  document.removeEventListener('keydown', cerrarConEscape)
})

// Evita que el panel movil permanezca abierto despues de navegar.
watch(() => rutaActual.fullPath, cerrarPanel)
</script>

<template>
  <div class="aviso-superior">
    <p>{{ sesion.esAdministrador ? 'Sesión administrativa activa' : 'Hoy también puedes elegirte a ti' }}</p>
    <RouterLink v-if="sesion.esAdministrador" to="/administracion">Volver al panel <span aria-hidden="true">→</span></RouterLink>
    <RouterLink v-else to="/agendar">Agenda tu momento <span aria-hidden="true">→</span></RouterLink>
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
      :aria-label="panelAbierto ? 'Cerrar el menú' : 'Abrir el menú'"
      aria-controls="panel-principal"
      :aria-expanded="panelAbierto"
      @click="panelAbierto = !panelAbierto"
    >
      <span></span><span></span>
    </button>

    <nav
      id="panel-principal"
      class="panel-principal"
      :class="{ 'panel-principal--abierto': panelAbierto }"
      :aria-hidden="panelMovil && !panelAbierto ? 'true' : undefined"
      :inert="panelMovil && !panelAbierto ? true : undefined"
      aria-label="Navegación principal"
    >
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/servicios">Servicios</RouterLink>
      <RouterLink to="/productos">Productos</RouterLink>
      <RouterLink v-if="sesion.puedeVerContacto" to="/contacto">Contacto</RouterLink>
      <RouterLink v-if="sesion.esAdministrador" class="control control--administracion control--compacto" to="/administracion">Administración</RouterLink>
      <RouterLink v-else :to="sesion.usuario ? '/mi-cuenta' : '/acceso'">Mi cuenta</RouterLink>
      <RouterLink v-if="sesion.puedeAgendarCitas" class="control control--principal control--compacto" to="/agendar">
        Agendar cita
      </RouterLink>
    </nav>
  </header>
</template>
