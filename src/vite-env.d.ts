/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_FORM_SUBMISSION_API_URL?: string
  readonly VITE_FORM_SUBMISSION_API_KEY?: string
  readonly VITE_CORE_API_URL?: string
  readonly VITE_DOMINIO_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
