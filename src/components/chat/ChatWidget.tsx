import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/auth-context'
import { usePreferences } from '../../contexts/preferences-context'
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
  const { preferences } = usePreferences()
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false)
  const [isOfflineListOpen, setIsOfflineListOpen] = useState(false)
  const [openingUserId, setOpeningUserId] = useState<string | null>(null)
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
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([])
  const socketRef = useRef<WebSocket | null>(null)
  const typingStopTimeoutRef = useRef<number | null>(null)
  const isTypingSentRef = useRef(false)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
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

  const onlineUsersSet = useMemo(() => new Set(onlineUserIds), [onlineUserIds])
  const isAdmin = currentUserProfile?.isAdmin ?? false
  const chatWallpaperClassName = useMemo(
    () =>
      preferences.chatWallpaper === 'none'
        ? 'chat-wallpaper-none'
        : preferences.chatWallpaper === 'subtle'
          ? 'chat-wallpaper-subtle'
          : 'chat-wallpaper',
    [preferences.chatWallpaper],
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

  const onlineDirectoryItems = useMemo(
    () => directoryItems.filter(({ user }) => onlineUsersSet.has(user.id)),
    [directoryItems, onlineUsersSet],
  )

  const offlineDirectoryItems = useMemo(
    () => directoryItems.filter(({ user }) => !onlineUsersSet.has(user.id)),
    [directoryItems, onlineUsersSet],
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
    async (conversationId: string, previewConversation?: ChatConversationSummary | null) => {
      if (!currentUserId) {
        return
      }

      if (previewConversation) {
        setActiveConversation(previewConversation)
        setMessages([])
        setTypingConversationId(null)
        setInputValue('')
        setIsDirectoryOpen(false)
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
        if (previewConversation) {
          setActiveConversation(null)
          setIsDirectoryOpen(true)
        }
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

      if (payload.type === 'chat_presence_snapshot') {
        setOnlineUserIds(payload.onlineUserIds)
        return
      }

      if (payload.type === 'chat_presence') {
        setOnlineUserIds((currentItems) => {
          const nextItems = new Set(currentItems)

          if (payload.isOnline) {
            nextItems.add(payload.userId)
          } else {
            nextItems.delete(payload.userId)
          }

          return Array.from(nextItems)
        })
        return
      }

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
    const container = messagesContainerRef.current

    if (!container) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: isLoadingConversation ? 'auto' : 'smooth',
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [isLoadingConversation, messages, typingConversationId])

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
        setOpeningUserId(user.id)

        try {
          await openConversationById(existingConversation.id, existingConversation)
        } finally {
          setOpeningUserId(null)
        }
        return
      }

      setOpeningUserId(user.id)

      try {
        const conversation = await openDirectChatConversation(currentUserId, user.id)
        setConversations((currentItems) =>
          upsertConversationInList(currentItems, conversation),
        )
        setMessages([])
        setActiveConversation(conversation)
        setTypingConversationId(null)
        setInputValue('')
        setIsDirectoryOpen(false)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível iniciar a conversa.',
        )
      } finally {
        setOpeningUserId(null)
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

  const closeConversation = () => {
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
    setIsLoadingConversation(false)
    isTypingSentRef.current = false
  }

  const handleBackToChats = () => {
    closeConversation()
    setIsDirectoryOpen(true)
  }

  const renderDirectoryButton = ({
    user,
    conversation,
  }: {
    user: ChatDirectoryUser
    conversation: ChatConversationSummary | null
  }) => {
    const isOpening = openingUserId === user.id

    return (
      <button
        key={user.id}
        type="button"
        onClick={() => void handleSelectUser(user)}
        disabled={isOpening}
        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
          isOpening
            ? 'cursor-wait bg-surface-container-low'
            : 'hover:bg-surface-container-low'
        }`}
      >
      <div className="relative shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#DBEAFE,#BFDBFE)] text-sm font-semibold text-primary">
          {getInitials(user.fullName)}
        </div>
        {onlineUsersSet.has(user.id) ? (
          <span
            className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]"
            aria-label={`${user.fullName} está online`}
            title="Online"
          />
        ) : null}
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
          {conversation?.lastMessage ?? (user.isAdmin ? 'Administrador' : 'Corretor')}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {isOpening ? (
          <span className="inline-flex items-center gap-1 text-body-sm text-primary">
            <Icon name="progress_activity" size={16} className="animate-spin" />
            Abrindo
          </span>
        ) : (
          <>
            <p className="text-body-sm text-on-surface-variant">
              {formatMessageTime(conversation?.lastMessageAt ?? null)}
            </p>
            {conversation?.unreadCount ? (
              <span className="mt-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-on-primary">
                {conversation.unreadCount}
              </span>
            ) : null}
          </>
        )}
      </div>
      </button>
    )
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
        className="fixed right-4 bottom-24 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-[0px_18px_45px_rgba(15,23,42,0.16)] transition-all hover:scale-105 hover:bg-surface-container sm:right-6 sm:bottom-28"
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

          <div className="max-h-[420px] overflow-y-auto bg-surface-container-lowest px-3 py-3">
            {isLoadingDirectory ? (
              <div className="px-3 py-8 text-center text-body-md text-on-surface-variant">
                Carregando usuários...
              </div>
            ) : directoryItems.length === 0 ? (
              <div className="px-3 py-8 text-center text-body-md text-on-surface-variant">
                Nenhum usuário disponível no momento.
              </div>
            ) : isAdmin ? (
              <div className="space-y-3">
                <section className="space-y-1">
                  <div className="flex items-center justify-between px-3 pt-1 pb-2">
                    <p className="text-label-sm font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                      Online
                    </p>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      {onlineDirectoryItems.length}
                    </span>
                  </div>
                  {onlineDirectoryItems.length === 0 ? (
                    <div className="rounded-2xl bg-surface px-3 py-3 text-body-sm text-on-surface-variant">
                      Ninguém online no momento.
                    </div>
                  ) : (
                    onlineDirectoryItems.map(renderDirectoryButton)
                  )}
                </section>

                <section className="rounded-2xl border border-outline-variant/70 bg-surface">
                  <button
                    type="button"
                    onClick={() => setIsOfflineListOpen((currentValue) => !currentValue)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                    aria-expanded={isOfflineListOpen}
                  >
                    <div>
                      <p className="text-label-sm font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                        Offline
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {offlineDirectoryItems.length === 0
                          ? 'Nenhum usuário offline.'
                          : `${offlineDirectoryItems.length} usuário(s) offline`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface">
                        {offlineDirectoryItems.length}
                      </span>
                      <span
                        className={`text-on-surface-variant transition-transform ${
                          isOfflineListOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      >
                        <Icon name="expand_more" size={20} />
                      </span>
                    </div>
                  </button>

                  {isOfflineListOpen && offlineDirectoryItems.length > 0 ? (
                    <div className="space-y-1 border-t border-outline-variant/60 px-1 py-2">
                      {offlineDirectoryItems.map(renderDirectoryButton)}
                    </div>
                  ) : null}
                </section>
              </div>
            ) : (
              directoryItems.map(renderDirectoryButton)
            )}
          </div>
        </div>
      ) : null}

      {activeConversation ? (
        <div className="fixed right-4 bottom-44 z-40 flex w-[calc(100vw-2rem)] max-w-[340px] flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-lowest shadow-[0px_22px_64px_rgba(19,27,46,0.16)] sm:right-6 sm:bottom-48 sm:max-w-[352px]">
          <div className="bg-[linear-gradient(135deg,rgba(0,74,198,0.98),rgba(37,99,235,0.88))] px-4 py-3.5 text-on-primary">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToChats}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Voltar para os chats"
                >
                  <Icon name="arrow_back" size={20} />
                </button>
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
                    {getInitials(activeConversation.counterpart.fullName)}
                  </div>
                  {onlineUsersSet.has(activeConversation.counterpart.id) ? (
                    <span
                      className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-[#1d4ed8] bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.16)]"
                      aria-label={`${activeConversation.counterpart.fullName} está online`}
                      title="Online"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-body-lg font-semibold text-white">
                    {activeConversation.counterpart.fullName}
                  </p>
                  <p className="text-[12px] text-white/75">
                    {onlineUsersSet.has(activeConversation.counterpart.id)
                      ? 'Online'
                      : activeConversation.counterpart.isAdmin
                        ? 'Administrador'
                        : 'Corretor'}
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
                  onClick={closeConversation}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Fechar conversa"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className={`${chatWallpaperClassName} h-[300px] overflow-y-auto px-3.5 py-3.5`}
          >
            {isLoadingConversation ? (
              <div className="rounded-2xl bg-surface-container-lowest px-4 py-3 text-body-sm text-on-surface-variant shadow-[0px_6px_20px_rgba(19,27,46,0.06)]">
                <div className="flex items-center gap-2">
                  <Icon name="progress_activity" size={16} className="animate-spin text-primary" />
                  Carregando conversa...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-lowest px-4 py-3 text-body-sm text-on-surface-variant shadow-[0px_6px_20px_rgba(19,27,46,0.06)]">
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
                          : 'rounded-bl-md bg-surface-container-lowest text-on-surface'
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
                <div className="rounded-2xl rounded-bl-md bg-surface-container-lowest px-4 py-3 shadow-[0px_6px_20px_rgba(19,27,46,0.06)]">
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

          <div className="border-t border-outline-variant bg-surface-container-lowest p-3.5">
            <div className="flex items-end gap-2.5">
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  const shouldSendWithEnter =
                    preferences.enterBehavior === 'send' &&
                    event.key === 'Enter' &&
                    !event.shiftKey
                  const shouldSendWithShortcut =
                    preferences.enterBehavior === 'newline' &&
                    event.key === 'Enter' &&
                    (event.ctrlKey || event.metaKey)

                  if (shouldSendWithEnter || shouldSendWithShortcut) {
                    event.preventDefault()
                    void handleSendMessage()
                  }
                }}
                placeholder={`Mensagem para ${activeConversation.counterpart.fullName.split(' ')[0]}`}
                rows={2}
                disabled={isLoadingConversation}
                className="min-h-[46px] flex-1 resize-none rounded-2xl border border-outline-variant bg-surface px-3.5 py-2.5 text-body-sm text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => void handleSendMessage()}
                disabled={isLoadingConversation || isSending || !inputValue.trim()}
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
