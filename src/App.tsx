import { AssistantWidget } from './components/assistant/AssistantWidget'
import { WhatsAppBotNotice } from './components/assistant/WhatsAppBotNotice'
import { ChatWidget } from './components/chat/ChatWidget'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './contexts/auth-context'
import { PreferencesProvider } from './contexts/preferences-context'
import { SessionLoadingScreen } from './components/ui/SessionLoadingScreen'
import { AppRoutes } from './routes/AppRoutes'
import { BrazilThemeCelebration } from './components/theme/BrazilThemeCelebration'
import { BrazucaThemeNotice } from './components/theme/BrazucaThemeNotice'
import { PreferencesProfileSync } from './components/theme/PreferencesProfileSync'
import { IncomeFormalAnnouncementModal } from './components/announcements/IncomeFormalAnnouncementModal'
import { ForcePasswordChangeModal } from './components/auth/ForcePasswordChangeModal'

function AppContent() {
  const {
    currentUserProfile,
    isLoading,
    profileError,
    refreshProfile,
    session,
    signOut,
    user,
  } = useAuth()

  if (isLoading) {
    return <SessionLoadingScreen />
  }

  if (session && user?.user_metadata?.must_change_password) {
    return <ForcePasswordChangeModal />
  }

  if (session && !currentUserProfile && profileError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
          <h1 className="text-headline-lg font-semibold text-on-surface">
            Não foi possível carregar seu perfil
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {profileError}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low"
            >
              Sair
            </button>
            <button
              type="button"
              onClick={() => void refreshProfile()}
              className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <AppRoutes />
}

function App() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <AppContent />
        <PreferencesProfileSync />
        <BrazilThemeCelebration />
        <IncomeFormalAnnouncementModal />
        <BrazucaThemeNotice />
        <WhatsAppBotNotice />
        <ChatWidget />
        <AssistantWidget />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </PreferencesProvider>
  )
}

export default App
