import { useCallback, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { mapFieldErrors } from '../../../lib/mapFieldErrors'
import { supabase } from '../../../lib/supabase'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schemas/forgotPasswordSchema'

type UseForgotPasswordFormOptions = {
  onEmailSent: (email: string) => void
}

export function useForgotPasswordForm({ onEmailSent }: UseForgotPasswordFormOptions) {
  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ForgotPasswordFormData, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value)
    setFieldErrors((prev) =>
      prev.email ? { ...prev, email: undefined } : prev,
    )
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const result = forgotPasswordSchema.safeParse({ email })

      if (!result.success) {
        setFieldErrors(
          mapFieldErrors(['email'], result.error.flatten().fieldErrors),
        )
        return
      }

      setFieldErrors({})
      setIsSubmitting(true)

      const { error } = await supabase.auth.resetPasswordForEmail(
        result.data.email,
        {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        },
      )

      setIsSubmitting(false)

      if (error) {
        toast.error('Não foi possível enviar. Tente novamente.')
        return
      }

      onEmailSent(result.data.email)
    },
    [email, onEmailSent],
  )

  return {
    email,
    fieldErrors,
    isSubmitting,
    handleSubmit,
    handleEmailChange,
  }
}
