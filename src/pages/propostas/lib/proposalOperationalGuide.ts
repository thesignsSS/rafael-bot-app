import type { ProposalComment, ProposalDetail } from '../types/proposal-detail'
import { getProposalStatusLabel, type ProposalStatus } from '../types/proposal-status'

export type ProposalOperationalTaskStatus = 'pendente' | 'em_andamento' | 'concluido'

export type ProposalOperationalTask = {
  id: string
  title: string
  detail?: string
  status: ProposalOperationalTaskStatus
}

export type ProposalOperationalGuide = {
  headline: string
  summary: string
  recommendedPrompt: string
  nextStepLabel: string
  statusLabel: string
  tasks: ProposalOperationalTask[]
}

type BuildOperationalGuideInput = {
  proposal: ProposalDetail
  normalizedStatus: ProposalStatus
  hasPendingUpdates: boolean
  pendingDocumentsCount: number
  hasDraftComment: boolean
  isEditing: boolean
}

const MAX_TASKS = 4

export function buildProposalOperationalGuide(
  input: BuildOperationalGuideInput,
): ProposalOperationalGuide {
  const { proposal, normalizedStatus } = input
  const statusLabel = getProposalStatusLabel(normalizedStatus)
  const pendingTasks =
    normalizedStatus === 'pendente'
      ? buildPendingTasks(proposal, input)
      : buildDefaultTasks(proposal, input)

  if (normalizedStatus === 'pendente') {
    return {
      headline: 'Pendências guiadas',
      summary: buildPendingSummary(proposal, input),
      recommendedPrompt:
        'Me resume as pendências desta proposta e me diga a ordem mais eficiente para resolver.',
      nextStepLabel: input.pendingDocumentsCount > 0
        ? 'Conferir documentos pendentes antes do reenvio'
        : input.hasPendingUpdates || input.hasDraftComment
          ? 'Registrar retorno final e reenviar para análise'
          : 'Ler a pendência e iniciar os ajustes solicitados',
      statusLabel,
      tasks: pendingTasks,
    }
  }

  return {
    headline: 'Assistente operacional',
    summary:
      normalizedStatus === 'em_analise'
        ? 'A proposta está em análise. Vale acompanhar comentários e manter os documentos organizados para evitar retrabalho.'
        : `A proposta está com status ${statusLabel.toLowerCase()}. O assistente pode resumir o histórico e orientar o próximo contato com o corretor ou cliente.`,
    recommendedPrompt:
      normalizedStatus === 'em_analise'
        ? 'Me faça um resumo operacional desta proposta e me diga o que acompanhar agora.'
        : 'Me faça um resumo operacional desta proposta e destaque o próximo passo mais importante.',
    nextStepLabel:
      normalizedStatus === 'em_analise'
        ? 'Acompanhar a análise e responder rápido se surgir nova pendência'
        : `Revisar o histórico da proposta em ${statusLabel.toLowerCase()}`,
    statusLabel,
    tasks: pendingTasks,
  }
}

export function buildProposalAssistantContext(input: {
  proposal: ProposalDetail
  normalizedStatus: ProposalStatus
  guide: ProposalOperationalGuide
}) {
  const { proposal, normalizedStatus, guide } = input
  const latestComment = proposal.comments[proposal.comments.length - 1] ?? null

  return {
    proposalId: proposal.id,
    proposalCode: proposal.proposalCode,
    status: normalizedStatus,
    statusLabel: guide.statusLabel,
    brokerName: proposal.brokerName,
    clientName: proposal.client.name,
    propertyCity: proposal.property.city,
    pendingReason: proposal.pendingReason,
    nextStepLabel: guide.nextStepLabel,
    tasks: guide.tasks.map((task) => ({
      title: task.title,
      detail: task.detail ?? '',
      status: task.status,
    })),
    latestComment: latestComment
      ? {
          authorName: latestComment.authorName,
          authorRole: latestComment.authorRole,
          message: latestComment.message,
          createdAt: latestComment.createdAt,
          type: latestComment.type,
        }
      : null,
  }
}

function buildPendingSummary(
  proposal: ProposalDetail,
  input: BuildOperationalGuideInput,
) {
  const tasks = extractPendingTaskTexts(proposal)

  if (input.pendingDocumentsCount > 0) {
    return `${tasks.length > 0 ? tasks[0] : 'Existe uma pendência ativa nesta proposta.'} Você já separou ${input.pendingDocumentsCount} ${input.pendingDocumentsCount === 1 ? 'arquivo' : 'arquivos'} para responder.`
  }

  if (input.hasPendingUpdates || input.hasDraftComment) {
    return `${tasks.length > 0 ? tasks[0] : 'Existe uma pendência ativa nesta proposta.'} Você já iniciou a tratativa e pode preparar o reenvio para análise.`
  }

  return tasks.length > 0
    ? tasks[0]
    : 'Existe uma pendência ativa. Revise o motivo informado e responda só o que for necessário para a análise seguir sem ruído.'
}

