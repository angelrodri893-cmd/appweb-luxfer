<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { refrescarSesion, useSesion } from '../composables/useSesion'
import { mostrarNotificacion } from '../composables/useNotificacion'
import { supabase } from '../servicios/supabase'

const ruta = useRoute()
const enrutador = useRouter()
const sesion = useSesion()
const credenciales = reactive({ correo: '', clave: '' })
const enviando = ref(false)
const errorFormulario = ref('')
const claveVisible = ref(false)

const iniciarSesion = async () => {
  enviando.value = true
  errorFormulario.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: credenciales.correo.trim().toLowerCase(),
    password: credenciales.clave,
  })

  if (error) {
    enviando.value = false
    errorFormulario.value = error.message === 'Email not confirmed'
      ? 'Confirma tu correo electrónico antes de ingresar.'
      : 'No pudimos iniciar sesión. Revisa tu correo y contraseña.'
    return
  }

  await refrescarSesion()
  enviando.value = false
  mostrarNotificacion({ titulo: 'Sesión iniciada', mensaje: 'Bienvenido a tu espacio LuxFer.' })

  const destinoConsultado = typeof ruta.query.redireccion === 'string' ? ruta.query.redireccion : ''
  const destino = destinoConsultado.startsWith('/')
    ? destinoConsultado
    : sesion.esAdministrador ? '/administracion' : '/mi-cuenta'
  await enrutador.replace(destino)
}
</script>

<template>
  <section class="pagina-autenticacion">
    <div class="pagina-autenticacion__mensaje">
      <p class="etiqueta-bloque"><span></span>Tu espacio LuxFer</p>
      <h1>Consulta tus citas y servicios.</h1>
      <p>Ingresa para revisar tus solicitudes, estados e historial de atención.</p>
    </div>
    <div class="tarjeta-formulario tarjeta-formulario--acceso">
      <form @submit.prevent="iniciarSesion">
        <h2>Iniciar sesión</h2>
        <p v-if="errorFormulario" class="mensaje-formulario mensaje-formulario--error" role="alert">
          {{ errorFormulario }}
        </p>
        <div class="campo-formulario campo-formulario--completo">
          <label for="correo">Correo electrónico</label>
          <input id="correo" v-model.trim="credenciales.correo" type="email" required autocomplete="email" />
        </div>
        <div class="campo-formulario campo-formulario--completo">
          <label for="clave">Contraseña</label>
          <div class="entrada-clave">
            <input id="clave" v-model="credenciales.clave" :type="claveVisible ? 'text' : 'password'" minlength="8" required autocomplete="current-password" />
            <button type="button" :aria-label="claveVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="claveVisible" @click="claveVisible = !claveVisible">
              {{ claveVisible ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>
        <button class="control control--principal campo-formulario--completo" type="submit" :disabled="enviando">
          {{ enviando ? 'Ingresando…' : 'Ingresar' }}
        </button>
        <p class="ayuda-formulario">¿Aún no tienes cuenta? <RouterLink to="/registro">Crear cuenta</RouterLink></p>
      </form>
    </div>
  </section>
</template>
