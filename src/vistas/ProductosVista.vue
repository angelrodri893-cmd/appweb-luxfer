<script setup>
import { onMounted, ref } from 'vue'
import { listarProductos, obtenerUrlImagen } from '../servicios/catalogos'
import { formatearDinero } from '../utilidades/validaciones'

const productos = ref([])
const cargando = ref(true)
const errorPagina = ref('')
const enlaceWhatsapp = 'https://www.whatsapp.com/'

onMounted(async () => {
  try { productos.value = await listarProductos() }
  catch { errorPagina.value = 'No pudimos cargar los productos. Inténtalo nuevamente.' }
  finally { cargando.value = false }
})
</script>

<template>
  <section class="cabecera-pagina cabecera-pagina--rosa">
    <p class="etiqueta-bloque"><span></span>Cuidado en casa</p>
    <h1>Productos para completar tu rutina.</h1>
    <p>Consulta nuestra selección y comunícate por WhatsApp para conocer disponibilidad.</p>
  </section>
  <section class="seccion-pagina">
    <p v-if="errorPagina" class="mensaje-formulario mensaje-formulario--error" role="alert">{{ errorPagina }}</p>
    <div v-if="cargando" class="estado-vacio estado-vacio--interno"><h2>Cargando productos…</h2></div>
    <div v-else-if="productos.length" class="rejilla-productos">
      <article v-for="producto in productos" :key="producto.id" class="tarjeta-producto">
        <div class="tarjeta-producto__visual">
          <img v-if="producto.imagen_ruta" :src="obtenerUrlImagen(producto.imagen_ruta)" :alt="producto.nombre" />
          <span v-else aria-hidden="true"></span>
        </div>
        <div class="tarjeta-producto__contenido">
          <small>{{ producto.categoria }}</small><h2>{{ producto.nombre }}</h2><p>{{ producto.descripcion }}</p>
          <strong>{{ formatearDinero(producto.precio) }}</strong>
          <a class="control control--borde" :href="enlaceWhatsapp" target="_blank" rel="noopener noreferrer" :aria-label="`Consultar ${producto.nombre} en WhatsApp`">Consultar en WhatsApp</a>
        </div>
      </article>
    </div>
    <div v-else class="estado-vacio estado-vacio--interno"><h2>No hay productos disponibles.</h2></div>
    <p class="nota-informativa">El enlace abrirá el sitio oficial de WhatsApp hasta que LuxFer confirme su número comercial.</p>
  </section>
</template>
