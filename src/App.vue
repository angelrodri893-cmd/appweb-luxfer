<script setup>
import { ref } from 'vue'
import heroImage from './assets/inicio-luxfer.jpg'

const menuOpen = ref(false)
const currentYear = new Date().getFullYear()

const services = [
  {
    id: '01',
    name: 'Rituales faciales',
    description: 'Cuidado personalizado para limpiar, nutrir y devolverle luminosidad a tu piel.',
    accent: 'rose',
  },
  {
    id: '02',
    name: 'Bienestar corporal',
    description: 'Una pausa para liberar tensiones y reconectar con la calma que tu cuerpo necesita.',
    accent: 'sand',
  },
  {
    id: '03',
    name: 'Belleza esencial',
    description: 'Detalles pensados para realzar tu belleza natural y acompañar tu estilo.',
    accent: 'sage',
  },
]

const closeMenu = () => {
  menuOpen.value = false
}
</script>

<template>
  <div class="page-shell">
    <div class="announcement">
      <p>Hoy también puedes elegirte a ti</p>
      <a href="#citas">Agenda tu momento <span aria-hidden="true">→</span></a>
    </div>

    <header class="site-header">
      <a class="brand" href="#inicio" aria-label="LuxFer, volver al inicio" @click="closeMenu">
        <span class="brand__symbol" aria-hidden="true">L</span>
        <span class="brand__name">LuxFer</span>
        <small>Centro de estética</small>
      </a>

      <button
        class="menu-button"
        type="button"
        aria-label="Abrir o cerrar el menú"
        aria-controls="main-menu"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <span></span>
        <span></span>
      </button>

      <nav id="main-menu" class="main-menu" :class="{ 'main-menu--open': menuOpen }">
        <a href="#inicio" @click="closeMenu">Inicio</a>
        <a href="#servicios" @click="closeMenu">Servicios</a>
        <a href="#productos" @click="closeMenu">Productos</a>
        <a href="#contacto" @click="closeMenu">Contacto</a>
        <a class="button button--primary button--small" href="#citas" @click="closeMenu">
          Agendar cita
        </a>
      </nav>
    </header>

    <main>
      <section id="inicio" class="hero" aria-labelledby="hero-title">
        <div class="hero__content">
          <p class="section-label"><span></span>Cuidado que se siente bien</p>
          <h1 id="hero-title">Un momento bonito para cuidar de ti.</h1>
          <p class="hero__lead">
            En LuxFer queremos que te sientas cómoda, escuchada y especial. Ven a disfrutar una
            pausa sencilla, tranquila y pensada para ti.
          </p>

          <div class="hero__actions">
            <a class="button button--primary" href="#citas">
              Quiero agendar
              <span aria-hidden="true">↗</span>
            </a>
            <a class="inline-link" href="#servicios">
              Ver servicios
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div class="hero__details" aria-label="Información destacada">
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

        <div class="hero__media">
          <img
            :src="heroImage"
            alt="Cliente recibiendo un tratamiento facial relajante en LuxFer"
          />
          <div class="hero__badge">
            <span aria-hidden="true">✦</span>
            <p><strong>Tu momento</strong><small>de cuidado y calma</small></p>
          </div>
          <p class="hero__vertical-text" aria-hidden="true">CUIDADO · CALMA · BELLEZA</p>
        </div>
      </section>

      <section class="value-bar" aria-label="Valores de LuxFer">
        <p><span>01</span>Atención cercana</p>
        <p><span>02</span>Cuidado a tu ritmo</p>
        <p><span>03</span>Reserva sin complicaciones</p>
      </section>

      <section id="servicios" class="section services" aria-labelledby="services-title">
        <div class="section-heading">
          <div>
            <p class="section-label"><span></span>Servicios para ti</p>
            <h2 id="services-title">Elige lo que te haga sentir bien.</h2>
          </div>
          <div class="section-heading__aside">
            <p>
              Conoce nuestras opciones con calma y encuentra ese cuidado que estabas buscando.
            </p>
            <a class="inline-link" href="#citas">Ver todos los servicios <span>→</span></a>
          </div>
        </div>

        <div class="service-grid">
          <article
            v-for="service in services"
            :key="service.id"
            class="service-card"
            :class="`service-card--${service.accent}`"
          >
            <div class="service-card__number">{{ service.id }}</div>
            <div class="service-card__art" aria-hidden="true">
              <span class="service-card__orb"></span>
              <span class="service-card__vessel"></span>
              <span class="service-card__line"></span>
            </div>
            <div class="service-card__content">
              <h3>{{ service.name }}</h3>
              <p>{{ service.description }}</p>
              <a href="#citas" :aria-label="`Conocer ${service.name}`">Conocer más <span>↗</span></a>
            </div>
          </article>
        </div>
      </section>

      <section id="experiencia" class="experience" aria-labelledby="experience-title">
        <div class="experience__intro">
          <p class="section-label section-label--light"><span></span>Así de sencillo</p>
          <h2 id="experience-title">Reservar será muy fácil.</h2>
          <p>
            Solo tendrás que elegir lo que deseas, buscar un horario y esperar nuestra
            confirmación.
          </p>
        </div>

        <ol class="steps-list">
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

      <section id="productos" class="products" aria-labelledby="products-title">
        <div class="products__showcase" aria-hidden="true">
          <span class="products__sun"></span>
          <span class="products__jar"></span>
          <span class="products__dropper"></span>
          <span class="products__branch"></span>
        </div>

        <div class="products__content">
          <p class="section-label"><span></span>Para cuidarte en casa</p>
          <h2 id="products-title">Productos sencillos para acompañar tu rutina.</h2>
          <p>
            Encontrarás productos de skincare y podrás preguntarnos por WhatsApp cuál puede
            acompañar mejor tu cuidado diario.
          </p>
          <a class="button button--outline" href="#contacto">
            Conocer productos
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section id="citas" class="booking" aria-labelledby="booking-title">
        <div class="booking__copy">
          <p class="section-label section-label--light"><span></span>Cuando tú quieras</p>
          <h2 id="booking-title">¿Te gustaría visitarnos?</h2>
        </div>
        <div class="booking__action">
          <p>
            Muy pronto podrás escoger desde aquí tu servicio, fecha y horario de una forma rápida
            y clara.
          </p>
          <a class="button button--light" href="#contacto">
            Quiero saber más
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </main>

    <footer id="contacto" class="footer">
      <div class="footer__top">
        <a class="brand brand--footer" href="#inicio" aria-label="LuxFer, volver al inicio">
          <span class="brand__symbol" aria-hidden="true">L</span>
          <span class="brand__name">LuxFer</span>
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
      <div class="footer__bottom">
        <span>© {{ currentYear }} LuxFer</span>
        <span>Datos de contacto por confirmar</span>
      </div>
    </footer>
  </div>
</template>
