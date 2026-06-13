import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/auth-context'
import {
  CHAT_NOTIFICATION_EVENT,
  CHAT_OPEN_EVENT,
  fetchChatConversations,
  fetchChatMessages,
  fetchChatUsers,
  markChatConversationAsRead,
  openDirectChatConversation,
  resolveChatWebSocketUrl,
  sendChatMessage,
  type ChatConversationSummary,
  type ChatDirectoryUser,
  type ChatMessageItem,
  type ChatSocketEvent,
} from '../../lib/chat'
import { Icon } from '../ui/Icon'

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}

function formatMessageTime(value: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMessageDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function upsertConversationInList(
  currentItems: ChatConversationSummary[],
  nextItem: ChatConversationSummary,
) {
  const remainingItems = currentItems.filter((item) => item.id !== nextItem.id)

  return [nextItem, ...remainingItems].sort((first, second) => {
    const firstTime = first.lastMessageAt ? new Date(first.lastMessageAt).getTime() : 0
    const secondTime = second.lastMessageAt ? new Date(second.lastMessageAt).getTime() : 0
    return secondTime - firstTime
  })
}

function upsertMessageInList(currentItems: ChatMessageItem[], nextItem: ChatMessageItem) {
  if (currentItems.some((item) => item.id === nextItem.id)) {
    return currentItems
  }

  return [...currentItems, nextItem].sort(
    (first, second) =>
      new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
  )
}

function playIncomingMessageSound() {
  if (typeof window === 'undefined') {
    return
  }

  const AudioContextConstructor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioContextConstructor) {
    return
  }

  try {
    const audioContext = new AudioContextConstructor()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const now = audioContext.currentTime

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, now)
    oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.16)

    gainNode.gain.setValueAtTime(0.0001, now)
    gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(now)
    oscillator.stop(now + 0.18)

    oscillator.onended = () => {
      void audioContext.close().catch(() => undefined)
    }
  } catch {
    return
  }
}

