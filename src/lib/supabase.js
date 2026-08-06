import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn(
    'Supabase env vars are missing — copy .env.example to .env and fill in your project URL and anon key.'
  )
}

// fall back to a placeholder so a missing .env doesn't crash the whole
// site at import time — RPC calls will just fail (handled in the UI)
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder'
)
