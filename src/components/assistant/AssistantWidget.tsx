import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { sendAssistantMessage, type AssistantMessage } from '../../lib/assistant'
import { Icon } from '../ui/Icon'

const QUICK_PROMPTS = [
  'Como funciona o envio de uma proposta?',
  'O que significa proposta pendente?',
  'Quais documentos eu preciso enviar?',
]

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Nova Proposta',
  '/login': 'Login',
  '/cadastro': 'Cadastro',
  '/recuperar-senha': 'Recuperar senha',
  '/propostas': 'Propostas',
}

function resolveRouteLabel(pathname: string) {
  if (pathname.startsWith('/propostas/')) {
    return 'Detalhes da proposta'
  }

  return ROUTE_LABELS[pathname] ?? 'Effectus'
}

function getFirstName(fullName?: string | null) {
  if (!fullName) {
    return ''
  }

  return fullName.trim().split(/\s+/)[0] ?? ''
}

function buildMessage(role: AssistantMessage['role'], content: string): AssistantMessage {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    content,
  }
}

export function AssistantWidget() {
  const { pathname } = useLocation()
  const { currentUserProfile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const routeLabel = useMemo(() => resolveRouteLabel(pathname), [pathname])
  const firstName = useMemo(
    () => getFirstName(currentUserProfile?.fullName),
    [currentUserProfile?.fullName],
  )
  const welcomeMessage = useMemo(
    () =>
      firstName
        ? `Oi, ${firstName}. Eu sou o assistente do Effectus. Posso te ajudar com propostas, documentos, pendências e uso do sistema.`
        : 'Oi. Eu sou o assistente do Effectus. Posso te ajudar com propostas, documentos, pendências e uso do sistema.',
    [firstName],
  )
  const [messages, setMessages] = useState<AssistantMessage[]>([
    buildMessage('assistant', welcomeMessage),
  ])

  useEffect(() => {
    setMessages((currentMessages) => {
      if (currentMessages.length === 0) {
        return [buildMessage('assistant', welcomeMessage)]
      }

      const [firstMessage, ...rest] = currentMessages

      if (
        firstMessage.role === 'assistant' &&
        firstMessage.content !== welcomeMessage
      ) {
        return [{ ...firstMessage, content: welcomeMessage }, ...rest]
      }

      return currentMessages
    })
  }, [welcomeMessage])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const message = inputValue.trim()

    if (!message || isSending) {
      return
    }

    const userMessage = buildMessage('user', message)
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInputValue('')
    setIsSending(true)

    try {
      const response = await sendAssistantMessage({
        message,
        routePath: pathname,
        routeLabel,
        history: messages,
        userName: currentUserProfile?.fullName,
      })

      setMessages([
        ...nextMessages,
        buildMessage('assistant', response.answer),
      ])
    } catch (error) {
      const fallback =
        error instanceof Error
          ? error.message
          : 'Deu ruim por aqui agora. Tenta de novo daqui a pouco.'

      setMessages([
        ...nextMessages,
        buildMessage(
          'assistant',
          `${fallback} Posso te ajudar com dúvidas sobre o uso do Effectus assim que eu voltar.`,
        ),
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleQuickPrompt(prompt: string) {
    setIsOpen(true)
    setInputValue(prompt)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed right-4 bottom-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0px_18px_45px_rgba(0,74,198,0.3)] transition-all hover:scale-105 hover:bg-primary-container sm:right-6 sm:bottom-6"
        aria-label={isOpen ? 'Fechar assistente' : 'Abrir assistente'}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Icon name="robot_2" size={28} />
        </span>
      </button>

      {isOpen ? (
        <div className="fixed right-4 bottom-24 z-40 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-[28px] border border-outline-variant bg-surface-container-lowest shadow-[0px_24px_80px_rgba(19,27,46,0.18)] sm:right-6 sm:bottom-26">
          <div className="bg-[linear-gradient(135deg,rgba(0,74,198,0.98),rgba(37,99,235,0.88))] px-5 py-4 text-on-primary">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/16 text-on-primary backdrop-blur-sm">
                <Icon name="robot_2" size={26} />
              </div>
              <div className="min-w-0">
                <p className="text-label-sm uppercase tracking-[0.16em] text-white/70">
                  Assistente Effectus
                </p>
                <h2 className="text-headline-lg font-semibold text-white">
                  Ajuda rapidinha
                </h2>
              </div>
            </div>
            <p className="mt-3 text-body-md text-white/82">
              Tira dúvida sobre uso do sistema, documentos, propostas e pendências.
            </p>
          </div>

          <div className="border-b border-outline-variant bg-surface-container-low px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  className="rounded-full border border-outline-variant bg-white px-3 py-2 text-body-sm text-on-surface transition-all hover:border-primary hover:text-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[380px] space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f5f7ff_100%)] px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-body-md shadow-[0px_6px_20px_rgba(19,27,46,0.06)] ${
                    message.role === 'assistant'
                      ? 'rounded-bl-md bg-white text-on-surface'
                      : 'rounded-br-md bg-primary text-on-primary'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isSending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-body-md text-on-surface shadow-[0px_6px_20px_rgba(19,27,46,0.06)]">
                  Pensando aqui, pera aí...
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-outline-variant bg-white p-4">
            <label htmlFor="effectus-assistant-input" className="sr-only">
              Digite sua dúvida
            </label>
            <div className="flex items-end gap-3">
              <textarea
                id="effectus-assistant-input"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Ex.: o que significa proposta pendente?"
                rows={2}
                className="min-h-[52px] flex-1 resize-none rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={isSending || !inputValue.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Enviar mensagem"
              >
                <Icon name="arrow_upward" size={20} />
              </button>
            </div>
            <p className="mt-2 text-body-sm text-on-surface-variant">
              Responde só sobre uso e negócio do Effectus. Assuntos técnicos ficam de fora.
            </p>
          </form>
        </div>
      ) : null}
    </>
  )
}
