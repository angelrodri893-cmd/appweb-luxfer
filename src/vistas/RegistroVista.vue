<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { refrescarSesion } from '../composables/useSesion'
import { mostrarNotificacion } from '../composables/useNotificacion'
import { supabase } from '../servicios/supabase'
import { claveValida, limpiarTelefono, telefonoValido } from '../utilidades/validaciones'

const enrutador = useRouter()
const cuenta = reactive({ nombre: '', telefono: '', correo: '', clave: '', confirmarClave: '' })
const registroCompletado = ref(false)
const enviando = ref(false)
const claveVisible = ref(false)
const confirmacionVisible = ref(false)
const errores = reactive({ nombre: '', telefono: '', clave: '', general: '' })

const validarFormulario = () => {
  errores.nombre = cuenta.nombre.trim().length >= 3 ? '' : 'Escribe un nombre de al menos 3 caracteres.'
  errores.telefono = telefonoValido(cuenta.telefono) ? '' : 'Ingresa entre 9 y 10 dígitos.'
  errores.clave = !claveValida(cuenta.clave)
    ? 'Usa al menos 8 caracteres, una letra y un número.'
    : cuenta.clave !== cuenta.confirmarClave ? 'Las contraseñas no coinciden.' : ''
  return !errores.nombre && !errores.telefono && !errores.clave
}

const crearCuenta = async () => {
  errores.general = ''
  if (!validarFormulario()) return

  enviando.value = true
  const { data, error } = await supabase.auth.signUp({
    email: cuenta.correo.trim().toLowerCase(),
    password: cuenta.clave,
    options: {
      data: { nombre_completo: cuenta.nombre.trim(), telefono: cuenta.telefono },
      emailRedirectTo: `${window.location.origin}/acceso`,
    },
  })
  enviando.value = false

  if (error) {
    errores.general = error.message.includes('already registered')
      ? 'Este correo ya tiene una cuenta. Intenta iniciar sesión.'
      : 'No pudimos crear la cuenta. Revisa los datos e inténtalo nuevamente.'
    return
  }

  mostrarNotificacion({
    titulo: 'Cuenta registrada',
    mensaje: data.session ? 'Tu cuenta ya está disponible.' : 'Revisa tu correo para confirmar la cuenta.',
    duracion: 5000,
  })

  if (data.session) {
    await refrescarSesion()
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
      <p>Tu cuenta te permitirá agendar y consultar tus citas e historial de servicios.</p>
    </div>
    <div class="tarjeta-formulario tarjeta-formulario--acceso">
      <div v-if="registroCompletado" class="mensaje-exito" role="status">
        <span aria-hidden="true">✓</span><h2>Revisa tu correo</h2>
        <p>Enviamos un enlace de confirmación a {{ cuenta.correo }}.</p>
        <RouterLink class="control control--borde" to="/acceso">Ir al acceso</RouterLink>
      </div>
      <form v-else @submit.prevent="crearCuenta">
        <h2>Crear cuenta</h2>
        <p v-if="errores.general" class="mensaje-formulario mensaje-formulario--error" role="alert">{{ errores.general }}</p>

        <div class="campo-formulario campo-formulario--completo">
          <label for="registro-nombre">Nombre completo</label>
          <input id="registro-nombre" v-model.trim="cuenta.nombre" type="text" minlength="3" maxlength="80" required autocomplete="name" />
          <small v-if="errores.nombre" class="error-campo">{{ errores.nombre }}</small>
        </div>
        <div class="campo-formulario campo-formulario--completo">
          <label for="registro-telefono">Teléfono</label>
          <input id="registro-telefono" :value="cuenta.telefono" type="tel" inputmode="numeric" minlength="9" maxlength="10" pattern="[0-9]{9,10}" required autocomplete="tel" @input="cuenta.telefono = limpiarTelefono($event.target.value)" />
          <small v-if="errores.telefono" class="error-campo">{{ errores.telefono }}</small>
        </div>
        <div class="campo-formulario campo-formulario--completo">
          <label for="registro-correo">Correo electrónico</label>
          <input id="registro-correo" v-model.trim="cuenta.correo" type="email" required autocomplete="email" />
        </div>
        <div class="campo-formulario">
          <label for="registro-clave">Contraseña</label>
          <div class="entrada-clave">
            <input id="registro-clave" v-model="cuenta.clave" :type="claveVisible ? 'text' : 'password'" minlength="8" required autocomplete="new-password" />
            <button type="button" :aria-label="claveVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="claveVisible" @click="claveVisible = !claveVisible">
              {{ claveVisible ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>
        <div class="campo-formulario">
          <label for="registro-confirmar">Confirmar contraseña</label>
          <div class="entrada-clave">
            <input id="registro-confirmar" v-model="cuenta.confirmarClave" :type="confirmacionVisible ? 'text' : 'password'" minlength="8" required autocomplete="new-password" />
            <button type="button" :aria-label="confirmacionVisible ? 'Ocultar confirmación' : 'Mostrar confirmación'" :aria-pressed="confirmacionVisible" @click="confirmacionVisible = !confirmacionVisible">
              {{ confirmacionVisible ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <small v-if="errores.clave" class="error-campo">{{ errores.clave }}</small>
        </div>
        <button class="control control--principal campo-formulario--completo" type="submit" :disabled="enviando">
          {{ enviando ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
        <p class="ayuda-formulario">¿Ya tienes cuenta? <RouterLink to="/acceso">Iniciar sesión</RouterLink></p>
      </form>
    </div>
  </section>
</template>
