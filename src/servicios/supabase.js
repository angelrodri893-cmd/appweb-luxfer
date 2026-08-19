import { createClient } from '@supabase/supabase-js'

const urlSupabase = import.meta.env.VITE_SUPABASE_URL
const clavePublicaSupabase = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!urlSupabase || !clavePublicaSupabase) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY. Configúralas en .env.local antes de compilar el sitio.',
  )
}

export const supabase = createClient(urlSupabase, clavePublicaSupabase, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
