import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../contexts/auth-context'

export default function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Rafael Bot'
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page-floor px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-headline-xl font-semibold text-on-surface">
          Bem-vindo
        </h1>
        {user?.email ? (
          <p className="text-body-md text-on-surface-variant">{user.email}</p>
        ) : null}
        <Button onClick={handleSignOut} icon="logout">
          Sair
        </Button>
      </div>
    </div>
  )
}
