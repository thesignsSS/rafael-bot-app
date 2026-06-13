import { useCallback, useEffect, useMemo, useState } from 'react'
import { CHAT_NOTIFICATION_EVENT } from '../lib/chat'
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from '../lib/notifications'

export function useNotifications(userId?: string | null) {
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
  }, [load, userId])

  const unreadCount = useMemo(
    () => items.filter((item) => item.readAt === null).length,
    [items],
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
    items,
    isLoading,
    unreadCount,
    reload: load,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  }
}
