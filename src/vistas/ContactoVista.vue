<script setup>
import { useSesion } from '../composables/useSesion'

const sesion = useSesion()
</script>

<template>
  <section class="cabecera-pagina">
    <p class="etiqueta-bloque"><span></span>Estamos para ayudarte</p>
    <h1>Conversemos sobre lo que necesitas.</h1>
    <p>Escríbenos por correo o visita el sitio oficial de WhatsApp mientras habilitamos el número comercial.</p>
  </section>
  <section class="contacto-pagina contacto-pagina--definitivo">
    <div class="contacto-pagina__datos">
      <article><small>Correo</small><strong>info.luxferr@gmail.com</strong><a href="mailto:info.luxferr@gmail.com">Enviar un correo</a></article>
      <article><small>Horario</small><strong>Lunes a sábado</strong><p>De 08:00 a 18:00, con cita previa.</p></article>
      <article><small>WhatsApp</small><strong>Número por confirmar</strong><p>El acceso se actualizará cuando el centro confirme su número.</p></article>
    </div>
    <article class="tarjeta-contacto-principal">
      <span aria-hidden="true">✦</span><h2>¿Deseas solicitar una cita?</h2>
      <p>Crea tu cuenta para consultar servicios, horas libres y guardar tu solicitud.</p>
      <div class="grupo-acciones"><RouterLink v-if="sesion.puedeAgendarCitas" class="control control--principal" to="/agendar">Agendar cita</RouterLink><a class="control control--borde" href="https://www.whatsapp.com/" target="_blank" rel="noopener noreferrer">Ir a WhatsApp</a></div>
    </article>
  </section>
</template>
