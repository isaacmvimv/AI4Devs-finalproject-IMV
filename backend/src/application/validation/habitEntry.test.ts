import { describe, expect, it } from 'vitest'
import { updateHabitEntrySchema } from './habitEntry'

describe('updateHabitEntrySchema', () => {
  it('accepts status completed', () => {
    const result = updateHabitEntrySchema.safeParse({ status: 'completed' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ status: 'completed' })
    }
  })

  it('rejects invalid status done', () => {
    const result = updateHabitEntrySchema.safeParse({ status: 'done' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['status'],
            message: 'Debe ser pending, completed o failed',
          }),
        ])
      )
    }
  })

  it('rejects empty body', () => {
    const result = updateHabitEntrySchema.safeParse({})

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: ['status'] })])
      )
    }
  })
})
