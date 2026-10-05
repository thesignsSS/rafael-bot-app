import { botFetch } from './botApi'

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
    | 'proposal_invitation_received'
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

function getNotificationsApiUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(/\/form-submissions\/?$/, '/notifications')
}

function getJsonRequestHeaders() {
  return {
    'Content-Type': 'application/json',
  }
}

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const url = new URL(getNotificationsApiUrl())
  url.searchParams.set('userId', userId)

  const response = await botFetch(url.toString())

  const data = (await response.json().catch(() => null)) as NotificationsResponse | null

  if (!response.ok || !data) {
    throw new Error('Não foi possível carregar as notificações.')
  }

  return data.items
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  const response = await botFetch(`${getNotificationsApiUrl()}/${notificationId}/read`, {
    method: 'PATCH',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    throw new Error('Não foi possível marcar a notificação como lida.')
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  const response = await botFetch(`${getNotificationsApiUrl()}/read-all`, {
    method: 'PATCH',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    throw new Error('Não foi possível marcar todas as notificações como lidas.')
  }
}
