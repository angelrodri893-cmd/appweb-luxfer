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
      <p>Un espacio creado para cuidar de ti</p>
      <a href="#citas">Solicita tu cita <span aria-hidden="true">→</span></a>
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
        <a href="#experiencia" @click="closeMenu">Nosotros</a>
        <a class="main-menu__account" href="#citas" @click="closeMenu">Mis citas</a>
        <a class="button button--primary button--small" href="#citas" @click="closeMenu">
          Agendar ahora
        </a>
      </nav>
    </header>

    <main>
      <section id="inicio" class="hero" aria-labelledby="hero-title">
        <div class="hero__content">
          <p class="section-label"><span></span>Tu bienestar, nuestra inspiración</p>
          <h1 id="hero-title">Belleza que nace de sentirte bien.</h1>
          <p class="hero__lead">
            Regálate una experiencia de cuidado cercana y personalizada. En LuxFer creamos un
            momento pensado para ti, tu piel y tu bienestar.
          </p>

          <div class="hero__actions">
            <a class="button button--primary" href="#citas">
              Reservar una experiencia
              <span aria-hidden="true">↗</span>
            </a>
            <a class="inline-link" href="#servicios">
              Explorar servicios
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div class="hero__details" aria-label="Información destacada">
            <div>
              <strong>Atención personalizada</strong>
              <span>Cada experiencia comienza escuchándote.</span>
            </div>
            <div>
              <strong>Reserva sencilla</strong>
              <span>Selecciona el momento ideal para ti.</span>
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
        <p><span>01</span>Asesoría cercana</p>
        <p><span>02</span>Experiencias personalizadas</p>
        <p><span>03</span>Ambiente de confianza</p>
      </section>

      <section id="servicios" class="section services" aria-labelledby="services-title">
        <div class="section-heading">
          <div>
            <p class="section-label"><span></span>Descubre tu ritual</p>
            <h2 id="services-title">Un cuidado especial para cada necesidad.</h2>
          </div>
          <div class="section-heading__aside">
            <p>
              Conoce nuestras categorías y encuentra la experiencia que mejor acompaña lo que
              buscas para ti.
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
          <p class="section-label section-label--light"><span></span>Así funciona</p>
          <h2 id="experience-title">Tu próxima experiencia comienza en tres pasos.</h2>
          <p>
            Diseñamos un proceso claro para que puedas concentrarte en lo más importante:
            disfrutar tu momento.
          </p>
        </div>

        <ol class="steps-list">
          <li>
            <span>01</span>
            <div>
              <h3>Encuentra tu servicio</h3>
              <p>Conoce los detalles, duración y recomendaciones de cada experiencia.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Selecciona tu horario</h3>
              <p>Elige una fecha y una hora dentro de la disponibilidad mostrada.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Espera la confirmación</h3>
              <p>Revisaremos tu solicitud y te informaremos cuando la cita esté confirmada.</p>
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
          <p class="section-label"><span></span>Selección LuxFer</p>
          <h2 id="products-title">Tu rutina de cuidado también continúa en casa.</h2>
          <p>
            Descubre productos de skincare seleccionados para complementar tu bienestar. Podrás
            consultar disponibilidad y recibir asesoría directamente por WhatsApp.
          </p>
          <a class="button button--outline" href="#contacto">
            Conocer productos
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section id="citas" class="booking" aria-labelledby="booking-title">
        <div class="booking__copy">
          <p class="section-label section-label--light"><span></span>Tu tiempo es ahora</p>
          <h2 id="booking-title">Haz una pausa. Nosotros cuidamos el resto.</h2>
        </div>
        <div class="booking__action">
          <p>
            El módulo de citas estará disponible en el siguiente avance. Aquí podrás escoger tu
            servicio, fecha y horario.
          </p>
          <a class="button button--light" href="#contacto">
            Quiero recibir información
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
        <p>Cuidado auténtico, atención cercana y un momento creado especialmente para ti.</p>
        <nav aria-label="Navegación del pie de página">
          <a href="#servicios">Servicios</a>
          <a href="#productos">Productos</a>
          <a href="#experiencia">Nosotros</a>
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
