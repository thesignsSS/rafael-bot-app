import { Button } from '../../components/ui/Button'
import { useHomePage } from './hooks/useHomePage'

export default function HomePage() {
  const { user, handleSignOut } = useHomePage()

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