function buildPendingTasks(
  proposal: ProposalDetail,
  input: BuildOperationalGuideInput,
): ProposalOperationalTask[] {
  const items = extractPendingTaskTexts(proposal)
  const tasks = items.slice(0, MAX_TASKS).map((item, index) => ({
    id: `pending-${index + 1}`,
    title: item,
    status: resolvePendingTaskStatus(index, input),
  }))

  if (tasks.length === 0) {
    tasks.push({
      id: 'pending-review',
      title: 'Revisar a solicitação do analista e ajustar a proposta',
      status: input.hasPendingUpdates || input.hasDraftComment ? 'em_andamento' : 'pendente',
    })
  }

  if (input.pendingDocumentsCount > 0) {
    tasks.push({
      id: 'pending-documents',
      title:
        input.pendingDocumentsCount === 1
          ? 'Anexar o documento separado para esta pendência'
          : `Anexar os ${input.pendingDocumentsCount} documentos separados para esta pendência`,
      status: 'em_andamento',
    })
  }

  if (input.hasDraftComment) {
    tasks.push({
      id: 'pending-comment',
      title: 'Registrar um comentário explicando o que foi ajustado',
      status: 'em_andamento',
    })
  }

  return dedupeTasks(tasks).slice(0, MAX_TASKS)
}

function buildDefaultTasks(
  proposal: ProposalDetail,
  input: BuildOperationalGuideInput,
): ProposalOperationalTask[] {
  const tasks: ProposalOperationalTask[] = [
    {
      id: 'default-status',
      title: `Confirmar se o status atual continua correto: ${getProposalStatusLabel(input.normalizedStatus)}`,
      status: 'pendente',
    },
    {
      id: 'default-documents',
      title:
        proposal.documents.length > 0
          ? `Documentos enviados: ${proposal.documents.length}. Conferir se os principais arquivos já estão completos`
          : 'Ainda não há documentos enviados. Validar se precisa complementar a proposta',
      status: proposal.documents.length > 0 ? 'em_andamento' : 'pendente',
    },
  ]

  if (input.isEditing) {
    tasks.unshift({
      id: 'default-editing',
      title: 'Você está editando a proposta. Finalize os ajustes antes de seguir',
      status: 'em_andamento',
    })
  }

  const latestComment = proposal.comments[proposal.comments.length - 1]

  if (latestComment) {
    tasks.push({
      id: 'default-comment',
      title: `Última movimentação: ${resolveLatestCommentLabel(latestComment)}`,
      detail: latestComment.message,
      status: 'pendente',
    })
  }

  return tasks.slice(0, 3)
}

function extractPendingTaskTexts(proposal: ProposalDetail) {
  const latestPendingComment = [...proposal.comments]
    .reverse()
    .find((comment) => comment.type === 'pending_reason')

  const sources = [proposal.pendingReason, latestPendingComment?.message ?? '']

  const segments = sources
    .flatMap((source) => splitIntoTaskSegments(source))
    .map((segment) => normalizeTaskLabel(segment))
    .filter(Boolean)

  return Array.from(new Set(segments))
}

function splitIntoTaskSegments(value: string) {
  return value
    .split(/\n|(?:\r\n)|[;]|(?:\.\s+)/g)
    .flatMap((segment) => segment.split(/(?:^|\s)[-•]\s+/g))
    .map((segment) => segment.trim())
    .filter((segment) => segment.length >= 6)
}

function normalizeTaskLabel(value: string) {
  return value
    .replace(/^[0-9]+[\.\)\-]\s*/, '')
    .replace(/^pend[êe]ncia[:\s-]*/i, '')
    .replace(/^motivo[:\s-]*/i, '')
    .trim()
}

function resolvePendingTaskStatus(
  index: number,
  input: BuildOperationalGuideInput,
): ProposalOperationalTaskStatus {
  if (!input.hasPendingUpdates && !input.hasDraftComment && input.pendingDocumentsCount === 0) {
    return 'pendente'
  }

  if (index === 0 || input.isEditing || input.hasDraftComment) {
    return 'em_andamento'
  }

  return 'pendente'
}

function dedupeTasks(tasks: ProposalOperationalTask[]) {
  return tasks.filter(
    (task, index, current) =>
      current.findIndex((item) => item.title.toLowerCase() === task.title.toLowerCase()) === index,
  )
}

function resolveLatestCommentLabel(comment: ProposalComment) {
  if (comment.type === 'pending_reason') {
    return 'pendência registrada pelo analista'
  }

  if (comment.type === 'resubmission') {
    return 'proposta reenviada para análise'
  }

  return 'comentário operacional registrado'
}
