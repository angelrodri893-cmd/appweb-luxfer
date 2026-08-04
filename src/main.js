import { createApp } from 'vue'
import './style.css'
import './paginas.css'
import Sitio from './App.vue'
import enrutador from './enrutador'
import { inicializarSesion } from './composables/useSesion'

// Inicia el sitio de Vue dentro del contenedor principal de index.html.
await inicializarSesion()
createApp(Sitio).use(enrutador).mount('#app')
