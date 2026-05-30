import { useEffect } from 'react'
import { AuthShell } from '../../layouts/AuthShell'
import { Card } from '../../components/ui/Card'
import { LoginForm } from './components/LoginForm'
import { AuthHeader } from '../../components/ui/AuthHeader'

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Rafael Bot - Login'
  }, [])

  return (
    <AuthShell>
      <Card>
        <AuthHeader />
        <LoginForm />
      </Card>
    </AuthShell>
  )
}
