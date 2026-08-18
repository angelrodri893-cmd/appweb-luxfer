<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cerrarSesion, useSesion } from '../composables/useSesion'
import { mostrarNotificacion } from '../composables/useNotificacion'
import {
  crearBloqueo,
  eliminarBloqueo,
  gestionarCita,
  guardarProducto,
  guardarServicio,
  listarBloqueos,
  listarCategorias,
  listarCitasAdministracion,
} from '../servicios/administracion'
import { eliminarImagenCatalogo, subirImagenCatalogo } from '../servicios/almacenamiento'
import { listarProductos, listarServicios, obtenerUrlImagen } from '../servicios/catalogos'
import { estadoCitaPermiteGestion } from '../utilidades/permisos'
import { formatearDinero, formatearFecha, obtenerMensajeError } from '../utilidades/validaciones'

const enrutador = useRouter()
const sesion = useSesion()
const seccionActiva = ref('agenda')
const citas = ref([])
const servicios = ref([])
const productos = ref([])
const categorias = ref([])
const bloqueos = ref([])
const cargando = ref(true)
const errorPagina = ref('')
const notasCitas = reactive({})
const procesandoCita = ref('')
const cerrandoSesion = ref(false)

const fechaEcuador = (valor) => {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(valor))
  const obtener = (tipo) => partes.find((parte) => parte.type === tipo)?.value
  return `${obtener('year')}-${obtener('month')}-${obtener('day')}`
}

const ahora = new Date()
const hoy = fechaEcuador(ahora)
const fechaSeleccionada = ref(hoy)
const mesVisible = ref(new Date(`${hoy}T12:00:00`))
const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const resumen = computed(() => ({
  pendientes: citas.value.filter((cita) => cita.estado === 'pendiente').length,
  confirmadas: citas.value.filter((cita) => cita.estado === 'confirmada').length,
  completadas: citas.value.filter((cita) => cita.estado === 'completada').length,
  hoy: citas.value.filter((cita) => fechaEcuador(cita.inicio) === hoy).length,
}))

const celdasCalendario = computed(() => {
  const periodo = mesVisible.value
  const anio = periodo.getFullYear()
  const mes = periodo.getMonth()
  const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7
  const cantidadDias = new Date(anio, mes + 1, 0).getDate()
  const celdas = Array.from({ length: primerDia }, () => null)

  for (let dia = 1; dia <= cantidadDias; dia += 1) {
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    const citasDia = citas.value.filter((cita) => fechaEcuador(cita.inicio) === fecha)
    celdas.push({ fecha, dia, cantidad: citasDia.length, pendientes: citasDia.filter((cita) => cita.estado === 'pendiente').length })
  }
  return celdas
})

const citasSeleccionadas = computed(() => citas.value.filter((cita) => fechaEcuador(cita.inicio) === fechaSeleccionada.value))
const tituloMes = computed(() => `${nombresMeses[mesVisible.value.getMonth()]} ${mesVisible.value.getFullYear()}`)

const formularioBloqueo = reactive({ inicio: '', fin: '', motivo: '' })
const guardandoBloqueo = ref(false)

const servicioVacio = () => ({ id: '', categoria_id: '', slug: '', nombre: '', descripcion: '', precio_desde: '', precio_hasta: '', duracion_minutos: 60, imagen_ruta: '', incluyeTexto: '', orden: 0, activo: true })
const productoVacio = () => ({ id: '', slug: '', nombre: '', categoria: '', descripcion: '', precio: '', imagen_ruta: '', orden: 0, activo: true })
const formularioServicio = reactive(servicioVacio())
const formularioProducto = reactive(productoVacio())
const editandoServicio = ref(false)
const editandoProducto = ref(false)
const archivoServicio = ref(null)
const archivoProducto = ref(null)
const guardandoCatalogo = ref(false)
const errorCatalogo = ref('')

const asignarCitas = (citasCargadas) => {
  citas.value = citasCargadas
  Object.keys(notasCitas).forEach((citaId) => delete notasCitas[citaId])
  citasCargadas.forEach((cita) => {
    notasCitas[cita.id] = cita.nota_administradora ?? ''
  })
}

