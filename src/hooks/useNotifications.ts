import { useCallback, useEffect, useMemo, useState } from 'react'
import { CHAT_NOTIFICATION_EVENT } from '../lib/chat'
import {
  getNotificationPreferenceKey,
  isNotificationTypeEnabled,
  usePreferences,
} from '../contexts/preferences-context'
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from '../lib/notifications'

function playNotificationSound() {
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

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(740, now)
    oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.18)

    gainNode.gain.setValueAtTime(0.0001, now)
    gainNode.gain.exponentialRampToValueAtTime(0.04, now + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(now)
    oscillator.stop(now + 0.2)

    oscillator.onended = () => {
      void audioContext.close().catch(() => undefined)
    }
  } catch {
    return
  }
}

export function useNotifications(userId?: string | null) {
  const { preferences } = usePreferences()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    if (!userId) {
      setItems([])
      return
    }

    setIsLoading(true)

    try {
      const notifications = await fetchNotifications(userId)
      setItems(notifications)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()

    if (!userId) {
      return
    }

    const intervalId = window.setInterval(() => {
      void load()
    }, 30000)

    const handleNotificationCreated = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationItem>
      const notification = customEvent.detail

      if (!notification || notification.userId !== userId) {
        return
      }

      if (!isNotificationTypeEnabled(preferences, notification.type)) {
        return
      }

      if (preferences.notifications.sound) {
        playNotificationSound()
      }

      setItems((currentItems) => {
        if (currentItems.some((item) => item.id === notification.id)) {
          return currentItems
        }

        return [notification, ...currentItems]
      })
    }

    window.addEventListener(CHAT_NOTIFICATION_EVENT, handleNotificationCreated as EventListener)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener(
        CHAT_NOTIFICATION_EVENT,
        handleNotificationCreated as EventListener,
      )
    }
  }, [load, preferences, userId])

  const visibleItems = useMemo(
    () =>
      items.filter((item) =>
        preferences.notifications.types[getNotificationPreferenceKey(item.type)],
      ),
    [items, preferences.notifications.types],
  )

  const unreadCount = useMemo(
    () => visibleItems.filter((item) => item.readAt === null).length,
    [visibleItems],
  )

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) {
        return
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === notificationId && item.readAt === null
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      )

      try {
        await markNotificationAsRead(userId, notificationId)
      } catch {
        void load()
      }
    },
    [load, userId],
  )

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) {
      return
    }

    const readAt = new Date().toISOString()
    setItems((currentItems) =>
      currentItems.map((item) => ({
        ...item,
        readAt: item.readAt ?? readAt,
      })),
    )

    try {
      await markAllNotificationsAsRead(userId)
    } catch {
      void load()
    }
  }, [load, userId])

  return {
    items: visibleItems,
    isLoading,
    unreadCount,
    reload: load,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  }
}
