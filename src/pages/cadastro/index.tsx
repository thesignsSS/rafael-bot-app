import { AuthShell } from '../../layouts/AuthShell'
import { AuthHeader } from '../../components/ui/AuthHeader'
import { Card } from '../../components/ui/Card'
import { CadastroForm } from './components/CadastroForm'
import { SignupConfirmScreen } from './components/SignupConfirmScreen'
import { useCadastroPage } from './hooks/useCadastroPage'

export default function CadastroPage() {
  const { pendingEmail, onSignupPending } = useCadastroPage()

  return (
    <AuthShell>
      <Card>
        <AuthHeader subtitle={pendingEmail ? undefined : 'Crie sua conta'} />
        {pendingEmail ? (
          <SignupConfirmScreen email={pendingEmail} />
        ) : (
          <CadastroForm onSignupPending={onSignupPending} />
        )}
      </Card>
    </AuthShell>
  )
}
