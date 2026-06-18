export type NotificationItem = {
  id: string
  userId: string
  proposalId: string | null
  conversationId: string | null
  type:
    | 'proposal_submitted'
    | 'proposal_status_changed'
    | 'proposal_comment_added'
    | 'proposal_resubmitted'
    | 'proposal_collaborator_added'
    | 'chat_message'
  title: string
  message: string
  createdAt: string
  readAt: string | null
}

type NotificationsResponse = {
  items: NotificationItem[]
}

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

function getNotificationsApiUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(/\/form-submissions\/?$/, '/notifications')
}

function getRequestHeaders() {
  if (!formSubmissionApiKey) {
    throw new Error('Chave de API de envio do formulário não configurada.')
  }

  return {
    Authorization: `Bearer ${formSubmissionApiKey}`,
  }
}

function getJsonRequestHeaders() {
  return {
    ...getRequestHeaders(),
    'Content-Type': 'application/json',
  }
}

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const url = new URL(getNotificationsApiUrl())
  url.searchParams.set('userId', userId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  const data = (await response.json().catch(() => null)) as NotificationsResponse | null

  if (!response.ok || !data) {
    throw new Error('Não foi possível carregar as notificações.')
  }

  return data.items
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  const response = await fetch(`${getNotificationsApiUrl()}/${notificationId}/read`, {
    method: 'PATCH',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    throw new Error('Não foi possível marcar a notificação como lida.')
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  const response = await fetch(`${getNotificationsApiUrl()}/read-all`, {
    method: 'PATCH',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    throw new Error('Não foi possível marcar todas as notificações como lidas.')
  }
}
