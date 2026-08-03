<script setup>
import { productos } from '../datos/productos'
</script>

<template>
  <section class="cabecera-pagina cabecera-pagina--rosa">
    <p class="etiqueta-bloque"><span></span>Cuidado en casa</p>
    <h1>Productos para completar tu rutina.</h1>
    <p>Por ahora mostramos ejemplos. Más adelante se agregarán fotografías, precios y existencias.</p>
  </section>

  <section class="seccion-pagina">
    <div class="rejilla-productos">
      <article v-for="producto in productos" :key="producto.id" class="tarjeta-producto">
        <div class="tarjeta-producto__visual" :class="`tarjeta-catalogo--${producto.tono}`">
          <span aria-hidden="true"></span>
        </div>
        <div class="tarjeta-producto__contenido">
          <small>{{ producto.categoria }}</small>
          <h2>{{ producto.nombre }}</h2>
          <p>{{ producto.resumen }}</p>
          <strong>{{ producto.precio }}</strong>
          <RouterLink
            class="control control--borde"
            :to="{ name: 'contacto', query: { producto: producto.nombre } }"
          >Consultar producto</RouterLink>
        </div>
      </article>
    </div>
    <p class="nota-provisional">
      Cuando se confirme el número comercial, este botón abrirá WhatsApp con el producto elegido.
    </p>
  </section>
</template>
