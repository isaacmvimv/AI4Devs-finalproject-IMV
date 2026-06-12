import { z } from 'zod'
import { ValidationError } from '../../domain/errors/appErrors'

export const createRewardSchema = z.object({
  emoji: z.string().trim().min(1, 'El emoji es obligatorio'),
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  cost: z.number().int().positive('El coste debe ser mayor que 0'),
})

export type CreateRewardInput = z.infer<typeof createRewardSchema>

export function parseCreateRewardInput(input: unknown): CreateRewardInput {
  const result = createRewardSchema.safeParse(input)
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'input',
      message: issue.message,
    }))
    throw new ValidationError('Datos inválidos', details)
  }
  return result.data
}
