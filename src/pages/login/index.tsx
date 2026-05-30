import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell } from '../../layouts/AuthShell'
import { Card } from '../../components/ui/Card'
import { LoginForm } from './components/LoginForm'
import { AuthHeader } from '../../components/ui/AuthHeader'

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Rafael Bot - Login'
  }, [])

  useEffect(() => {
    const state = location.state as { passwordReset?: boolean } | null
    if (state?.passwordReset) {
      toast.success(
        'Senha redefinida com sucesso. Faça login com sua nova senha.',
      )
      navigate('.', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  return (
    <AuthShell>
      <Card>
        <AuthHeader />
        <LoginForm />
      </Card>
    </AuthShell>
  )
}
