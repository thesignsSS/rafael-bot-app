import { AuthShell } from '../../layouts/AuthShell'
import { AuthHeader } from '../../components/ui/AuthHeader'
import { Card } from '../../components/ui/Card'
import { ResetPasswordForm } from './components/ResetPasswordForm'
import { useRedefinirSenhaPage } from './hooks/useRedefinirSenhaPage'

export default function RedefinirSenhaPage() {
  const { accessStatus } = useRedefinirSenhaPage()

  if (accessStatus === 'checking' || accessStatus === 'denied') {
    return null
  }

  return (
    <AuthShell>
      <Card>
        <AuthHeader subtitle="Redefinir senha" />
        <ResetPasswordForm />
      </Card>
    </AuthShell>
  )
}
