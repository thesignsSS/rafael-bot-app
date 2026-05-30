import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { TextField } from '../../../components/ui/TextField'
import { useResetPasswordForm } from '../hooks/useResetPasswordForm'

export function ResetPasswordForm() {
  const {
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    fieldErrors,
    isSubmitting,
    handleSubmit,
    handlePasswordChange,
    handleConfirmPasswordChange,
    toggleShowPassword,
    toggleShowConfirmPassword,
  } = useResetPasswordForm()

  return (
    <form
      noValidate
      className="animate-fade-up-delay-2 space-y-6"
      onSubmit={handleSubmit}
    >
      <p className="text-body-md text-on-surface-variant">
        Escolha uma nova senha para sua conta.
      </p>

      <TextField
        id="password"
        label="Nova senha"
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
        label="Confirmar nova senha"
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

      <Button type="submit" loading={isSubmitting} icon="lock_reset">
        Redefinir senha
      </Button>
    </form>
  )
}
