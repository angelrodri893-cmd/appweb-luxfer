<script setup>
import { reactive, ref } from 'vue'

const accesoPreparado = ref(false)
const credenciales = reactive({ correo: '', clave: '' })
</script>

<template>
  <section class="pagina-autenticacion">
    <div class="pagina-autenticacion__mensaje">
      <p class="etiqueta-bloque"><span></span>Tu espacio LuxFer</p>
      <h1>Consulta tus citas y servicios.</h1>
      <p>Esta sección se conectará con la autenticación y la base de datos en una etapa posterior.</p>
    </div>
    <div class="tarjeta-formulario tarjeta-formulario--acceso">
      <div v-if="accesoPreparado" class="mensaje-exito">
        <span aria-hidden="true">✓</span><h2>Formulario validado</h2>
        <p>El acceso real se habilitará cuando creemos las cuentas de usuario.</p>
        <RouterLink class="control control--principal" to="/mi-cuenta">Ver vista provisional</RouterLink>
      </div>
      <form v-else @submit.prevent="accesoPreparado = true">
        <h2>Iniciar sesión</h2>
        <div class="campo-formulario campo-formulario--completo">
          <label for="correo">Correo electrónico</label>
          <input id="correo" v-model.trim="credenciales.correo" type="email" required autocomplete="email" />
        </div>
        <div class="campo-formulario campo-formulario--completo">
          <label for="clave">Contraseña</label>
          <input id="clave" v-model="credenciales.clave" type="password" minlength="6" required autocomplete="current-password" />
        </div>
        <button class="control control--principal campo-formulario--completo" type="submit">Ingresar</button>
        <p class="ayuda-formulario">¿Aún no tienes cuenta? <RouterLink to="/registro">Crear cuenta</RouterLink></p>
      </form>
    </div>
  </section>
</template>
