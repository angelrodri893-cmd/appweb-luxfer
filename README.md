# LuxFer

Aplicación web en Vue para consultar servicios y productos, solicitar citas y administrar la agenda del centro de estética LuxFer.

## Preparación local

1. Instala las dependencias:

   ```powershell
   npm install
   ```

2. Crea `.env.local` en la raíz del proyecto:

   ```env
   VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
   ```

3. Ejecuta en Supabase SQL Editor las migraciones en este orden:

   - `supabase/migrations/20260803_esquema_inicial_luxfer.sql`
   - `supabase/migrations/20260803_02_catalogo_dashboard_validaciones.sql`
   - `supabase/migrations/20260818_03_corregir_contenido_catalogos.sql`

   La tercera migración incluye consultas comentadas de previsualización y verificación. Ejecútalas antes y después para confirmar que solo se corrigieron los textos conocidos.

4. En Authentication > URL Configuration agrega `http://localhost:5173/acceso` a las direcciones permitidas.

5. Inicia el proyecto:

   ```powershell
   npm run dev
   ```

La cuenta `info.luxferr@gmail.com` recibe el rol de administradora al registrarse. Debe confirmar el correo antes de ingresar.

## Verificación

```powershell
npm test
npm run build
npm audit
git diff --check
```

## Despliegue manual en Hostinger Premium

Hostinger publicará únicamente el frontend compilado. Supabase seguirá gestionando autenticación, base de datos y almacenamiento de imágenes.

### 1. Preparar la compilación

1. Comprueba que `.env.local` contenga únicamente las variables públicas:

   ```env
   VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
   ```

2. Instala exactamente las dependencias del archivo de bloqueo y valida el proyecto:

   ```powershell
   npm ci
   npm test
   npm run build
   npm audit
   ```

3. Confirma que `dist` contenga `index.html`, la carpeta `assets` y `.htaccess`. Vite copia automáticamente `.htaccess` desde `public`.

4. Genera el archivo de entrega desde el contenido de `dist`, no desde la carpeta del código fuente:

   ```powershell
   Compress-Archive -Path .\dist\* -DestinationPath .\luxfer-hostinger.zip -Force
   ```

El ZIP no debe contener `.env.local`, `src`, `node_modules`, `supabase` ni archivos del repositorio.

### 2. Cargar el sitio

1. En hPanel abre **Sitios web > Administrar > Administrador de archivos**.
2. Entra en `public_html`. Conserva una copia de cualquier contenido anterior antes de reemplazarlo.
3. Sube `luxfer-hostinger.zip` dentro de `public_html` y extráelo ahí.
4. Verifica que `public_html/index.html`, `public_html/assets/` y `public_html/.htaccess` queden directamente en la raíz; no deben quedar dentro de una carpeta `dist`.
5. Activa el certificado SSL del dominio y fuerza HTTPS desde hPanel.

El archivo `.htaccess` evita errores 404 al actualizar rutas como `/servicios/soft-gel`, `/mi-cuenta` o `/administracion`. También desactiva el listado de directorios y configura caché para los archivos versionados de Vite.

### 3. Configurar Supabase Auth

En **Authentication > URL Configuration** configura:

- Site URL: `https://TU_DOMINIO`
- Redirect URL de producción: `https://TU_DOMINIO/acceso`
- Redirect URL local: `http://localhost:5173/acceso`

Si el dominio utiliza `www`, agrega también la variante que realmente redirija o se publique. Nunca coloques una clave `service_role` en `.env.local`, en Hostinger ni en variables que empiecen por `VITE_`.

### 4. Pruebas posteriores a la publicación

- Abre Inicio, Servicios, un detalle, Productos, Contacto, Acceso y Registro.
- Actualiza manualmente una ruta interior para verificar el fallback SPA.
- Prueba el menú móvil, teléfono, correo y enlaces de WhatsApp.
- Inicia sesión como cliente y administradora sin compartir contraseñas.
- Verifica una solicitud de cita, reprogramación, cancelación, agenda, bloqueos y edición de catálogo usando registros claramente identificados como prueba.
- Revisa que no existan errores en la consola del navegador.

Mantén temporalmente el despliegue de Vercel hasta completar estas pruebas con el dominio definitivo. Después del cambio de dominio, conserva una copia del ZIP publicado y de la configuración de Supabase.

## Despliegue temporal en Vercel

1. Importa el repositorio de la aplicación. Si Vercel está conectado al repositorio superior, configura **Root Directory** como `app-web-luxfer`; si el repositorio importado ya es la aplicación, conserva `.`.
2. Confirma estos valores del proyecto:

   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. En **Settings > Environment Variables** agrega por separado para `Production` y `Preview`:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

4. En Supabase, abre **Authentication > URL Configuration** y configura:

   - Site URL: `https://TU_DOMINIO_DE_PRODUCCION`
   - Redirect URL de producción: `https://TU_DOMINIO_DE_PRODUCCION/acceso`
   - Redirect URL local: `http://localhost:5173/acceso`
   - Para despliegues Preview opcionales: `https://*-TU_USUARIO_O_EQUIPO.vercel.app/**`

5. Ejecuta un nuevo despliegue después de cambiar variables o direcciones permitidas.

El archivo `vercel.json` reescribe las rutas internas hacia `index.html`. De esta manera, al actualizar manualmente `/administracion`, `/mi-cuenta`, `/servicios/...` u otra ruta, Vue Router recibe la URL y evita el error `404: NOT_FOUND` de Vercel.

El frontend utiliza únicamente la clave pública de Supabase. Nunca agregues una clave `service_role` a los archivos de Vue o a variables que comiencen con `VITE_`.
