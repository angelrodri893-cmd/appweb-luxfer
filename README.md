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

El frontend utiliza únicamente la clave pública de Supabase. Nunca agregues una clave `service_role` a los archivos de Vue o a variables que comiencen con `VITE_`.
