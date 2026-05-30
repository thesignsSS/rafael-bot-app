import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail')
    .email('E-mail inválido'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
