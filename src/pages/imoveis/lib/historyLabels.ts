import { formatReais } from '../../../lib/money'
import type { PropertyHistoryItem } from './propertiesApi'
import { PROPERTY_STATUS_OPTIONS } from './propertyStatus'
import { PROPERTY_TYPE_OPTIONS } from '../types'

const statusLabel = (value: unknown) => PROPERTY_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? String(value)
const typeLabel = (value: unknown) => PROPERTY_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? String(value)

/** Texto de cada evento do histórico (10.9), no formato "Disponível → Reservado". */
export function describeEvent(event: PropertyHistoryItem): string {
  const data = event.data

  switch (event.kind) {
    case 'created':
      return 'Imóvel cadastrado'
    case 'updated':
      return 'Dados alterados'
    case 'status_changed':
      return `Situação: ${statusLabel(data.from)} → ${statusLabel(data.to)}`
    case 'price_changed':
      return `Valor de venda: ${formatReais(Number(data.from))} → ${formatReais(Number(data.to))}`
    case 'type_corrected':
      return `Tipo corrigido: ${typeLabel(data.from)} → ${typeLabel(data.to)}`
    case 'photo_added':
      return `Foto incluída: ${String(data.name ?? '')}`
    case 'photo_removed':
      return `Foto removida: ${String(data.name ?? '')}`
    case 'cover_changed':
      return `Nova capa: ${String(data.name ?? '')}`
    case 'transferred':
      return 'Imóvel transferido para outro corretor'
  }
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}
