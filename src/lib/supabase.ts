import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. Copie .env.example para .env e preencha os valores.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Sessão de recovery é estabelecida manualmente em usePasswordRecoveryAccess
    // após validar o token da URL — evita login automático com link inválido/expirado.
    detectSessionInUrl: false,
  },
})
