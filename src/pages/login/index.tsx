import { useEffect } from 'react'
import { AuthShell } from '../../layouts/AuthShell'
import { Card } from '../../components/ui/Card'
import { LoginForm } from './components/LoginForm'
import { LoginHeader } from './components/LoginHeader'

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Rafael Bot - Login'
  }, [])

  return (
    <AuthShell>
      <Card>
        <LoginHeader />
        <LoginForm />
      </Card>
    </AuthShell>
  )
}
