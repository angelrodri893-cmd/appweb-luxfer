<script setup>
import imagenPortada from '../assets/inicio-luxfer.jpg'
import { servicios } from '../datos/servicios'
</script>

<template>
  <section class="portada" aria-labelledby="nombre-portada">
    <div class="portada__contenido">
      <p class="etiqueta-bloque"><span></span>Cuidado que se siente bien</p>
      <h1 id="nombre-portada">Un momento bonito para cuidar de ti.</h1>
      <p class="portada__detalle">
        En LuxFer queremos que te sientas cómoda, escuchada y especial. Disfruta una pausa
        sencilla, tranquila y pensada para ti.
      </p>

      <div class="portada__acciones">
        <RouterLink class="control control--principal" to="/agendar">
          Quiero agendar <span aria-hidden="true">↗</span>
        </RouterLink>
        <RouterLink class="enlace-simple" to="/servicios">
          Ver servicios <span aria-hidden="true">→</span>
        </RouterLink>
      </div>

      <div class="portada__detalles" aria-label="Información destacada">
        <div>
          <strong>Te escuchamos</strong>
          <span>El cuidado se adapta a lo que necesitas.</span>
        </div>
        <div>
          <strong>Tú eliges el momento</strong>
          <span>Solicita el horario que mejor te funcione.</span>
        </div>
      </div>
    </div>

    <div class="portada__imagen">
      <img :src="imagenPortada" alt="Cliente recibiendo un tratamiento facial relajante" />
      <div class="portada__distintivo">
        <span aria-hidden="true">✦</span>
        <p><strong>Tu momento</strong><small>de cuidado y calma</small></p>
      </div>
    </div>
  </section>

  <section class="barra-valores" aria-label="Valores de LuxFer">
    <p><span>01</span>Atención cercana</p>
    <p><span>02</span>Cuidado a tu ritmo</p>
    <p><span>03</span>Reserva sin complicaciones</p>
  </section>

  <section class="bloque" aria-labelledby="nombre-servicios">
    <div class="cabecera-bloque">
      <div>
        <p class="etiqueta-bloque"><span></span>Servicios para ti</p>
        <h2 id="nombre-servicios">Elige lo que te haga sentir bien.</h2>
      </div>
      <div class="cabecera-bloque__texto">
        <p>Esta es una primera muestra. Más adelante añadiremos el catálogo completo.</p>
        <RouterLink class="enlace-simple" to="/servicios">
          Ver todos los servicios <span>→</span>
        </RouterLink>
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
          <p>{{ servicio.resumen }}</p>
          <RouterLink
            :to="{ name: 'detalle-servicio', params: { ruta: servicio.ruta } }"
            :aria-label="`Conocer ${servicio.nombre}`"
          >
            Conocer más <span>↗</span>
          </RouterLink>
        </div>
      </article>
    </div>
  </section>

  <section class="proceso-reserva" aria-labelledby="nombre-proceso">
    <div class="proceso-reserva__intro">
      <p class="etiqueta-bloque etiqueta-bloque--clara"><span></span>Así de sencillo</p>
      <h2 id="nombre-proceso">Solicitar una cita es muy fácil.</h2>
      <p>Elige lo que deseas, indica un horario y espera la validación del centro.</p>
    </div>

    <ol class="lista-pasos">
      <li><span>01</span><div><h3>Elige tu servicio</h3><p>Revisa las opciones disponibles.</p></div></li>
      <li><span>02</span><div><h3>Solicita tu horario</h3><p>Selecciona una fecha y una hora.</p></div></li>
      <li><span>03</span><div><h3>Recibe la respuesta</h3><p>La encargada confirmará la disponibilidad.</p></div></li>
    </ol>
  </section>

  <section class="productos" aria-labelledby="nombre-productos">
    <div class="productos__muestra" aria-hidden="true">
      <span class="productos__fondo-circular"></span>
      <span class="productos__tarro"></span>
      <span class="productos__gotero"></span>
      <span class="productos__rama"></span>
    </div>
    <div class="productos__contenido">
      <p class="etiqueta-bloque"><span></span>Para cuidarte en casa</p>
      <h2 id="nombre-productos">Productos para acompañar tu rutina.</h2>
      <p>Explora una muestra provisional de productos de skincare y consulta el que te interese.</p>
      <RouterLink class="control control--borde" to="/productos">
        Conocer productos <span aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </section>

  <section class="llamado-citas" aria-labelledby="nombre-citas">
    <div>
      <p class="etiqueta-bloque etiqueta-bloque--clara"><span></span>Cuando tú quieras</p>
      <h2 id="nombre-citas">¿Te gustaría visitarnos?</h2>
    </div>
    <div class="llamado-citas__accion">
      <p>Prueba el formulario provisional para solicitar tu servicio, fecha y horario.</p>
      <RouterLink class="control control--claro" to="/agendar">
        Solicitar cita <span aria-hidden="true">↗</span>
      </RouterLink>
    </div>
  </section>
</template>