const cargarAdministracion = async () => {
  errorPagina.value = ''
  try {
    const [citasCargadas, serviciosCargados, productosCargados, categoriasCargadas, bloqueosCargados] = await Promise.all([
      listarCitasAdministracion(),
      listarServicios({ incluirInactivos: true }),
      listarProductos({ incluirInactivos: true }),
      listarCategorias(),
      listarBloqueos(),
    ])
    asignarCitas(citasCargadas)
    servicios.value = serviciosCargados
    productos.value = productosCargados
    categorias.value = categoriasCargadas
    bloqueos.value = bloqueosCargados
  } catch (error) {
    errorPagina.value = obtenerMensajeError(error, 'No pudimos cargar el panel de administración.')
  } finally {
    cargando.value = false
  }
}

const moverMes = (cantidad) => {
  mesVisible.value = new Date(mesVisible.value.getFullYear(), mesVisible.value.getMonth() + cantidad, 1)
}

const cambiarEstado = async (cita, estado) => {
  procesandoCita.value = cita.id
  errorPagina.value = ''
  try {
    await gestionarCita(cita.id, estado, notasCitas[cita.id] || '')
    mostrarNotificacion({ titulo: 'Cita actualizada', mensaje: `La solicitud quedó ${estado}.` })
    asignarCitas(await listarCitasAdministracion())
  } catch (error) {
    errorPagina.value = obtenerMensajeError(error, 'No pudimos actualizar la cita.')
  } finally {
    procesandoCita.value = ''
  }
}

const salir = async () => {
  cerrandoSesion.value = true
  errorPagina.value = ''
  try {
    await cerrarSesion()
    await enrutador.replace('/')
  } catch (error) {
    errorPagina.value = obtenerMensajeError(error, 'No pudimos cerrar la sesión.')
    cerrandoSesion.value = false
  }
}

const guardarBloqueo = async () => {
  if (!formularioBloqueo.inicio || !formularioBloqueo.fin || new Date(formularioBloqueo.fin) <= new Date(formularioBloqueo.inicio)) {
    errorPagina.value = 'El final del bloqueo debe ser posterior al inicio.'
    return
  }
  guardandoBloqueo.value = true
  try {
    await crearBloqueo({
      inicio: `${formularioBloqueo.inicio}:00-05:00`,
      fin: `${formularioBloqueo.fin}:00-05:00`,
      motivo: formularioBloqueo.motivo.trim(),
      creadoPor: sesion.usuario.id,
    })
    Object.assign(formularioBloqueo, { inicio: '', fin: '', motivo: '' })
    bloqueos.value = await listarBloqueos()
    mostrarNotificacion({ titulo: 'Horario bloqueado', mensaje: 'Ese periodo ya no se ofrecerá a los clientes.' })
  } catch (error) { errorPagina.value = obtenerMensajeError(error, 'No pudimos bloquear el horario.') }
  finally { guardandoBloqueo.value = false }
}

const borrarBloqueo = async (id) => {
  if (!window.confirm('¿Deseas liberar este periodo?')) return
  try {
    await eliminarBloqueo(id)
    bloqueos.value = await listarBloqueos()
    mostrarNotificacion({ titulo: 'Periodo liberado' })
  } catch { errorPagina.value = 'No pudimos eliminar el bloqueo.' }
}

const abrirServicio = (servicio = null) => {
  Object.assign(formularioServicio, servicioVacio(), servicio ? {
    ...servicio,
    categoria_id: servicio.categorias_servicio?.id ?? '',
    incluyeTexto: (servicio.incluye ?? []).join('\n'),
  } : {})
  archivoServicio.value = null
  errorCatalogo.value = ''
  editandoServicio.value = true
}

const abrirProducto = (producto = null) => {
  Object.assign(formularioProducto, productoVacio(), producto ?? {})
  archivoProducto.value = null
  errorCatalogo.value = ''
  editandoProducto.value = true
}

