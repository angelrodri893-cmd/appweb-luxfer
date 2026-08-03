<script setup>
import { ref } from 'vue'
import imagenPortada from './assets/inicio-luxfer.jpg'

// Controla la apertura del panel en pantallas reducidas.
const panelAbierto = ref(false)
const periodoActual = new Date().getFullYear()

// Datos provisionales; luego vendran desde la base de datos.
const servicios = [
  {
    id: '01',
    nombre: 'Rituales faciales',
    detalle: 'Cuidado personalizado para limpiar, nutrir y devolverle luminosidad a tu piel.',
    tono: 'rosa',
  },
  {
    id: '02',
    nombre: 'Bienestar corporal',
    detalle: 'Una pausa para liberar tensiones y reconectar con la calma que tu cuerpo necesita.',
    tono: 'arena',
  },
  {
    id: '03',
    nombre: 'Belleza esencial',
    detalle: 'Detalles pensados para realzar tu belleza natural y acompañar tu estilo.',
    tono: 'salvia',
  },
]

// Cierra el panel al elegir un enlace.
const cerrarPanel = () => {
  panelAbierto.value = false
}
</script>

<template>
  <div class="contenedor-sitio">
    <!-- Aviso y enlaces principales -->
    <div class="aviso-superior">
      <p>Hoy también puedes elegirte a ti</p>
      <a href="#citas">Agenda tu momento <span aria-hidden="true">→</span></a>
    </div>

    <header class="encabezado-sitio">
      <a class="marca" href="#inicio" aria-label="LuxFer, volver al inicio" @click="cerrarPanel">
        <span class="marca__inicial" aria-hidden="true">L</span>
        <span class="marca__nombre">LuxFer</span>
        <small>Centro de estética</small>
      </a>

      <button
        class="control-panel"
        type="button"
        aria-label="Abrir o cerrar el menú"
        aria-controls="panel-principal"
        :aria-expanded="panelAbierto"
        @click="panelAbierto = !panelAbierto"
      >
        <span></span>
        <span></span>
      </button>

      <nav
        id="panel-principal"
        class="panel-principal"
        :class="{ 'panel-principal--abierto': panelAbierto }"
      >
        <a href="#inicio" @click="cerrarPanel">Inicio</a>
        <a href="#servicios" @click="cerrarPanel">Servicios</a>
        <a href="#productos" @click="cerrarPanel">Productos</a>
        <a href="#contacto" @click="cerrarPanel">Contacto</a>
        <a class="control control--principal control--compacto" href="#citas" @click="cerrarPanel">
          Agendar cita
        </a>
      </nav>
    </header>

    <main>
      <!-- Portada del sitio -->
      <section id="inicio" class="portada" aria-labelledby="nombre-portada">
        <div class="portada__contenido">
          <p class="etiqueta-bloque"><span></span>Cuidado que se siente bien</p>
          <h1 id="nombre-portada">Un momento bonito para cuidar de ti.</h1>
          <p class="portada__detalle">
            En LuxFer queremos que te sientas cómoda, escuchada y especial. Ven a disfrutar una
            pausa sencilla, tranquila y pensada para ti.
          </p>

          <div class="portada__acciones">
            <a class="control control--principal" href="#citas">
              Quiero agendar
              <span aria-hidden="true">↗</span>
            </a>
            <a class="enlace-simple" href="#servicios">
              Ver servicios
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div class="portada__detalles" aria-label="Información destacada">
            <div>
              <strong>Te escuchamos</strong>
              <span>El cuidado se adapta a lo que necesitas.</span>
            </div>
            <div>
              <strong>Tú eliges el momento</strong>
              <span>Busca el horario que mejor te funcione.</span>
            </div>
          </div>
        </div>

        <div class="portada__imagen">
          <img
            :src="imagenPortada"
            alt="Cliente recibiendo un tratamiento facial relajante en LuxFer"
          />
          <div class="portada__distintivo">
            <span aria-hidden="true">✦</span>
            <p><strong>Tu momento</strong><small>de cuidado y calma</small></p>
          </div>
          <p class="portada__texto-vertical" aria-hidden="true">CUIDADO · CALMA · BELLEZA</p>
        </div>
      </section>

      <section class="barra-valores" aria-label="Valores de LuxFer">
        <p><span>01</span>Atención cercana</p>
        <p><span>02</span>Cuidado a tu ritmo</p>
        <p><span>03</span>Reserva sin complicaciones</p>
      </section>

      <!-- Resumen visual de servicios -->
      <section id="servicios" class="bloque" aria-labelledby="nombre-servicios">
        <div class="cabecera-bloque">
          <div>
            <p class="etiqueta-bloque"><span></span>Servicios para ti</p>
            <h2 id="nombre-servicios">Elige lo que te haga sentir bien.</h2>
          </div>
          <div class="cabecera-bloque__texto">
            <p>
              Conoce nuestras opciones con calma y encuentra ese cuidado que estabas buscando.
            </p>
            <a class="enlace-simple" href="#citas">Ver todos los servicios <span>→</span></a>
          </div>
        </div>

        <div class="lista-servicios">
          <article
            v-for="servicio in servicios"
            :key="servicio.id"
            class="tarjeta-servicio"
            :class="`tarjeta-servicio--${servicio.tono}`"
          >
            <div class="tarjeta-servicio__numero">{{ servicio.id }}</div>
            <div class="tarjeta-servicio__adorno" aria-hidden="true">
              <span class="tarjeta-servicio__aro"></span>
              <span class="tarjeta-servicio__envase"></span>
              <span class="tarjeta-servicio__trazo"></span>
            </div>
            <div class="tarjeta-servicio__contenido">
              <h3>{{ servicio.nombre }}</h3>
              <p>{{ servicio.detalle }}</p>
              <a href="#citas" :aria-label="`Conocer ${servicio.nombre}`">
                Conocer más <span>↗</span>
              </a>
            </div>
          </article>
        </div>
      </section>

      <!-- Pasos para solicitar una cita -->
      <section id="experiencia" class="proceso-reserva" aria-labelledby="nombre-proceso">
        <div class="proceso-reserva__intro">
          <p class="etiqueta-bloque etiqueta-bloque--clara"><span></span>Así de sencillo</p>
          <h2 id="nombre-proceso">Reservar será muy fácil.</h2>
          <p>
            Solo tendrás que elegir lo que deseas, buscar un horario y esperar nuestra
            confirmación.
          </p>
        </div>

        <ol class="lista-pasos">
          <li>
            <span>01</span>
            <div>
              <h3>Elige tu servicio</h3>
              <p>Revisa las opciones y encuentra la que más te guste.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Busca tu horario</h3>
              <p>Escoge una fecha y una hora que se acomoden a tu día.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Recibe nuestra respuesta</h3>
              <p>Te avisaremos cuando tu cita haya sido confirmada.</p>
            </div>
          </li>
        </ol>
      </section>

      <!-- Muestra de productos -->
      <section id="productos" class="productos" aria-labelledby="nombre-productos">
        <div class="productos__muestra" aria-hidden="true">
          <span class="productos__fondo-circular"></span>
          <span class="productos__tarro"></span>
          <span class="productos__gotero"></span>
          <span class="productos__rama"></span>
        </div>

        <div class="productos__contenido">
          <p class="etiqueta-bloque"><span></span>Para cuidarte en casa</p>
          <h2 id="nombre-productos">Productos sencillos para acompañar tu rutina.</h2>
          <p>
            Encontrarás productos de skincare y podrás preguntarnos por WhatsApp cuál puede
            acompañar mejor tu cuidado diario.
          </p>
          <a class="control control--borde" href="#contacto">
            Conocer productos
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <!-- Llamado final para agendar -->
      <section id="citas" class="llamado-citas" aria-labelledby="nombre-citas">
        <div>
          <p class="etiqueta-bloque etiqueta-bloque--clara"><span></span>Cuando tú quieras</p>
          <h2 id="nombre-citas">¿Te gustaría visitarnos?</h2>
        </div>
        <div class="llamado-citas__accion">
          <p>
            Muy pronto podrás escoger desde aquí tu servicio, fecha y horario de una forma rápida
            y clara.
          </p>
          <a class="control control--claro" href="#contacto">
            Quiero saber más
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </main>

    <footer id="contacto" class="pie-sitio">
      <div class="pie-sitio__principal">
        <a class="marca" href="#inicio" aria-label="LuxFer, volver al inicio">
          <span class="marca__inicial" aria-hidden="true">L</span>
          <span class="marca__nombre">LuxFer</span>
          <small>Centro de estética</small>
        </a>
        <p>Un espacio sencillo y agradable para regalarte el cuidado que mereces.</p>
        <nav aria-label="Navegación del pie de página">
          <a href="#servicios">Servicios</a>
          <a href="#productos">Productos</a>
          <a href="#inicio">Inicio</a>
          <a href="#citas">Citas</a>
        </nav>
      </div>
      <div class="pie-sitio__inferior">
        <span>© {{ periodoActual }} LuxFer</span>
        <span>Datos de contacto por confirmar</span>
      </div>
    </footer>
  </div>
</template>
