import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Checkbox'
import { Icon } from '../../../components/ui/Icon'
import { TextField } from '../../../components/ui/TextField'
import { useCadastroForm } from '../hooks/useCadastroForm'

type CadastroFormProps = {
  onSignupPending: (email: string) => void
}

export function CadastroForm({ onSignupPending }: CadastroFormProps) {
  const {
    fullName,
    email,
    password,
    confirmPassword,
    acceptedTerms,
    showPassword,
    showConfirmPassword,
    fieldErrors,
    isSubmitting,
    handleSubmit,
    handleFullNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleAcceptedTermsChange,
    toggleShowPassword,
    toggleShowConfirmPassword,
  } = useCadastroForm({ onSignupPending })

  return (
    <form
      noValidate
      className="animate-fade-up-delay-2 space-y-6"
      onSubmit={handleSubmit}
    >
      <TextField
        id="fullName"
        label="Nome completo"
        name="fullName"
        type="text"
        autoComplete="name"
        placeholder="Seu nome completo"
        value={fullName}
        error={fieldErrors.fullName}
        onChange={(event) => handleFullNameChange(event.target.value)}
      />

      <TextField
        id="email"
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com.br"
        value={email}
        error={fieldErrors.email}
        onChange={(event) => handleEmailChange(event.target.value)}
      />

      <TextField
        id="password"
        label="Senha"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="••••••••"
        value={password}
        error={fieldErrors.password}
        onChange={(event) => handlePasswordChange(event.target.value)}
        endAdornment={
          <button
            type="button"
            className="flex size-10 items-center justify-center text-outline transition-colors hover:text-primary"
            onClick={toggleShowPassword}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Icon
              name={showPassword ? 'visibility_off' : 'visibility'}
              size={20}
            />
          </button>
        }
      />

      <TextField
        id="confirmPassword"
        label="Confirmar senha"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="••••••••"
        value={confirmPassword}
        error={fieldErrors.confirmPassword}
        onChange={(event) => handleConfirmPasswordChange(event.target.value)}
        endAdornment={
          <button
            type="button"
            className="flex size-10 items-center justify-center text-outline transition-colors hover:text-primary"
            onClick={toggleShowConfirmPassword}
            aria-label={
              showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'
            }
          >
            <Icon
              name={showConfirmPassword ? 'visibility_off' : 'visibility'}
              size={20}
            />
          </button>
        }
      />

      <Checkbox
        id="acceptedTerms"
        name="acceptedTerms"
        label="Li e aceito os Termos de Uso e a Política de Privacidade"
        checked={acceptedTerms}
        error={fieldErrors.acceptedTerms}
        onChange={(event) => handleAcceptedTermsChange(event.target.checked)}
      />

      <Button type="submit" loading={isSubmitting} icon="person_add">
        Cadastrar
      </Button>

      <div className="mt-8 border-t border-outline-variant pt-8 text-center">
        <p className="text-body-md text-on-surface-variant">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </form>
  )
}
