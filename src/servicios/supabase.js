import { createClient } from '@supabase/supabase-js'

const urlSupabase = import.meta.env.VITE_SUPABASE_URL
const clavePublicaSupabase = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!urlSupabase || !clavePublicaSupabase) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en el archivo .env.local.',
  )
}

export const supabase = createClient(urlSupabase, clavePublicaSupabase, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
