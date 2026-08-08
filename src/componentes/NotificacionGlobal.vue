<script setup>
import { cerrarNotificacion, useNotificacion } from '../composables/useNotificacion'

const notificacion = useNotificacion()
</script>

<template>
  <Transition name="aparicion-notificacion">
    <div
      v-if="notificacion.visible"
      class="fondo-notificacion"
      role="status"
      aria-live="polite"
      @click.self="cerrarNotificacion"
    >
      <article class="tarjeta-notificacion">
        <span class="tarjeta-notificacion__visto" aria-hidden="true">✓</span>
        <h2>{{ notificacion.titulo }}</h2>
        <p v-if="notificacion.mensaje">{{ notificacion.mensaje }}</p>
        <button class="control control--borde control--compacto" type="button" @click="cerrarNotificacion">
          Entendido
        </button>
      </article>
    </div>
  </Transition>
</template>
