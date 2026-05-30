import { AuthShell } from '../../layouts/AuthShell'
import { Card } from '../../components/ui/Card'
import { LoginForm } from './components/LoginForm'
import { AuthHeader } from '../../components/ui/AuthHeader'
import { useLoginPage } from './hooks/useLoginPage'

export default function LoginPage() {
  useLoginPage()

  return (
    <AuthShell>
      <Card>
        <AuthHeader />
        <LoginForm />
      </Card>
    </AuthShell>
  )
}
