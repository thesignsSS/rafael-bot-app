import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { TextField } from '../../../components/ui/TextField'
import { useLoginForm } from '../hooks/useLoginForm'

export function LoginForm() {
  const {
    email,
    password,
    showPassword,
    fieldErrors,
    isSubmitting,
    handleSubmit,
    handleEmailChange,
    handlePasswordChange,
    toggleShowPassword,
  } = useLoginForm()

  return (
    <form
      noValidate
      className="animate-fade-up-delay-2 space-y-6"
      onSubmit={handleSubmit}
    >
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
        autoComplete="current-password"
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

      <div className="flex items-center justify-end">
        <Link
          to="/recuperar-senha"
          className="text-label-md font-medium text-primary transition-all hover:underline"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <Button type="submit" loading={isSubmitting} icon="login">
        Entrar
      </Button>

      <div className="mt-8 border-t border-outline-variant pt-8 text-center">
        <p className="text-body-md text-on-surface-variant">
          Ainda não tem uma conta?{' '}
          <Link
            to="/cadastro"
            className="font-semibold text-primary hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </form>
  )
}
