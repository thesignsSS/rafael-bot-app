import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type AppTheme =
  | 'light'
  | 'dark'
  | 'graphite'
  | 'rose'
  | 'emerald'
  | 'sunset'
  | 'brazuca'
  | 'brazuca-dark'
export type AppFontSize = 'medium' | 'large'
export type AppDensity = 'default' | 'compact'
export type ProposalsLayout = 'kanban' | 'table'
export type EngenhariaLayout = 'kanban' | 'table'
export type ChatWallpaper = 'classic' | 'subtle' | 'none'
export type EnterBehavior = 'send' | 'newline'
export type NotificationPreferenceKey =
  | 'proposal_updates'
  | 'status_changes'
  | 'comments'
  | 'invitations'
  | 'chat_messages'

export type AppPreferences = {
  theme: AppTheme
  fontSize: AppFontSize
  density: AppDensity
  proposalsLayout: ProposalsLayout
  engenhariaLayout: EngenhariaLayout
  chatWallpaper: ChatWallpaper
  enterBehavior: EnterBehavior
  notifications: {
    sound: boolean
    types: Record<NotificationPreferenceKey, boolean>
  }
}

export type NotificationType =
  | 'proposal_submitted'
  | 'proposal_status_changed'
  | 'proposal_comment_added'
  | 'proposal_resubmitted'
  | 'proposal_collaborator_added'
  | 'proposal_invitation_received'
  | 'chat_message'

type PreferencesContextValue = {
  preferences: AppPreferences
  updatePreferences: (nextValues: Partial<AppPreferences>) => void
  updateNotificationTypes: (
    nextValues: Partial<Record<NotificationPreferenceKey, boolean>>,
  ) => void
}

export const APP_PREFERENCES_STORAGE_KEY = 'effectus-preferences'
const DEFAULT_FAVICON_PATH = '/favicon.svg'
const BRAZUCA_FAVICON_PATH = '/favicon-brazuca.svg'

export function isBrazilTheme(theme: AppTheme) {
  return theme === 'brazuca' || theme === 'brazuca-dark'
}

export function resolveThemeColorScheme(theme: AppTheme) {
  return theme === 'light' || theme === 'brazuca' ? 'light' : 'dark'
}

function applyThemeFavicon(theme: AppTheme) {
  const faviconPath = isBrazilTheme(theme)
    ? BRAZUCA_FAVICON_PATH
    : DEFAULT_FAVICON_PATH
  const linkElement = document.querySelector<HTMLLinkElement>("link[rel~='icon']")

  if (linkElement) {
    linkElement.href = faviconPath
    return
  }

  const nextLinkElement = document.createElement('link')
  nextLinkElement.rel = 'icon'
  nextLinkElement.type = 'image/svg+xml'
  nextLinkElement.href = faviconPath
  document.head.appendChild(nextLinkElement)
}

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'light',
  fontSize: 'medium',
  density: 'default',
  proposalsLayout: 'kanban',
  engenhariaLayout: 'kanban',
  chatWallpaper: 'classic',
  enterBehavior: 'send',
  notifications: {
    sound: true,
    types: {
      proposal_updates: true,
      status_changes: true,
      comments: true,
      invitations: true,
      chat_messages: true,
    },
  },
}

function mergePreferences(
  currentPreferences: AppPreferences,
  nextValues: Partial<AppPreferences>,
) {
  return {
    ...currentPreferences,
    ...nextValues,
    notifications: {
      ...currentPreferences.notifications,
      ...nextValues.notifications,
      types: {
        ...currentPreferences.notifications.types,
        ...nextValues.notifications?.types,
      },
    },
  } satisfies AppPreferences
}

function resolveInitialPreferences(): AppPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES
  }

  const storedPreferences = window.localStorage.getItem(APP_PREFERENCES_STORAGE_KEY)

  if (!storedPreferences) {
    return DEFAULT_PREFERENCES
  }

  try {
    const parsed = JSON.parse(storedPreferences) as Partial<AppPreferences>
    return mergePreferences(DEFAULT_PREFERENCES, parsed)
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function applyPreferencesToDocument(preferences: AppPreferences) {
  document.documentElement.dataset.theme = preferences.theme
  document.documentElement.dataset.fontSize = preferences.fontSize
  document.documentElement.dataset.density = preferences.density
  document.documentElement.style.colorScheme = resolveThemeColorScheme(
    preferences.theme,
  )
  applyThemeFavicon(preferences.theme)
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

type PreferencesProviderProps = {
  children: ReactNode
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<AppPreferences>(
    resolveInitialPreferences,
  )

  useEffect(() => {
    applyPreferencesToDocument(preferences)
    window.localStorage.setItem(
      APP_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    )
  }, [preferences])

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      updatePreferences: (nextValues) => {
        setPreferences((currentPreferences) =>
          mergePreferences(currentPreferences, nextValues),
        )
      },
      updateNotificationTypes: (nextValues) => {
        setPreferences((currentPreferences) =>
          mergePreferences(currentPreferences, {
            notifications: {
              ...currentPreferences.notifications,
              types: {
                ...currentPreferences.notifications.types,
                ...nextValues,
              },
            },
          }),
        )
      },
    }),
    [preferences],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)

  if (!context) {
    throw new Error('usePreferences deve ser usado dentro de PreferencesProvider')
  }

  return context
}

export function getNotificationPreferenceKey(type: NotificationType): NotificationPreferenceKey {
  if (type === 'proposal_status_changed') {
    return 'status_changes'
  }

  if (type === 'proposal_comment_added') {
    return 'comments'
  }

  if (type === 'proposal_invitation_received') {
    return 'invitations'
  }

  if (type === 'chat_message') {
    return 'chat_messages'
  }

  return 'proposal_updates'
}

export function isNotificationTypeEnabled(
  preferences: AppPreferences,
  type: NotificationType,
) {
  return preferences.notifications.types[getNotificationPreferenceKey(type)]
}
