export type ChatDirectoryUser = {
  id: string
  fullName: string
  role: 'admin' | 'broker'
  isAdmin: boolean
}

export type ChatConversationSummary = {
  id: string
  counterpart: ChatDirectoryUser
  lastMessage: string | null
  lastMessageAt: string | null
  lastMessageSenderId: string | null
  unreadCount: number
}

export type ChatMessageItem = {
  id: string
  conversationId: string
  senderUserId: string
  senderName: string
  content: string
  createdAt: string
}

type ChatUsersResponse = {
  items: ChatDirectoryUser[]
}

type ChatConversationsResponse = {
  items: ChatConversationSummary[]
}

type ChatMessagesResponse = {
  conversation: ChatConversationSummary
  items: ChatMessageItem[]
}

type OpenDirectConversationResponse = {
  item: ChatConversationSummary
}

type SendChatMessageResponse = {
  conversation: ChatConversationSummary
  message: ChatMessageItem
}

export type ChatSocketEvent =
  | {
      type: 'chat_message'
      conversation: ChatConversationSummary
      message: ChatMessageItem
    }
  | {
      type: 'chat_typing'
      conversationId: string
      userId: string
      isTyping: boolean
    }
  | {
      type: 'notification_created'
      notification: {
        id: string
        userId: string
        proposalId: string | null
        conversationId: string | null
        type: 'chat_message'
        title: string
        message: string
        createdAt: string
        readAt: string | null
      }
    }

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

export const CHAT_OPEN_EVENT = 'effectus:open-chat'
export const CHAT_NOTIFICATION_EVENT = 'effectus:notification-created'

function getChatApiUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(/\/form-submissions\/?$/, '/chat')
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

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const data = (await response.json().catch(() => null)) as T | { error?: string } | null

  if (!response.ok || !data) {
    throw new Error(
      data && typeof data === 'object' && 'error' in data && data.error
        ? data.error
        : fallbackMessage,
    )
  }

  return data as T
}

export async function fetchChatUsers(userId: string) {
  const url = new URL(`${getChatApiUrl()}/users`)
  url.searchParams.set('userId', userId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  const data = await parseJsonResponse<ChatUsersResponse>(
    response,
    'Não foi possível carregar os usuários do chat.',
  )

  return data.items
}

export async function fetchChatConversations(userId: string) {
  const url = new URL(`${getChatApiUrl()}/conversations`)
  url.searchParams.set('userId', userId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  const data = await parseJsonResponse<ChatConversationsResponse>(
    response,
    'Não foi possível carregar as conversas.',
  )

  return data.items
}

export async function openDirectChatConversation(userId: string, targetUserId: string) {
  const response = await fetch(`${getChatApiUrl()}/conversations/direct`, {
    method: 'POST',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ userId, targetUserId }),
  })

  const data = await parseJsonResponse<OpenDirectConversationResponse>(
    response,
    'Não foi possível abrir a conversa.',
  )

  return data.item
}

export async function fetchChatMessages(userId: string, conversationId: string) {
  const url = new URL(`${getChatApiUrl()}/conversations/${conversationId}/messages`)
  url.searchParams.set('userId', userId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  return parseJsonResponse<ChatMessagesResponse>(
    response,
    'Não foi possível carregar as mensagens.',
  )
}

export async function markChatConversationAsRead(userId: string, conversationId: string) {
  const response = await fetch(`${getChatApiUrl()}/conversations/${conversationId}/read`, {
    method: 'PATCH',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    throw new Error('Não foi possível marcar a conversa como lida.')
  }
}

export async function sendChatMessage(
  userId: string,
  recipientUserId: string,
  content: string,
) {
  const response = await fetch(`${getChatApiUrl()}/messages`, {
    method: 'POST',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ userId, recipientUserId, content }),
  })

  return parseJsonResponse<SendChatMessageResponse>(
    response,
    'Não foi possível enviar a mensagem.',
  )
}

export function resolveChatWebSocketUrl(userId: string) {
  if (!formSubmissionApiUrl || !formSubmissionApiKey) {
    throw new Error('Chat em tempo real não configurado.')
  }

  const apiUrl = new URL(formSubmissionApiUrl)
  const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = new URL('/ws/chat', `${protocol}//${apiUrl.host}`)
  wsUrl.searchParams.set('userId', userId)
  wsUrl.searchParams.set('apiKey', formSubmissionApiKey)
  return wsUrl.toString()
}
