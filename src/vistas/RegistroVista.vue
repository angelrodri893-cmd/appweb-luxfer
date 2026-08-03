<script setup>
import { reactive, ref } from 'vue'

const registroPreparado = ref(false)
const cuenta = reactive({ nombre: '', telefono: '', correo: '', clave: '' })
</script>

<template>
  <section class="pagina-autenticacion pagina-autenticacion--registro">
    <div class="pagina-autenticacion__mensaje">
      <p class="etiqueta-bloque"><span></span>Primera visita</p>
      <h1>Crea tu espacio personal.</h1>
      <p>Más adelante tu cuenta permitirá consultar citas, estados e historial de servicios.</p>
    </div>
    <div class="tarjeta-formulario tarjeta-formulario--acceso">
      <div v-if="registroPreparado" class="mensaje-exito">
        <span aria-hidden="true">✓</span><h2>Datos validados</h2>
        <p>El registro real se conectará a la base de datos en la etapa de autenticación.</p>
        <RouterLink class="control control--borde" to="/acceso">Ir al acceso</RouterLink>
      </div>
      <form v-else @submit.prevent="registroPreparado = true">
        <h2>Crear cuenta</h2>
        <div class="campo-formulario campo-formulario--completo"><label for="registro-nombre">Nombre completo</label><input id="registro-nombre" v-model.trim="cuenta.nombre" type="text" required /></div>
        <div class="campo-formulario campo-formulario--completo"><label for="registro-telefono">Teléfono</label><input id="registro-telefono" v-model.trim="cuenta.telefono" type="tel" required /></div>
        <div class="campo-formulario campo-formulario--completo"><label for="registro-correo">Correo electrónico</label><input id="registro-correo" v-model.trim="cuenta.correo" type="email" required /></div>
        <div class="campo-formulario campo-formulario--completo"><label for="registro-clave">Contraseña</label><input id="registro-clave" v-model="cuenta.clave" type="password" minlength="6" required /></div>
        <button class="control control--principal campo-formulario--completo" type="submit">Crear cuenta</button>
        <p class="ayuda-formulario">¿Ya tienes cuenta? <RouterLink to="/acceso">Iniciar sesión</RouterLink></p>
      </form>
    </div>
  </section>
</template>
