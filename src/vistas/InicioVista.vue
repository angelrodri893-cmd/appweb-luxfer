<script setup>
import { onMounted, ref } from 'vue'
import imagenPortada from '../assets/inicio-luxfer.jpg'
import { useSesion } from '../composables/useSesion'
import { listarProductos, listarServicios, obtenerUrlImagen } from '../servicios/catalogos'
import { formatearDinero } from '../utilidades/validaciones'

const sesion = useSesion()
const servicios = ref([])
const productos = ref([])
const cargando = ref(true)
const errorPagina = ref('')

onMounted(async () => {
  try {
    ;[servicios.value, productos.value] = await Promise.all([
      listarServicios({ limite: 3 }),
      listarProductos({ limite: 3 }),
    ])
  } catch {
    errorPagina.value = 'No pudimos cargar el catálogo en este momento.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <section class="portada" aria-labelledby="nombre-portada">
    <div class="portada__contenido">
      <p class="etiqueta-bloque"><span></span>Cuidado que se siente bien</p>
      <h1 id="nombre-portada">Un momento bonito para cuidar de ti.</h1>
      <p class="portada__detalle">Disfruta una atención cercana, tranquila y pensada para lo que necesitas.</p>
      <div class="portada__acciones">
        <RouterLink v-if="sesion.puedeAgendarCitas" class="control control--principal" to="/agendar">Quiero agendar <span aria-hidden="true">↗</span></RouterLink>
        <RouterLink class="enlace-simple" to="/servicios">Ver servicios <span aria-hidden="true">→</span></RouterLink>
      </div>
      <div class="portada__detalles" aria-label="Información destacada">
        <div><strong>Te escuchamos</strong><span>El cuidado se adapta a lo que necesitas.</span></div>
        <div><strong>Tú eliges el momento</strong><span>Consulta horas libres de lunes a sábado.</span></div>
      </div>
    </div>
    <div class="portada__imagen">
      <img :src="imagenPortada" alt="Cliente recibiendo un tratamiento de belleza relajante" decoding="async" fetchpriority="high" />
      <div class="portada__distintivo"><span aria-hidden="true">✦</span><p><strong>Tu momento</strong><small>de cuidado y calma</small></p></div>
    </div>
  </section>

  <section class="barra-valores" aria-label="Valores de LuxFer">
    <p><span>01</span>Atención cercana</p><p><span>02</span>Cuidado a tu ritmo</p><p><span>03</span>Reserva sin complicaciones</p>
  </section>

  <p v-if="errorPagina" class="mensaje-formulario mensaje-formulario--error aviso-catalogo" role="alert">{{ errorPagina }}</p>

  <section class="bloque" aria-labelledby="nombre-servicios">
    <div class="cabecera-bloque">
      <div><p class="etiqueta-bloque"><span></span>Servicios para ti</p><h2 id="nombre-servicios">Elige lo que te haga sentir bien.</h2></div>
      <div class="cabecera-bloque__texto"><p>Conoce precios, duración y detalles antes de solicitar tu cita.</p><RouterLink class="enlace-simple" to="/servicios">Ver todos <span>→</span></RouterLink></div>
    </div>
    <div v-if="cargando" class="estado-vacio estado-vacio--interno"><h2>Cargando servicios…</h2></div>
    <div v-else class="lista-servicios">
      <article v-for="(servicio, indice) in servicios" :key="servicio.id" class="tarjeta-servicio" :class="`tarjeta-servicio--${['rosa', 'arena', 'salvia'][indice % 3]}`">
        <div class="tarjeta-servicio__numero">{{ String(indice + 1).padStart(2, '0') }}</div>
        <img v-if="servicio.imagen_ruta" class="tarjeta-servicio__imagen" :src="obtenerUrlImagen(servicio.imagen_ruta)" :alt="servicio.nombre" loading="lazy" decoding="async" />
        <div v-else class="tarjeta-servicio__adorno" aria-hidden="true"><span class="tarjeta-servicio__aro"></span><span class="tarjeta-servicio__envase"></span></div>
        <div class="tarjeta-servicio__contenido"><h3>{{ servicio.nombre }}</h3><p>{{ servicio.descripcion }}</p><RouterLink :to="{ name: 'detalle-servicio', params: { ruta: servicio.slug } }">Conocer más <span>↗</span></RouterLink></div>
      </article>
    </div>
  </section>

  <section class="proceso-reserva" aria-labelledby="nombre-proceso">
    <div class="proceso-reserva__intro"><p class="etiqueta-bloque etiqueta-bloque--clara"><span></span>Así de sencillo</p><h2 id="nombre-proceso">Solicitar una cita es muy fácil.</h2><p>Necesitas una cuenta para consultar horarios y guardar la solicitud.</p></div>
    <ol class="lista-pasos"><li><span>01</span><div><h3>Elige tu servicio</h3><p>Revisa todas las opciones.</p></div></li><li><span>02</span><div><h3>Selecciona una hora</h3><p>Solo verás horarios libres.</p></div></li><li><span>03</span><div><h3>Recibe la respuesta</h3><p>LuxFer confirmará tu solicitud.</p></div></li></ol>
  </section>

  <section class="bloque bloque--productos" aria-labelledby="nombre-productos">
    <div class="cabecera-bloque"><div><p class="etiqueta-bloque"><span></span>Cuidado en casa</p><h2 id="nombre-productos">Productos para acompañar tu rutina.</h2></div><RouterLink class="enlace-simple" to="/productos">Ver productos <span>→</span></RouterLink></div>
    <div class="rejilla-productos rejilla-productos--inicio">
      <article v-for="producto in productos" :key="producto.id" class="tarjeta-producto">
        <div class="tarjeta-producto__visual" :class="{ 'tarjeta-producto__visual--imagen': producto.imagen_ruta }"><img v-if="producto.imagen_ruta" :src="obtenerUrlImagen(producto.imagen_ruta)" :alt="producto.nombre" loading="lazy" decoding="async" /><span v-else aria-hidden="true"></span></div>
        <div class="tarjeta-producto__contenido"><small>{{ producto.categoria }}</small><h3>{{ producto.nombre }}</h3><strong>{{ formatearDinero(producto.precio) }}</strong></div>
      </article>
    </div>
  </section>

  <section class="llamado-citas" aria-labelledby="nombre-citas">
    <div><p class="etiqueta-bloque etiqueta-bloque--clara"><span></span>Cuando tú quieras</p><h2 id="nombre-citas">¿Te gustaría visitarnos?</h2></div>
    <div class="llamado-citas__accion"><p>Selecciona un servicio y consulta las horas realmente disponibles.</p><RouterLink v-if="sesion.puedeAgendarCitas" class="control control--claro" to="/agendar">Solicitar cita <span aria-hidden="true">↗</span></RouterLink></div>
  </section>
</template>
