<template>
  <section class="cabecera-pagina cabecera-pagina--cuenta">
    <p class="etiqueta-bloque"><span></span>Vista provisional</p>
    <h1>Hola, aquí verás tu actividad.</h1>
    <p>Este contenido es únicamente una muestra visual y todavía no pertenece a un usuario real.</p>
  </section>
  <section class="seccion-pagina">
    <div class="resumen-cuenta">
      <article><small>Próxima cita</small><h2>Sin citas confirmadas</h2><RouterLink to="/agendar">Solicitar una cita</RouterLink></article>
      <article><small>Solicitudes</small><h2>0 pendientes</h2><p>Aquí aparecerán los estados de revisión.</p></article>
      <article><small>Servicios realizados</small><h2>Sin registros</h2><p>El historial estará disponible después.</p></article>
    </div>
    <div class="estado-vacio estado-vacio--interno">
      <span aria-hidden="true">✦</span><h2>Tu historial comenzará aquí.</h2>
      <p>Cuando una cita finalice, podrás consultar el servicio, la fecha y las recomendaciones.</p>
    </div>
  </section>
</template>
