import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

function firstDefined(...values) {
  return values.find((value) => value && value.trim()) ?? ''
}

function envValue(env, key) {
  return env[key] ?? process.env[key]
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = firstDefined(
    envValue(env, 'VITE_SUPABASE_URL'),
    envValue(env, 'NEXT_PUBLIC_SUPABASE_URL'),
    envValue(env, 'SUPABASE_URL')
  )
  const supabaseAnonKey = firstDefined(
    envValue(env, 'VITE_SUPABASE_ANON_KEY'),
    envValue(env, 'VITE_SUPABASE_PUBLISHABLE_KEY'),
    envValue(env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    envValue(env, 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    envValue(env, 'SUPABASE_ANON_KEY'),
    envValue(env, 'SUPABASE_PUBLISHABLE_KEY')
  )

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY':
        JSON.stringify(supabaseAnonKey),
    },
  }
})
