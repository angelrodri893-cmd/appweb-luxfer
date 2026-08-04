<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../servicios/supabase'

const enrutador = useRouter()
const cuenta = reactive({ nombre: '', telefono: '', correo: '', clave: '' })
const registroCompletado = ref(false)
const enviando = ref(false)
const errorFormulario = ref('')

const crearCuenta = async () => {
  enviando.value = true
  errorFormulario.value = ''

  const { data, error } = await supabase.auth.signUp({
    email: cuenta.correo,
    password: cuenta.clave,
    options: {
      data: {
        nombre_completo: cuenta.nombre,
        telefono: cuenta.telefono,
      },
      emailRedirectTo: `${window.location.origin}/acceso`,
    },
  })

  enviando.value = false
  if (error) {
    errorFormulario.value =
      error.message.includes('already registered')
        ? 'Este correo ya tiene una cuenta. Intenta iniciar sesión.'
        : 'No pudimos crear la cuenta. Revisa los datos e inténtalo nuevamente.'
    return
  }

  if (data.session) {
    await enrutador.replace('/mi-cuenta')
    return
  }

  registroCompletado.value = true
}
</script>

<template>
  <section class="pagina-autenticacion pagina-autenticacion--registro">
    <div class="pagina-autenticacion__mensaje">
      <p class="etiqueta-bloque"><span></span>Primera visita</p>
      <h1>Crea tu espacio personal.</h1>
      <p>Tu cuenta te permitirá consultar citas, estados e historial de servicios.</p>
    </div>
    <div class="tarjeta-formulario tarjeta-formulario--acceso">
      <div v-if="registroCompletado" class="mensaje-exito" role="status">
        <span aria-hidden="true">✓</span><h2>Revisa tu correo</h2>
        <p>Enviamos un enlace de confirmación a {{ cuenta.correo }}. Confirma la cuenta antes de ingresar.</p>
        <RouterLink class="control control--borde" to="/acceso">Ir al acceso</RouterLink>
      </div>
      <form v-else @submit.prevent="crearCuenta">
        <h2>Crear cuenta</h2>
        <p v-if="errorFormulario" class="mensaje-formulario mensaje-formulario--error" role="alert">
          {{ errorFormulario }}
        </p>
        <div class="campo-formulario campo-formulario--completo"><label for="registro-nombre">Nombre completo</label><input id="registro-nombre" v-model.trim="cuenta.nombre" type="text" required /></div>
        <div class="campo-formulario campo-formulario--completo"><label for="registro-telefono">Teléfono</label><input id="registro-telefono" v-model.trim="cuenta.telefono" type="tel" required /></div>
        <div class="campo-formulario campo-formulario--completo"><label for="registro-correo">Correo electrónico</label><input id="registro-correo" v-model.trim="cuenta.correo" type="email" required /></div>
        <div class="campo-formulario campo-formulario--completo"><label for="registro-clave">Contraseña</label><input id="registro-clave" v-model="cuenta.clave" type="password" minlength="6" required /></div>
        <button class="control control--principal campo-formulario--completo" type="submit" :disabled="enviando">
          {{ enviando ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
        <p class="ayuda-formulario">¿Ya tienes cuenta? <RouterLink to="/acceso">Iniciar sesión</RouterLink></p>
      </form>
    </div>
  </section>
</template>
