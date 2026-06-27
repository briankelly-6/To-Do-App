import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env.local and set ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Supabase dashboard → Project Settings → API).',
  )
}

// The single Supabase client for the whole app.
//   persistSession + autoRefreshToken: the session is stored in localStorage and
//     refreshed automatically, so you stay logged in across browser restarts and
//     rarely have to re-authenticate (one magic-link login per device).
//   detectSessionInUrl: completes the magic-link redirect when you land back on the app.
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
