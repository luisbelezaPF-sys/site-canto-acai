import { createBrowserClient } from '@supabase/ssr'

// Fallback seguro para evitar erros de build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Cliente singleton para uso direto
export const supabase = createClient()
