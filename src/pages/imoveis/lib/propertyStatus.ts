import type { PropertyStatus } from '../types'

/** Uma cor por situação, no estilo do mapa de status das propostas; o texto sempre aparece (6.4). */
export const PROPERTY_STATUS_TONE: Record<PropertyStatus, string> = {
  disponivel: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  em_negociacao: 'border-sky-200 bg-sky-50 text-sky-800',
  reservado: 'border-amber-200 bg-amber-50 text-amber-800',
  em_proposta: 'border-primary/30 bg-primary-fixed text-on-primary-fixed',
  vendido: 'border-slate-300 bg-slate-100 text-slate-800',
  inativo: 'border-outline-variant bg-surface-container text-on-surface-variant',
}

export const PROPERTY_STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em_negociacao', label: 'Em negociação' },
  { value: 'reservado', label: 'Reservado' },
  { value: 'em_proposta', label: 'Em proposta' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'inativo', label: 'Inativo' },
]
