import { createRouter, createWebHistory } from 'vue-router'
import { useSesion } from '../composables/useSesion'

const rutas = [
  { path: '/', name: 'inicio', component: () => import('../vistas/InicioVista.vue'), meta: { titulo: 'Inicio' } },
  { path: '/servicios', name: 'servicios', component: () => import('../vistas/ServiciosVista.vue'), meta: { titulo: 'Servicios' } },
  { path: '/servicios/:ruta', name: 'detalle-servicio', component: () => import('../vistas/DetalleServicioVista.vue'), meta: { titulo: 'Detalle del servicio' } },
  { path: '/productos', name: 'productos', component: () => import('../vistas/ProductosVista.vue'), meta: { titulo: 'Productos' } },
  { path: '/agendar', name: 'agendar', component: () => import('../vistas/AgendarVista.vue'), meta: { titulo: 'Agendar cita', requiereAutenticacion: true } },
  { path: '/contacto', name: 'contacto', component: () => import('../vistas/ContactoVista.vue'), meta: { titulo: 'Contacto' } },
  { path: '/acceso', name: 'acceso', component: () => import('../vistas/AccesoVista.vue'), meta: { titulo: 'Acceso' } },
  { path: '/registro', name: 'registro', component: () => import('../vistas/RegistroVista.vue'), meta: { titulo: 'Crear cuenta' } },
  { path: '/mi-cuenta', name: 'mi-cuenta', component: () => import('../vistas/MiCuentaVista.vue'), meta: { titulo: 'Mi cuenta', requiereAutenticacion: true } },
  {
    path: '/administracion',
    name: 'administracion',
    component: () => import('../vistas/AdministracionVista.vue'),
    meta: { titulo: 'Administración', requiereAdministrador: true },
  },
  { path: '/:rutaNoEncontrada(.*)*', name: 'no-encontrado', component: () => import('../vistas/NoEncontradoVista.vue'), meta: { titulo: 'Página no encontrada' } },
]

const enrutador = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: rutas,
  // Cada cambio de pagina comienza desde la parte superior.
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

enrutador.beforeEach((ruta) => {
  const sesion = useSesion()

  if ((ruta.meta.requiereAutenticacion || ruta.meta.requiereAdministrador) && !sesion.usuario) {
    return { name: 'acceso', query: { redireccion: ruta.fullPath } }
  }

  if (ruta.meta.requiereAdministrador && !sesion.esAdministrador) {
    return { name: 'mi-cuenta' }
  }

  if ((ruta.name === 'acceso' || ruta.name === 'registro') && sesion.usuario) {
    return { name: sesion.esAdministrador ? 'administracion' : 'mi-cuenta' }
  }
})

enrutador.afterEach((ruta) => {
  document.title = `${ruta.meta.titulo || 'LuxFer'} | LuxFer`
})

export default enrutador
