<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../servicios/supabase'

const ruta = useRoute()
const enrutador = useRouter()
const credenciales = reactive({ correo: '', clave: '' })
const enviando = ref(false)
const errorFormulario = ref('')

const iniciarSesion = async () => {
  enviando.value = true
  errorFormulario.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: credenciales.correo,
    password: credenciales.clave,
  })

  enviando.value = false
  if (error) {
    errorFormulario.value =
      error.message === 'Email not confirmed'
        ? 'Confirma tu correo electrónico antes de ingresar.'
        : 'No pudimos iniciar sesión. Revisa tu correo y contraseña.'
    return
  }

  const destino = typeof ruta.query.redireccion === 'string' ? ruta.query.redireccion : '/mi-cuenta'
  await enrutador.replace(destino)
}
</script>

<template>
  <section class="pagina-autenticacion">
    <div class="pagina-autenticacion__mensaje">
      <p class="etiqueta-bloque"><span></span>Tu espacio LuxFer</p>
      <h1>Consulta tus citas y servicios.</h1>
      <p>Ingresa de forma segura para consultar tus citas, estados e historial de servicios.</p>
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
          <input id="clave" v-model="credenciales.clave" type="password" minlength="6" required autocomplete="current-password" />
        </div>
        <button class="control control--principal campo-formulario--completo" type="submit" :disabled="enviando">
          {{ enviando ? 'Ingresando…' : 'Ingresar' }}
        </button>
        <p class="ayuda-formulario">¿Aún no tienes cuenta? <RouterLink to="/registro">Crear cuenta</RouterLink></p>
      </form>
    </div>
  </section>
</template>
