import { z } from 'zod'

const completionStatusSchema = z.enum(['pending', 'completed', 'failed'], {
  error: 'Debe ser pending, completed o failed',
})

export const updateHabitEntrySchema = z.object({
  status: completionStatusSchema,
})

export type UpdateHabitEntryInput = z.infer<typeof updateHabitEntrySchema>
