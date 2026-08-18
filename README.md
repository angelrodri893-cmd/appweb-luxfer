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
```

## Despliegue definitivo en Vercel

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
