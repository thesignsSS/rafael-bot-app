export type AssistantRole = 'user' | 'assistant'

export type AssistantMessage = {
  id: string
  role: AssistantRole
  content: string
}

type AssistantChatResponse = {
  ok: boolean
  answer?: string
  blocked?: boolean
  error?: string
}

function resolveAssistantApiUrl() {
  const explicitUrl = import.meta.env.VITE_ASSISTANT_API_URL

  if (explicitUrl) {
    return explicitUrl
  }

  const formSubmissionUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL

  if (!formSubmissionUrl) {
    return ''
  }

  return formSubmissionUrl.replace('/api/form-submissions', '/api/assistant/chat')
}

const assistantApiUrl = resolveAssistantApiUrl()

export async function sendAssistantMessage(input: {
  message: string
  history: AssistantMessage[]
  routePath: string
  routeLabel: string
  userName?: string
}) {
  if (!assistantApiUrl) {
    throw new Error('Endpoint do assistente não configurado.')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (import.meta.env.VITE_FORM_SUBMISSION_API_KEY) {
    headers['x-api-key'] = import.meta.env.VITE_FORM_SUBMISSION_API_KEY
  }

  const response = await fetch(assistantApiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: input.message,
      routePath: input.routePath,
      routeLabel: input.routeLabel,
      userName: input.userName,
      history: input.history.slice(-6).map(({ role, content }) => ({
        role,
        content,
      })),
    }),
  })

  const payload = (await response.json()) as AssistantChatResponse

  if (!response.ok || !payload.ok || !payload.answer) {
    throw new Error(payload.error ?? 'Não foi possível responder agora.')
  }

  return {
    answer: payload.answer,
    blocked: payload.blocked ?? false,
  }
}
