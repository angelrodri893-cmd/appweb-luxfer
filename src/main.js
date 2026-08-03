import { createApp } from 'vue'
import './style.css'
import './paginas.css'
import Sitio from './App.vue'
import enrutador from './enrutador'

// Inicia el sitio de Vue dentro del contenedor principal de index.html.
createApp(Sitio).use(enrutador).mount('#app')
