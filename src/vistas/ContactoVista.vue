<script setup>
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

const rutaActual = useRoute()
const enviado = ref(false)
const productoConsultado = typeof rutaActual.query.producto === 'string' ? rutaActual.query.producto : ''
const mensaje = reactive({
  nombre: '',
  telefono: '',
  asunto: productoConsultado ? `Consulta sobre ${productoConsultado}` : '',
  contenido: productoConsultado ? `Hola, quisiera conocer más sobre ${productoConsultado}.` : '',
})

const enviarMensaje = () => {
  enviado.value = true
}
</script>

<template>
  <section class="cabecera-pagina">
    <p class="etiqueta-bloque"><span></span>Estamos para ayudarte</p>
    <h1>Conversemos sobre lo que necesitas.</h1>
    <p>Los datos comerciales reales y el enlace de WhatsApp se agregarán cuando sean confirmados.</p>
  </section>

  <section class="contacto-pagina">
    <div class="contacto-pagina__datos">
      <article><small>WhatsApp</small><strong>Número por confirmar</strong><p>Próximamente disponible.</p></article>
      <article><small>Ubicación</small><strong>Dirección por confirmar</strong><p>Se añadirá el mapa del centro.</p></article>
      <article><small>Horario</small><strong>Atención con cita</strong><p>Horario comercial por definir.</p></article>
    </div>

    <div class="tarjeta-formulario">
      <div v-if="enviado" class="mensaje-exito" role="status">
        <span aria-hidden="true">✓</span><h2>Mensaje preparado</h2>
        <p>El formulario funciona correctamente. El envío real se conectará más adelante.</p>
        <button class="control control--borde" type="button" @click="enviado = false">Volver</button>
      </div>
      <form v-else @submit.prevent="enviarMensaje">
        <div class="campo-formulario">
          <label for="contacto-nombre">Nombre</label>
          <input id="contacto-nombre" v-model.trim="mensaje.nombre" type="text" required />
        </div>
        <div class="campo-formulario">
          <label for="contacto-telefono">Teléfono</label>
          <input id="contacto-telefono" v-model.trim="mensaje.telefono" type="tel" required />
        </div>
        <div class="campo-formulario campo-formulario--completo">
          <label for="contacto-asunto">Asunto</label>
          <input id="contacto-asunto" v-model.trim="mensaje.asunto" type="text" required />
        </div>
        <div class="campo-formulario campo-formulario--completo">
          <label for="contacto-mensaje">Mensaje</label>
          <textarea id="contacto-mensaje" v-model.trim="mensaje.contenido" rows="5" required></textarea>
        </div>
        <button class="control control--principal campo-formulario--completo" type="submit">
          Preparar mensaje
        </button>
      </form>
    </div>
  </section>
</template>