const guardarFormularioServicio = async () => {
  if (!formularioServicio.nombre.trim() || !formularioServicio.descripcion.trim() || !formularioServicio.categoria_id) {
    errorCatalogo.value = 'Completa nombre, categoría y descripción.'
    return
  }
  if (
    formularioServicio.precio_desde === ''
    || Number(formularioServicio.precio_desde) < 0
    || Number(formularioServicio.duracion_minutos) < 15
    || Number(formularioServicio.duracion_minutos) > 720
    || Number(formularioServicio.orden) < 0
  ) {
    errorCatalogo.value = 'Revisa el precio y la duración del servicio.'
    return
  }
  if (formularioServicio.precio_hasta !== '' && Number(formularioServicio.precio_hasta) < Number(formularioServicio.precio_desde)) {
    errorCatalogo.value = 'El precio máximo no puede ser menor al precio inicial.'
    return
  }

  guardandoCatalogo.value = true
  let nuevaRuta = ''
  const rutaAnterior = formularioServicio.imagen_ruta
  try {
    if (archivoServicio.value) nuevaRuta = await subirImagenCatalogo(archivoServicio.value, 'servicios')
    const guardado = await guardarServicio({
      ...formularioServicio,
      imagen_ruta: nuevaRuta || rutaAnterior,
      incluye: formularioServicio.incluyeTexto.split('\n').map((item) => item.trim()).filter(Boolean),
    })
    // La imagen nueva ya quedo guardada; un fallo al limpiar la anterior no debe revertir el formulario.
    if (nuevaRuta && rutaAnterior) await eliminarImagenCatalogo(rutaAnterior).catch(() => {})
    servicios.value = await listarServicios({ incluirInactivos: true })
    editandoServicio.value = false
    mostrarNotificacion({ titulo: 'Servicio guardado', mensaje: `${guardado.nombre} ya está actualizado.` })
  } catch (error) {
    if (nuevaRuta) await eliminarImagenCatalogo(nuevaRuta).catch(() => {})
    errorCatalogo.value = obtenerMensajeError(error, 'No pudimos guardar el servicio.')
  } finally { guardandoCatalogo.value = false }
}

const guardarFormularioProducto = async () => {
  if (!formularioProducto.nombre.trim() || !formularioProducto.categoria.trim() || !formularioProducto.descripcion.trim()) {
    errorCatalogo.value = 'Completa nombre, categoría y descripción.'
    return
  }
  if (
    formularioProducto.precio === ''
    || Number(formularioProducto.precio) < 0
    || Number(formularioProducto.orden) < 0
  ) {
    errorCatalogo.value = 'Ingresa un precio válido.'
    return
  }

  guardandoCatalogo.value = true
  let nuevaRuta = ''
  const rutaAnterior = formularioProducto.imagen_ruta
  try {
    if (archivoProducto.value) nuevaRuta = await subirImagenCatalogo(archivoProducto.value, 'productos')
    const guardado = await guardarProducto({ ...formularioProducto, imagen_ruta: nuevaRuta || rutaAnterior })
    // La limpieza de la imagen reemplazada es secundaria frente al cambio del producto.
    if (nuevaRuta && rutaAnterior) await eliminarImagenCatalogo(rutaAnterior).catch(() => {})
    productos.value = await listarProductos({ incluirInactivos: true })
    editandoProducto.value = false
    mostrarNotificacion({ titulo: 'Producto guardado', mensaje: `${guardado.nombre} ya está actualizado.` })
  } catch (error) {
    if (nuevaRuta) await eliminarImagenCatalogo(nuevaRuta).catch(() => {})
    errorCatalogo.value = obtenerMensajeError(error, 'No pudimos guardar el producto.')
  } finally { guardandoCatalogo.value = false }
}

onMounted(cargarAdministracion)
</script>

