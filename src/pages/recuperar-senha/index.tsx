import { AuthShell } from '../../layouts/AuthShell'
import { AuthHeader } from '../../components/ui/AuthHeader'
import { Card } from '../../components/ui/Card'
import { ForgotPasswordForm } from './components/ForgotPasswordForm'
import { ResetEmailConfirmScreen } from './components/ResetEmailConfirmScreen'
import { useRecuperarSenhaPage } from './hooks/useRecuperarSenhaPage'

export default function RecuperarSenhaPage() {
  const { pendingEmail, onEmailSent } = useRecuperarSenhaPage()

  return (
    <AuthShell>
      <Card>
        <AuthHeader subtitle={pendingEmail ? undefined : 'Recuperar senha'} />
        {pendingEmail ? (
          <ResetEmailConfirmScreen email={pendingEmail} />
        ) : (
          <ForgotPasswordForm onEmailSent={onEmailSent} />
        )}
      </Card>
    </AuthShell>
  )
}
