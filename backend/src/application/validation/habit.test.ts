import { describe, expect, it } from 'vitest'
import { ValidationError } from '../../domain/errors/appErrors'
import { parseUpdateHabitInput } from './habit'

describe('parseUpdateHabitInput', () => {
  it('accepts a single valid partial field', () => {
    const result = parseUpdateHabitInput({ pointsPerDay: 15 })

    expect(result).toEqual({ pointsPerDay: 15 })
  })

  it('throws ValidationError when pointsPerDay is zero', () => {
    expect(() => parseUpdateHabitInput({ pointsPerDay: 0 })).toThrow(ValidationError)
    expect(() => parseUpdateHabitInput({ pointsPerDay: 0 })).toThrow(
      expect.objectContaining({ code: 'VALIDATION_ERROR' })
    )
  })

  it('throws ValidationError when body is empty', () => {
    expect(() => parseUpdateHabitInput({})).toThrow(ValidationError)
    expect(() => parseUpdateHabitInput({})).toThrow(
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.objectContaining({ field: 'input' }),
        ]),
      })
    )
  })
})
