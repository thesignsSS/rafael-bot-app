import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './contexts/auth-context'
import { SessionLoadingScreen } from './components/ui/SessionLoadingScreen'
import { AppRoutes } from './routes/AppRoutes'

function AppContent() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <SessionLoadingScreen />
  }

  return <AppRoutes />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  )
}

export default App
