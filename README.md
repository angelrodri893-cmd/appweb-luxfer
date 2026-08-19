<h1 align="center">LuxFer</h1>

<p align="center">
  Sistema web para la gestión de servicios, productos y citas de un centro de estética.
</p>

<p align="center">
  <a href="https://lux-fer.online">
    <img src="https://img.shields.io/badge/Ver_sitio-lux--fer.online-bd637d?style=for-the-badge" alt="Sitio web">
  </a>
  <img src="https://img.shields.io/badge/Vue.js-3.5-42b883?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue.js">
  <img src="https://img.shields.io/badge/Supabase-Backend-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
</p>

## Descripción

LuxFer es una aplicación web responsiva que permite consultar servicios y productos, registrarse y solicitar citas. También incluye un panel administrativo para gestionar la agenda, los horarios y el catálogo del centro de estética.

### Sitio publicado

[https://lux-fer.online](https://lux-fer.online)

## Funcionalidades

- Catálogo de servicios con categorías, precios y duración.
- Consulta de productos mediante WhatsApp.
- Registro y autenticación por correo electrónico.
- Solicitud, reprogramación y cancelación de citas.
- Consulta de horarios disponibles.
- Panel administrativo protegido por roles.
- Gestión de agenda, servicios, productos y bloqueos.
- Carga y optimización de imágenes.
- Diseño adaptable a computadoras y dispositivos móviles.

## Tecnologías

- Vue 3
- Vue Router
- Vite
- JavaScript y CSS
- Supabase Auth
- PostgreSQL
- Supabase Storage
- Hostinger

## Instalación local

```bash
git clone https://github.com/angelrodri893-cmd/appweb-luxfer.git
cd appweb-luxfer
npm ci
```

Crea un archivo `.env.local`:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
```

Inicia el proyecto:

```bash
npm run dev
```

## Migraciones

Ejecuta los archivos de `supabase/migrations` desde el SQL Editor de Supabase, respetando el orden indicado en sus nombres.

## Verificación

```bash
npm test
npm run build
npm audit
```

## Despliegue

La aplicación se compila con Vite y se publica como sitio estático en Hostinger. Supabase gestiona la autenticación, la base de datos y el almacenamiento de imágenes.

```bash
npm run build
```

El contenido generado en `dist` debe colocarse directamente dentro de `public_html`.

## Seguridad

- No publiques `.env.local`.
- Utiliza solamente la clave pública de Supabase en variables `VITE_`.
- Nunca incluyas una clave `service_role` en el frontend.
- No compartas credenciales administrativas o SMTP.

## Contribuidores

- [angelrodri893-cmd](https://github.com/angelrodri893-cmd)
- [lll0906](https://github.com/lll0906)
