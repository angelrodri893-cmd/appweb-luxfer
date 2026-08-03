<script setup>
const periodoActual = new Date().getFullYear()
</script>

<template>
  <footer class="pie-sitio">
    <div class="pie-sitio__principal">
      <RouterLink class="marca" to="/" aria-label="LuxFer, volver al inicio">
        <span class="marca__inicial" aria-hidden="true">L</span>
        <span class="marca__nombre">LuxFer</span>
        <small>Centro de estética</small>
      </RouterLink>
      <p>Un espacio sencillo y agradable para regalarte el cuidado que mereces.</p>
      <nav aria-label="Navegación del pie de página">
        <RouterLink to="/servicios">Servicios</RouterLink>
        <RouterLink to="/productos">Productos</RouterLink>
        <RouterLink to="/contacto">Contacto</RouterLink>
        <RouterLink to="/agendar">Citas</RouterLink>
      </nav>
    </div>
    <div class="pie-sitio__inferior">
      <span>© {{ periodoActual }} LuxFer</span>
      <span>Datos de contacto por confirmar</span>
    </div>
  </footer>
</template>
