import { AuthShell } from '../../layouts/AuthShell'
import { Card } from '../../components/ui/Card'
import { LoginForm } from './components/LoginForm'
import { AuthHeader } from '../../components/ui/AuthHeader'
import { useLoginPage } from './hooks/useLoginPage'
import { LoginConfetti } from './components/LoginConfetti'

export default function LoginPage() {
  useLoginPage()

  return (
    <AuthShell>
      <div className="relative">
        <Card>
          <LoginConfetti />
          <div className="relative z-[1]">
            <AuthHeader />
            <LoginForm />
          </div>
        </Card>
      </div>
    </AuthShell>
  )
}
