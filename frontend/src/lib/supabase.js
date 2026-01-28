import { createClient } from '@supabase/supabase-js'

// Client Supabase réutilisable pour le front - optionnel
let supabase = null

if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
  supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
}

export { supabase }

// Helper optionnel pour récupérer le token d'accès courant
export async function getAccessToken() {
  if (!supabase) {
    return null
  }
  try {
    const { data } = await supabase.auth.getSession()
    return data?.session?.access_token ?? null
  } catch (err) {
    return null
  }
}
