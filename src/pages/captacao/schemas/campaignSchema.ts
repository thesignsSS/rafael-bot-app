import { z } from 'zod'

// Mesmos limites validados no backend (lead-ads.service.ts).
export const campaignSchema = z
  .object({
    name: z.string().trim().min(1, 'Dê um nome para a campanha').max(120, 'Máximo de 120 caracteres'),
    instagramMediaId: z.string().min(1, 'Escolha uma publicação'),
    budgetCents: z
      .number()
      .int()
      .min(2_000, 'O orçamento mínimo é R$ 20,00')
      .max(10_000_000, 'O orçamento máximo é R$ 100.000,00'),
    durationDays: z.number().int().min(1, 'Mínimo de 1 dia').max(90, 'Máximo de 90 dias'),
    cityKey: z.string().min(1, 'Escolha a cidade do público'),
    radiusKm: z.number().int().min(1, 'Mínimo de 1 km').max(80, 'Máximo de 80 km'),
    ageMin: z.number().int().min(18, 'Idade mínima é 18'),
    ageMax: z.number().int().max(65, 'Idade máxima é 65'),
  })
  .refine((data) => data.ageMin <= data.ageMax, {
    path: ['ageMax'],
    message: 'A idade máxima precisa ser maior que a mínima',
  })

export type CampaignFormField = keyof z.infer<typeof campaignSchema>

export const CAMPAIGN_FORM_FIELDS: readonly CampaignFormField[] = [
  'name',
  'instagramMediaId',
  'budgetCents',
  'durationDays',
  'cityKey',
  'radiusKm',
  'ageMin',
  'ageMax',
]
