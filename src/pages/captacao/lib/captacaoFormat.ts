import type { CampaignStatus, LeadStatus } from './captacaoApi'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function formatCents(cents: number) {
  return brl.format(cents / 100)
}

/** Digitação estilo caixa eletrônico: só dígitos, os dois últimos são centavos. */
export function centsFromTyping(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  return digits ? Number(digits) : 0
}

export function formatDate(iso: string | null) {
  return iso ? date.format(new Date(iso)) : '—'
}

export function formatDateTime(iso: string | null) {
  return iso ? dateTime.format(new Date(iso)) : '—'
}

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  creating: 'Criando',
  active: 'No ar',
  paused: 'Pausada',
  completed: 'Encerrada',
  failed: 'Falhou',
}

export const CAMPAIGN_STATUS_CLASS: Record<CampaignStatus, string> = {
  creating: 'border-primary/30 bg-primary/10 text-primary',
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
  paused: 'border-amber-500/30 bg-amber-500/10 text-amber-600',
  completed: 'border-outline-variant bg-surface-container text-on-surface-variant',
  failed: 'border-error/30 bg-error/10 text-error',
}

export const LEAD_STATUS_OPTIONS: Array<{ value: LeadStatus; label: string }> = [
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'qualified', label: 'Qualificado' },
  { value: 'discarded', label: 'Descartado' },
]

export function whatsappUrl(phone: string | null) {
  const digits = phone?.replace(/\D/g, '') ?? ''
  if (digits.length < 10) return null
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`
}
