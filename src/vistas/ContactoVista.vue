<script setup>
import { useSesion } from '../composables/useSesion'
import { CONTACTO_LUXFER, crearEnlaceWhatsApp } from '../configuracion/contacto'

const sesion = useSesion()
</script>

<template>
  <section class="cabecera-pagina">
    <p class="etiqueta-bloque"><span></span>Estamos para ayudarte</p>
    <h1>Conversemos sobre lo que necesitas.</h1>
    <p>Escríbenos, llámanos o conversa con nosotros por WhatsApp para resolver tus dudas.</p>
  </section>
  <section class="contacto-pagina contacto-pagina--definitivo">
    <div class="contacto-pagina__datos">
      <article><small>Correo</small><strong><a :href="`mailto:${CONTACTO_LUXFER.correo}`">{{ CONTACTO_LUXFER.correo }}</a></strong><p>Respondemos consultas sobre servicios y citas.</p></article>
      <article><small>Horario</small><strong>Lunes a sábado</strong><p>De 08:00 a 18:00, con cita previa.</p></article>
      <article><small>Teléfono y WhatsApp</small><strong><a :href="CONTACTO_LUXFER.telefonoEnlace">{{ CONTACTO_LUXFER.telefonoVisible }}</a></strong><p>Puedes llamarnos o enviarnos un mensaje.</p></article>
    </div>
    <article class="tarjeta-contacto-principal">
      <span aria-hidden="true">✦</span><h2>¿Deseas solicitar una cita?</h2>
      <p>Crea tu cuenta para consultar servicios, horas libres y guardar tu solicitud.</p>
      <div class="grupo-acciones"><RouterLink v-if="sesion.puedeAgendarCitas" class="control control--principal" to="/agendar">Agendar cita</RouterLink><a class="control control--borde" :href="crearEnlaceWhatsApp()" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a></div>
    </article>
  </section>
</template>
