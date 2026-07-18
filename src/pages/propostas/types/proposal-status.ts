export const PROPOSAL_STATUSES = [
  'em_analise',
  'pendente',
  'condicionado',
  'reprovado',
  'aprovado',
  'validacao_renda',
  'renda_validada',
  'renda_nao_validada',
  'engenharia',
  'formularios',
  'aguardando_reserva',
  'conformidade',
  'agendamento_agencia',
  'itbi',
  'assinatura_contrato',
  'registro',
  'finalizado',
] as const

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number]

export type ProposalStatusOption = {
  value: ProposalStatus
  label: string
}

export const DEFAULT_PROPOSAL_STATUS: ProposalStatus = 'em_analise'

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  em_analise: 'Em análise',
  pendente: 'Pendente',
  condicionado: 'Condicionado',
  reprovado: 'Reprovado',
  aprovado: 'Aprovado',
  validacao_renda: 'Validação de Renda',
  renda_validada: 'Renda Validada',
  renda_nao_validada: 'Renda Não Validada',
  engenharia: 'Engenharia',
  formularios: 'Formulários',
  aguardando_reserva: 'Aguardando Reserva',
  conformidade: 'Conformidade',
  agendamento_agencia: 'Agendamento na Agência',
  itbi: 'ITBI',
  assinatura_contrato: 'Assinatura de Contrato',
  registro: 'Registro',
  finalizado: 'Finalizado',
}

export const DEFAULT_PROPOSAL_STATUS_OPTIONS: ProposalStatusOption[] =
  PROPOSAL_STATUSES.map((status) => ({
    value: status,
    label: PROPOSAL_STATUS_LABELS[status],
  }))

export function normalizeProposalStatus(status: unknown): ProposalStatus {
  if (
    status === 'em_analise' ||
    status === 'em analise' ||
    status === 'em análise' ||
    status === 'em_andamento'
  ) {
    return 'em_analise'
  }

  if (status === 'pendente' || status === 'pending') {
    return 'pendente'
  }

  if (status === 'condicionado' || status === 'conditioned') {
    return 'condicionado'
  }

  if (
    status === 'reprovado' ||
    status === 'reprovada' ||
    status === 'rejeitada' ||
    status === 'rejeitado' ||
    status === 'rejected'
  ) {
    return 'reprovado'
  }

  if (
    status === 'aprovado' ||
    status === 'aprovada' ||
    status === 'approved'
  ) {
    return 'aprovado'
  }

  if (
    status === 'validacao_renda' ||
    status === 'validacao de renda' ||
    status === 'validação de renda'
  ) {
    return 'validacao_renda'
  }

  if (
    status === 'renda_validada' ||
    status === 'renda validada'
  ) {
    return 'renda_validada'
  }

  if (
    status === 'renda_nao_validada' ||
    status === 'renda nao validada' ||
    status === 'renda não validada'
  ) {
    return 'renda_nao_validada'
  }

  if (status === 'engenharia') {
    return 'engenharia'
  }

  if (
    status === 'formularios' ||
    status === 'formulários' ||
    status === 'formulario' ||
    status === 'formulário'
  ) {
    return 'formularios'
  }

  if (
    status === 'aguardando_reserva' ||
    status === 'aguardando reserva'
  ) {
    return 'aguardando_reserva'
  }

  if (status === 'conformidade') {
    return 'conformidade'
  }

  if (
    status === 'agendamento_agencia' ||
    status === 'agendamento agencia' ||
    status === 'agendamento na agência' ||
    status === 'agendamento na agencia'
  ) {
    return 'agendamento_agencia'
  }

  if (status === 'itbi') {
    return 'itbi'
  }

  if (
    status === 'assinatura_contrato' ||
    status === 'assinatura contrato' ||
    status === 'assinatura de contrato'
  ) {
    return 'assinatura_contrato'
  }

  if (status === 'registro') {
    return 'registro'
  }

  if (
    status === 'finalizado' ||
    status === 'finalizada'
  ) {
    return 'finalizado'
  }

  return DEFAULT_PROPOSAL_STATUS
}

export function getProposalStatusLabel(status: ProposalStatus) {
  return PROPOSAL_STATUS_LABELS[status]
}

export function isBrokerReadOnlyProposalStatus(status: ProposalStatus) {
  return (
    status === 'aprovado' ||
    status === 'validacao_renda' ||
    status === 'renda_validada' ||
    status === 'renda_nao_validada' ||
    status === 'engenharia' ||
    status === 'formularios' ||
    status === 'aguardando_reserva' ||
    status === 'conformidade' ||
    status === 'agendamento_agencia' ||
    status === 'itbi' ||
    status === 'assinatura_contrato' ||
    status === 'registro' ||
    status === 'finalizado'
  )
}

export function normalizeProposalStatusOptions(
  options: unknown,
): ProposalStatusOption[] {
  const rawOptions = getRawStatusOptions(options)
  const normalizedOptions = rawOptions
    .map((option) => {
      if (typeof option === 'string') {
        const value = normalizeProposalStatus(option)

        return {
          value,
          label: getProposalStatusLabel(value),
        }
      }

      if (!option || typeof option !== 'object') {
        return null
      }

      const record = option as Record<string, unknown>
      const rawValue = record.value ?? record.status ?? record.id ?? record.slug
      const value = normalizeProposalStatus(rawValue)
      const label = typeof record.label === 'string' ? record.label : undefined

      return {
        value,
        label: label?.trim() || getProposalStatusLabel(value),
      }
    })
    .filter((option): option is ProposalStatusOption => option !== null)

  const uniqueOptions = normalizedOptions.filter(
    (option, index, list) =>
      list.findIndex((item) => item.value === option.value) === index,
  )

  return uniqueOptions.length > 0 ? uniqueOptions : DEFAULT_PROPOSAL_STATUS_OPTIONS
}

function getRawStatusOptions(options: unknown): unknown[] {
  if (Array.isArray(options)) {
    return options
  }

  if (!options || typeof options !== 'object') {
    return []
  }

  const record = options as Record<string, unknown>

  if (Array.isArray(record.items)) {
    return record.items
  }

  if (Array.isArray(record.statuses)) {
    return record.statuses
  }

  return []
}
