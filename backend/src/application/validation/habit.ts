import { z } from 'zod'
import { ValidationError } from '../../domain/errors/appErrors'

const createHabitSchema = z.object({
  emoji: z.string().trim().min(1, 'El emoji es obligatorio'),
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  pointsPerDay: z
    .number()
    .int()
    .positive('Los puntos por día deben ser mayores que 0'),
  penalty: z.number().int().min(0, 'La penalización no puede ser negativa'),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>

export function parseCreateHabitInput(input: unknown): CreateHabitInput {
  const result = createHabitSchema.safeParse(input)
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'input',
      message: issue.message,
    }))
    throw new ValidationError('Datos inválidos', details)
  }
  return result.data
}

const updateHabitSchema = z
  .object({
    emoji: z.string().trim().min(1, 'El emoji es obligatorio').optional(),
    name: z.string().trim().min(1, 'El nombre es obligatorio').optional(),
    pointsPerDay: z
      .number()
      .int()
      .positive('Los puntos por día deben ser mayores que 0')
      .optional(),
    penalty: z.number().int().min(0, 'La penalización no puede ser negativa').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar',
    path: ['input'],
  })

export type UpdateHabitInput = z.infer<typeof updateHabitSchema>

export function parseUpdateHabitInput(input: unknown): UpdateHabitInput {
  const result = updateHabitSchema.safeParse(input)
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'input',
      message: issue.message,
    }))
    throw new ValidationError('Datos inválidos', details)
  }
  return result.data
}