export function ChatWidget() {
  const { currentUserProfile } = useAuth()
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false)
  const [activeConversation, setActiveConversation] =
    useState<ChatConversationSummary | null>(null)
  const [users, setUsers] = useState<ChatDirectoryUser[]>([])
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([])
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false)
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [typingConversationId, setTypingConversationId] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const typingStopTimeoutRef = useRef<number | null>(null)
  const isTypingSentRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const currentUserId = currentUserProfile?.id ?? null
  const currentUserName = currentUserProfile?.fullName ?? ''
  const totalUnread = useMemo(
    () => conversations.reduce((total, item) => total + item.unreadCount, 0),
    [conversations],
  )

  const conversationsByUserId = useMemo(
    () =>
      new Map(conversations.map((item) => [item.counterpart.id, item])),
    [conversations],
  )

  const directoryItems = useMemo(
    () =>
      users
        .map((user) => ({
          user,
          conversation: conversationsByUserId.get(user.id) ?? null,
        }))
        .sort((first, second) => {
          if (first.conversation && !second.conversation) {
            return -1
          }

          if (!first.conversation && second.conversation) {
            return 1
          }

          const firstUnread = first.conversation?.unreadCount ?? 0
          const secondUnread = second.conversation?.unreadCount ?? 0

          if (firstUnread !== secondUnread) {
            return secondUnread - firstUnread
          }

          const firstTime = first.conversation?.lastMessageAt
            ? new Date(first.conversation.lastMessageAt).getTime()
            : 0
          const secondTime = second.conversation?.lastMessageAt
            ? new Date(second.conversation.lastMessageAt).getTime()
            : 0

          if (firstTime !== secondTime) {
            return secondTime - firstTime
          }

          return first.user.fullName.localeCompare(second.user.fullName)
        }),
    [conversationsByUserId, users],
  )

  const loadDirectoryData = useCallback(async () => {
    if (!currentUserId) {
      return
    }

    setIsLoadingDirectory(true)

    try {
      const [usersResponse, conversationsResponse] = await Promise.all([
        fetchChatUsers(currentUserId),
        fetchChatConversations(currentUserId),
      ])
      setUsers(usersResponse)
      setConversations(conversationsResponse)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o chat.',
      )
    } finally {
      setIsLoadingDirectory(false)
    }
  }, [currentUserId])

  const markConversationAsReadLocally = useCallback((conversationId: string) => {
    setConversations((currentItems) =>
      currentItems.map((item) =>
        item.id === conversationId ? { ...item, unreadCount: 0 } : item,
      ),
    )
    setActiveConversation((currentConversation) =>
      currentConversation?.id === conversationId
        ? { ...currentConversation, unreadCount: 0 }
        : currentConversation,
    )
  }, [])

  const openConversationById = useCallback(
    async (conversationId: string) => {
      if (!currentUserId) {
        return
      }

      setIsLoadingConversation(true)

      try {
        const response = await fetchChatMessages(currentUserId, conversationId)
        setActiveConversation(response.conversation)
        setMessages(response.items)
        setIsDirectoryOpen(false)
        markConversationAsReadLocally(conversationId)
        await markChatConversationAsRead(currentUserId, conversationId).catch(() => undefined)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível abrir a conversa.',
        )
      } finally {
        setIsLoadingConversation(false)
      }
    },
    [currentUserId, markConversationAsReadLocally],
  )

  useEffect(() => {
    if (!currentUserId) {
      return
    }

    void loadDirectoryData()
  }, [currentUserId, loadDirectoryData])

  useEffect(() => {
    if (!currentUserId) {
      return
    }

    let socket: WebSocket

    try {
      socket = new WebSocket(resolveChatWebSocketUrl(currentUserId))
    } catch {
      return
    }

    socketRef.current = socket

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as ChatSocketEvent

      if (payload.type === 'notification_created') {
        window.dispatchEvent(
          new CustomEvent(CHAT_NOTIFICATION_EVENT, {
            detail: payload.notification,
          }),
        )
        return
      }

      if (payload.type === 'chat_typing') {
        setTypingConversationId((currentValue) => {
          if (payload.isTyping) {
            return payload.conversationId
          }

          return currentValue === payload.conversationId ? null : currentValue
        })
        return
      }

      if (payload.message.senderUserId !== currentUserId) {
        playIncomingMessageSound()
      }

      setConversations((currentItems) =>
        upsertConversationInList(currentItems, payload.conversation),
      )
      setActiveConversation((currentConversation) =>
        currentConversation?.id === payload.conversation.id
          ? payload.conversation
          : currentConversation,
      )

      if (
        payload.message.senderUserId === currentUserId &&
        activeConversation?.id === payload.conversation.id
      ) {
        setMessages((currentItems) => upsertMessageInList(currentItems, payload.message))
        return
      }

      if (activeConversation?.id === payload.conversation.id) {
        setMessages((currentItems) => upsertMessageInList(currentItems, payload.message))
        markConversationAsReadLocally(payload.conversation.id)
        void markChatConversationAsRead(currentUserId, payload.conversation.id).catch(
          () => undefined,
        )
      }
    }

    return () => {
      socketRef.current = null
      socket.close()
    }
  }, [activeConversation?.id, currentUserId, markConversationAsReadLocally])

  useEffect(() => {
    return () => {
      if (typingStopTimeoutRef.current) {
        window.clearTimeout(typingStopTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingConversationId])

  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId?: string }>
      const conversationId = customEvent.detail?.conversationId

      if (!conversationId) {
        setIsDirectoryOpen(true)
        return
      }

      void openConversationById(conversationId)
    }

    window.addEventListener(CHAT_OPEN_EVENT, handleOpenChat as EventListener)

    return () =>
      window.removeEventListener(CHAT_OPEN_EVENT, handleOpenChat as EventListener)
  }, [openConversationById])

  useEffect(() => {
    if (!activeConversation || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    const trimmedValue = inputValue.trim()
    const recipientUserId = activeConversation.counterpart.id

    if (!trimmedValue) {
      if (isTypingSentRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: 'typing',
            conversationId: activeConversation.id,
            recipientUserId,
            isTyping: false,
          }),
        )
        isTypingSentRef.current = false
      }

      if (typingStopTimeoutRef.current) {
        window.clearTimeout(typingStopTimeoutRef.current)
        typingStopTimeoutRef.current = null
      }

      return
    }

    if (!isTypingSentRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: 'typing',
          conversationId: activeConversation.id,
          recipientUserId,
          isTyping: true,
        }),
      )
      isTypingSentRef.current = true
    }

    if (typingStopTimeoutRef.current) {
      window.clearTimeout(typingStopTimeoutRef.current)
    }

    typingStopTimeoutRef.current = window.setTimeout(() => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        return
      }

      socketRef.current.send(
        JSON.stringify({
          type: 'typing',
          conversationId: activeConversation.id,
          recipientUserId,
          isTyping: false,
        }),
      )
      isTypingSentRef.current = false
      typingStopTimeoutRef.current = null
    }, 1200)
  }, [activeConversation, inputValue])

  const handleSelectUser = useCallback(
    async (user: ChatDirectoryUser) => {
      if (!currentUserId) {
        return
      }

      const existingConversation = conversationsByUserId.get(user.id)

      if (existingConversation) {
        await openConversationById(existingConversation.id)
        return
      }

      try {
        const conversation = await openDirectChatConversation(currentUserId, user.id)
        setConversations((currentItems) =>
          upsertConversationInList(currentItems, conversation),
        )
        setMessages([])
        setActiveConversation(conversation)
        setIsDirectoryOpen(false)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível iniciar a conversa.',
        )
      }
    },
    [conversationsByUserId, currentUserId, openConversationById],
  )

  const handleSendMessage = useCallback(async () => {
    if (!currentUserId || !activeConversation) {
      return
    }

    const content = inputValue.trim()

    if (!content || isSending) {
      return
    }

    setIsSending(true)

    try {
      const response = await sendChatMessage(
        currentUserId,
        activeConversation.counterpart.id,
        content,
      )

      setInputValue('')
      setTypingConversationId(null)
      setActiveConversation(response.conversation)
      setConversations((currentItems) =>
        upsertConversationInList(currentItems, response.conversation),
      )
      setMessages((currentItems) => upsertMessageInList(currentItems, response.message))

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'typing',
            conversationId: activeConversation.id,
            recipientUserId: activeConversation.counterpart.id,
            isTyping: false,
          }),
        )
      }

      isTypingSentRef.current = false
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar a mensagem.',
      )
    } finally {
      setIsSending(false)
    }
  }, [activeConversation, currentUserId, inputValue, isSending])

  if (!currentUserId) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsDirectoryOpen((currentValue) => !currentValue)
          if (!isDirectoryOpen) {
            void loadDirectoryData()
          }
        }}
        className="fixed right-4 bottom-24 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-[0px_18px_45px_rgba(15,23,42,0.16)] transition-all hover:scale-105 hover:bg-white sm:right-6 sm:bottom-28"
        aria-label="Abrir chat interno"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon name="forum" size={26} />
        </span>
        {totalUnread > 0 ? (
          <span className="absolute -top-1 -right-1 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-bold text-on-error">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        ) : null}
      </button>

      {isDirectoryOpen ? (
        <div className="fixed right-4 bottom-44 z-40 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-[28px] border border-outline-variant bg-surface-container-lowest shadow-[0px_24px_80px_rgba(19,27,46,0.18)] sm:right-6 sm:bottom-48">
          <div className="bg-[linear-gradient(135deg,rgba(0,74,198,0.98),rgba(37,99,235,0.88))] px-5 py-4 text-on-primary">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
                  <Icon name="forum" size={24} />
                </div>
                <div>
                  <p className="text-label-sm uppercase tracking-[0.16em] text-white/70">
                    Chat Effectus
                  </p>
                  <h2 className="text-headline-md font-semibold text-white">
                    Fale com a equipe
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDirectoryOpen(false)}
                className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Fechar lista de usuários"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto bg-white px-3 py-3">
            {isLoadingDirectory ? (
              <div className="px-3 py-8 text-center text-body-md text-on-surface-variant">
                Carregando usuários...
              </div>
            ) : directoryItems.length === 0 ? (
              <div className="px-3 py-8 text-center text-body-md text-on-surface-variant">
                Nenhum usuário disponível no momento.
              </div>
            ) : (
              directoryItems.map(({ user, conversation }) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => void handleSelectUser(user)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-surface-container-low"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#DBEAFE,#BFDBFE)] text-sm font-semibold text-primary">
                    {getInitials(user.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-body-md font-semibold text-on-surface">
                        {user.fullName}
                      </p>
                      {conversation?.unreadCount ? (
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary animate-gentle-pulse" />
                      ) : null}
                    </div>
                    <p className="truncate text-body-sm text-on-surface-variant">
                      {conversation?.lastMessage ??
                        (user.isAdmin ? 'Administrador' : 'Corretor')}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-body-sm text-on-surface-variant">
                      {formatMessageTime(conversation?.lastMessageAt ?? null)}
                    </p>
                    {conversation?.unreadCount ? (
                      <span className="mt-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-on-primary">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}

      {activeConversation ? (
        <div className="fixed right-4 bottom-44 z-40 flex w-[calc(100vw-2rem)] max-w-[340px] flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-lowest shadow-[0px_22px_64px_rgba(19,27,46,0.16)] sm:right-6 sm:bottom-48 sm:max-w-[352px]">
          <div className="bg-[linear-gradient(135deg,rgba(0,74,198,0.98),rgba(37,99,235,0.88))] px-4 py-3.5 text-on-primary">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
                  {getInitials(activeConversation.counterpart.fullName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-body-lg font-semibold text-white">
                    {activeConversation.counterpart.fullName}
                  </p>
                  <p className="text-[12px] text-white/75">
                    {activeConversation.counterpart.isAdmin ? 'Administrador' : 'Corretor'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsDirectoryOpen(true)}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Abrir lista de usuários"
                >
                  <Icon name="group" size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      socketRef.current?.readyState === WebSocket.OPEN &&
                      activeConversation &&
                      isTypingSentRef.current
                    ) {
                      socketRef.current.send(
                        JSON.stringify({
                          type: 'typing',
                          conversationId: activeConversation.id,
                          recipientUserId: activeConversation.counterpart.id,
                          isTyping: false,
                        }),
                      )
                    }

                    setActiveConversation(null)
                    setMessages([])
                    setTypingConversationId(null)
                    setInputValue('')
                    isTypingSentRef.current = false
                  }}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Fechar conversa"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="h-[300px] overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f5f7ff_100%)] px-3.5 py-3.5">
            {isLoadingConversation ? (
              <div className="rounded-2xl bg-white px-4 py-3 text-body-sm text-on-surface-variant shadow-[0px_6px_20px_rgba(19,27,46,0.06)]">
                Carregando conversa...
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-2xl bg-white px-4 py-3 text-body-sm text-on-surface-variant shadow-[0px_6px_20px_rgba(19,27,46,0.06)]">
                Nenhuma mensagem ainda. Pode mandar a primeira.
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderUserId === currentUserId

                return (
                  <div
                    key={message.id}
                    className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-body-sm shadow-[0px_6px_20px_rgba(19,27,46,0.06)] ${
                        isOwnMessage
                          ? 'rounded-br-md bg-primary text-on-primary'
                          : 'rounded-bl-md bg-white text-on-surface'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          isOwnMessage ? 'text-white/70' : 'text-on-surface-variant'
                        }`}
                      >
                        {formatMessageDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}

            {typingConversationId === activeConversation.id ? (
              <div className="mb-2 flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-[0px_6px_20px_rgba(19,27,46,0.06)]">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className="h-2 w-2 rounded-full bg-primary/70 animate-bounce"
                        style={{ animationDelay: `${index * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-outline-variant bg-white p-3.5">
            <div className="flex items-end gap-2.5">
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void handleSendMessage()
                  }
                }}
                placeholder={`Mensagem para ${activeConversation.counterpart.fullName.split(' ')[0]}`}
                rows={2}
                className="min-h-[46px] flex-1 resize-none rounded-2xl border border-outline-variant bg-surface px-3.5 py-2.5 text-body-sm text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => void handleSendMessage()}
                disabled={isSending || !inputValue.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Enviar mensagem"
              >
                <Icon name="send" size={18} />
              </button>
            </div>
            <p className="mt-2 text-[12px] text-on-surface-variant">
              Conversando como {currentUserName}.
            </p>
          </div>
        </div>
      ) : null}
    </>
  )
}
