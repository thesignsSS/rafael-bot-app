import type { ProposalDocumentKind } from '../types/proposal-detail'

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])

export function inferDocumentKind(fileName: string): ProposalDocumentKind {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXTENSIONS.has(extension) ? 'image' : 'pdf'
}

export function inferDocumentKindFromContent(
  contentType: string,
  fileName: string,
): ProposalDocumentKind {
  if (contentType.startsWith('image/')) {
    return 'image'
  }

  return inferDocumentKind(fileName)
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) {
    return `${(bytes / 1_048_576).toFixed(1)} MB`
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${bytes} B`
}

export function formatDocumentDate(isoDate: string): string {
  const date = new Date(isoDate)

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}

export function getDocumentIconStyles(kind: ProposalDocumentKind) {
  if (kind === 'pdf') {
    return {
      container: 'bg-red-50 text-red-600',
      icon: 'picture_as_pdf',
    } as const
  }

  return {
    container: 'bg-blue-50 text-blue-600',
    icon: 'image',
  } as const
}