<template>
  <section class="cabecera-administracion">
    <div><p class="etiqueta-bloque"><span></span>Panel LuxFer</p><h1>Administración del centro.</h1><p>Gestiona solicitudes, disponibilidad y tarjetas del catálogo desde un solo lugar.</p></div>
    <button class="control control--borde" type="button" :disabled="cerrandoSesion" @click="salir">{{ cerrandoSesion ? 'Cerrando…' : 'Cerrar sesión' }}</button>
  </section>

  <section class="panel-administracion">
    <nav class="menu-administracion" aria-label="Secciones administrativas">
      <button type="button" :class="{ activo: seccionActiva === 'agenda' }" @click="seccionActiva = 'agenda'">Agenda</button>
      <button type="button" :class="{ activo: seccionActiva === 'servicios' }" @click="seccionActiva = 'servicios'">Servicios</button>
      <button type="button" :class="{ activo: seccionActiva === 'productos' }" @click="seccionActiva = 'productos'">Productos</button>
    </nav>

    <p v-if="errorPagina" class="mensaje-formulario mensaje-formulario--error" role="alert">{{ errorPagina }}</p>
    <div v-if="cargando" class="estado-vacio estado-vacio--interno"><h2>Preparando el panel…</h2></div>

    <template v-else-if="seccionActiva === 'agenda'">
      <div class="resumen-administracion"><article><small>Pendientes</small><strong>{{ resumen.pendientes }}</strong></article><article><small>Confirmadas</small><strong>{{ resumen.confirmadas }}</strong></article><article><small>Completadas</small><strong>{{ resumen.completadas }}</strong></article><article><small>Citas hoy</small><strong>{{ resumen.hoy }}</strong></article></div>
      <div class="agenda-administracion">
        <div class="calendario-administracion">
          <header><button type="button" aria-label="Mes anterior" @click="moverMes(-1)">←</button><h2>{{ tituloMes }}</h2><button type="button" aria-label="Mes siguiente" @click="moverMes(1)">→</button></header>
          <div class="calendario-semana"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div>
          <div class="calendario-dias"><button v-for="(celda, indice) in celdasCalendario" :key="celda?.fecha || `vacio-${indice}`" type="button" :disabled="!celda" :class="{ seleccionado: celda?.fecha === fechaSeleccionada, 'con-citas': celda?.cantidad }" @click="celda && (fechaSeleccionada = celda.fecha)"><template v-if="celda"><span>{{ celda.dia }}</span><small v-if="celda.cantidad">{{ celda.cantidad }} cita{{ celda.cantidad === 1 ? '' : 's' }}</small><i v-if="celda.pendientes" aria-label="Solicitudes pendientes"></i></template></button></div>
        </div>
        <div class="citas-dia"><h2>Citas del {{ fechaSeleccionada }}</h2><article v-for="cita in citasSeleccionadas" :key="cita.id" class="cita-administracion"><div><span class="estado-cita" :class="`estado-cita--${cita.estado}`">{{ cita.estado }}</span><h3>{{ cita.servicios?.nombre }}</h3><p>{{ formatearFecha(cita.inicio) }}</p><p>{{ cita.perfiles?.nombre_completo }} · {{ cita.perfiles?.telefono }}</p><p v-if="cita.nota_cliente"><strong>Cliente:</strong> {{ cita.nota_cliente }}</p></div><label :for="`nota-${cita.id}`">{{ estadoCitaPermiteGestion(cita.estado) ? 'Nota para el cliente' : 'Nota enviada al cliente' }}</label><textarea :id="`nota-${cita.id}`" v-model.trim="notasCitas[cita.id]" rows="2" maxlength="500" placeholder="Escribe una respuesta breve" :disabled="!estadoCitaPermiteGestion(cita.estado) || procesandoCita === cita.id"></textarea><small v-if="!estadoCitaPermiteGestion(cita.estado)" class="nota-cita-bloqueada">Esta cita está cerrada y su nota ya no se puede modificar.</small><div class="acciones-administracion"><button v-if="cita.estado === 'pendiente'" class="control control--principal control--compacto" type="button" :disabled="procesandoCita === cita.id" @click="cambiarEstado(cita, 'confirmada')">Confirmar</button><button v-if="cita.estado === 'pendiente'" class="control control--borde control--compacto" type="button" :disabled="procesandoCita === cita.id" @click="cambiarEstado(cita, 'rechazada')">Rechazar</button><button v-if="cita.estado === 'confirmada'" class="control control--principal control--compacto" type="button" :disabled="procesandoCita === cita.id" @click="cambiarEstado(cita, 'completada')">Completar</button><button v-if="estadoCitaPermiteGestion(cita.estado)" class="control control--borde control--compacto" type="button" :disabled="procesandoCita === cita.id" @click="cambiarEstado(cita, 'cancelada')">Cancelar</button></div></article><div v-if="!citasSeleccionadas.length" class="estado-vacio estado-vacio--interno"><h3>No hay citas para este día.</h3></div></div>
      </div>

      <section class="bloqueos-administracion"><div><h2>Bloquear un horario especial</h2><p>Úsalo para descansos, feriados o periodos que no deben ofrecerse.</p><form class="formulario-bloqueo" @submit.prevent="guardarBloqueo"><div class="campo-formulario"><label for="bloqueo-inicio">Inicio</label><input id="bloqueo-inicio" v-model="formularioBloqueo.inicio" type="datetime-local" required /></div><div class="campo-formulario"><label for="bloqueo-fin">Fin</label><input id="bloqueo-fin" v-model="formularioBloqueo.fin" type="datetime-local" required /></div><div class="campo-formulario campo-formulario--completo"><label for="bloqueo-motivo">Motivo</label><input id="bloqueo-motivo" v-model.trim="formularioBloqueo.motivo" type="text" maxlength="120" /></div><button class="control control--principal" type="submit" :disabled="guardandoBloqueo">{{ guardandoBloqueo ? 'Guardando…' : 'Bloquear periodo' }}</button></form></div><div class="lista-bloqueos"><article v-for="bloqueo in bloqueos" :key="bloqueo.id"><div><strong>{{ bloqueo.motivo || 'Horario no disponible' }}</strong><p>{{ formatearFecha(bloqueo.inicio) }} — {{ formatearFecha(bloqueo.fin) }}</p></div><button class="control control--borde control--compacto" type="button" @click="borrarBloqueo(bloqueo.id)">Liberar</button></article><p v-if="!bloqueos.length">No existen periodos bloqueados.</p></div></section>
    </template>

    <template v-else-if="seccionActiva === 'servicios'">
      <header class="cabecera-seccion-admin"><div><h2>Tarjetas de servicios</h2><p>Edita precios, duración, descripción e imagen.</p></div><button class="control control--principal" type="button" @click="abrirServicio()">Nuevo servicio</button></header>
      <div class="rejilla-admin-catalogo"><article v-for="servicio in servicios" :key="servicio.id"><img v-if="servicio.imagen_ruta" :src="obtenerUrlImagen(servicio.imagen_ruta)" :alt="servicio.nombre" /><div class="marcador-imagen" v-else aria-hidden="true">✦</div><span :class="['estado-publicacion', { inactivo: !servicio.activo }]">{{ servicio.activo ? 'Visible' : 'Oculto' }}</span><h3>{{ servicio.nombre }}</h3><p>{{ servicio.descripcion }}</p><strong>{{ formatearDinero(servicio.precio_desde) }} · {{ servicio.duracion_minutos }} min</strong><button class="control control--borde" type="button" @click="abrirServicio(servicio)">Editar tarjeta</button></article></div>
    </template>

    <template v-else>
      <header class="cabecera-seccion-admin"><div><h2>Tarjetas de productos</h2><p>Administra la selección que se muestra al público.</p></div><button class="control control--principal" type="button" @click="abrirProducto()">Nuevo producto</button></header>
      <div class="rejilla-admin-catalogo"><article v-for="producto in productos" :key="producto.id"><img v-if="producto.imagen_ruta" :src="obtenerUrlImagen(producto.imagen_ruta)" :alt="producto.nombre" /><div class="marcador-imagen" v-else aria-hidden="true">✦</div><span :class="['estado-publicacion', { inactivo: !producto.activo }]">{{ producto.activo ? 'Visible' : 'Oculto' }}</span><h3>{{ producto.nombre }}</h3><p>{{ producto.descripcion }}</p><strong>{{ formatearDinero(producto.precio) }}</strong><button class="control control--borde" type="button" @click="abrirProducto(producto)">Editar tarjeta</button></article></div>
    </template>
  </section>

  <div v-if="editandoServicio" class="fondo-modal" @click.self="editandoServicio = false">
    <form class="tarjeta-modal tarjeta-modal--catalogo" @submit.prevent="guardarFormularioServicio"><button class="cerrar-modal" type="button" aria-label="Cerrar" @click="editandoServicio = false">×</button><p class="etiqueta-bloque"><span></span>{{ formularioServicio.id ? 'Editar servicio' : 'Nuevo servicio' }}</p><h2>Información de la tarjeta</h2><p v-if="errorCatalogo" class="mensaje-formulario mensaje-formulario--error">{{ errorCatalogo }}</p><div class="rejilla-formulario-admin"><div class="campo-formulario"><label for="servicio-nombre">Nombre</label><input id="servicio-nombre" v-model.trim="formularioServicio.nombre" type="text" maxlength="100" required /></div><div class="campo-formulario"><label for="servicio-categoria">Categoría</label><select id="servicio-categoria" v-model="formularioServicio.categoria_id" required><option value="" disabled>Selecciona</option><option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">{{ categoria.nombre }}</option></select></div><div class="campo-formulario campo-formulario--completo"><label for="servicio-descripcion">Descripción</label><textarea id="servicio-descripcion" v-model.trim="formularioServicio.descripcion" rows="3" maxlength="500" required></textarea></div><div class="campo-formulario"><label for="servicio-precio">Precio desde</label><input id="servicio-precio" v-model="formularioServicio.precio_desde" type="number" min="0" step="0.01" required /></div><div class="campo-formulario"><label for="servicio-precio-hasta">Precio hasta</label><input id="servicio-precio-hasta" v-model="formularioServicio.precio_hasta" type="number" min="0" step="0.01" /></div><div class="campo-formulario"><label for="servicio-duracion">Duración en minutos</label><input id="servicio-duracion" v-model="formularioServicio.duracion_minutos" type="number" min="15" max="720" step="15" required /></div><div class="campo-formulario"><label for="servicio-orden">Orden</label><input id="servicio-orden" v-model="formularioServicio.orden" type="number" min="0" /></div><div class="campo-formulario campo-formulario--completo"><label for="servicio-incluye">Incluye, un elemento por línea</label><textarea id="servicio-incluye" v-model="formularioServicio.incluyeTexto" rows="4"></textarea></div><div class="campo-formulario campo-formulario--completo"><label for="servicio-imagen">Imagen JPG, PNG, WEBP o AVIF</label><input id="servicio-imagen" type="file" accept="image/jpeg,image/png,image/webp,image/avif" @change="archivoServicio = $event.target.files[0]" /></div><label class="campo-interruptor"><input v-model="formularioServicio.activo" type="checkbox" /><span>Mostrar servicio al público</span></label></div><button class="control control--principal" type="submit" :disabled="guardandoCatalogo">{{ guardandoCatalogo ? 'Guardando…' : 'Guardar servicio' }}</button></form>
  </div>

  <div v-if="editandoProducto" class="fondo-modal" @click.self="editandoProducto = false">
    <form class="tarjeta-modal tarjeta-modal--catalogo" @submit.prevent="guardarFormularioProducto"><button class="cerrar-modal" type="button" aria-label="Cerrar" @click="editandoProducto = false">×</button><p class="etiqueta-bloque"><span></span>{{ formularioProducto.id ? 'Editar producto' : 'Nuevo producto' }}</p><h2>Información de la tarjeta</h2><p v-if="errorCatalogo" class="mensaje-formulario mensaje-formulario--error">{{ errorCatalogo }}</p><div class="rejilla-formulario-admin"><div class="campo-formulario"><label for="producto-nombre">Nombre</label><input id="producto-nombre" v-model.trim="formularioProducto.nombre" type="text" maxlength="100" required /></div><div class="campo-formulario"><label for="producto-categoria">Categoría</label><input id="producto-categoria" v-model.trim="formularioProducto.categoria" type="text" maxlength="80" required /></div><div class="campo-formulario campo-formulario--completo"><label for="producto-descripcion">Descripción</label><textarea id="producto-descripcion" v-model.trim="formularioProducto.descripcion" rows="3" maxlength="500" required></textarea></div><div class="campo-formulario"><label for="producto-precio">Precio</label><input id="producto-precio" v-model="formularioProducto.precio" type="number" min="0" step="0.01" required /></div><div class="campo-formulario"><label for="producto-orden">Orden</label><input id="producto-orden" v-model="formularioProducto.orden" type="number" min="0" /></div><div class="campo-formulario campo-formulario--completo"><label for="producto-imagen">Imagen JPG, PNG, WEBP o AVIF</label><input id="producto-imagen" type="file" accept="image/jpeg,image/png,image/webp,image/avif" @change="archivoProducto = $event.target.files[0]" /></div><label class="campo-interruptor"><input v-model="formularioProducto.activo" type="checkbox" /><span>Mostrar producto al público</span></label></div><button class="control control--principal" type="submit" :disabled="guardandoCatalogo">{{ guardandoCatalogo ? 'Guardando…' : 'Guardar producto' }}</button></form>
  </div>
</template>
