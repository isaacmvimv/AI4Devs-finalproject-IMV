import type { NextFunction, Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { createHabitSchema } from '../../../application/validation/habit'
import { createRewardSchema } from '../../../application/validation/reward'
import { ValidationError } from '../../../domain/errors/appErrors'
import { validateBody } from './validateBody'

function invokeMiddleware(
  schema: Parameters<typeof validateBody>[0],
  body: unknown
) {
  const req = { body } as Request
  const res = {} as Response
  const next = vi.fn() as NextFunction

  validateBody(schema)(req, res, next)

  return { req, next }
}

describe('validateBody', () => {
  const simpleSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
  })

  it('calls next() without error when body is valid', () => {
    const { req, next } = invokeMiddleware(simpleSchema, { name: 'Test' })

    expect(next).toHaveBeenCalledOnce()
    expect(next).toHaveBeenCalledWith()
    expect(req.body).toEqual({ name: 'Test' })
  })

  it('calls next with ValidationError when one field is invalid', () => {
    const { next } = invokeMiddleware(simpleSchema, { name: '' })

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err).toBeInstanceOf(ValidationError)
    expect((err as ValidationError).details).toEqual([
      { field: 'name', message: 'El nombre es obligatorio' },
    ])
  })

  it('calls next with ValidationError containing multiple details', () => {
    const { next } = invokeMiddleware(createHabitSchema, { emoji: '🏃' })

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0] as ValidationError
    expect(err).toBeInstanceOf(ValidationError)
    expect(err.details).toHaveLength(3)
    expect(err.details?.map((d) => d.field)).toEqual(
      expect.arrayContaining(['name', 'pointsPerDay', 'penalty'])
    )
  })

  it('maps createRewardSchema cost: 0 to ValidationError with field cost', () => {
    const { next } = invokeMiddleware(createRewardSchema, {
      emoji: '🎁',
      name: 'Premio',
      description: 'Descripción',
      cost: 0,
    })

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0] as ValidationError
    expect(err).toBeInstanceOf(ValidationError)
    expect(err.details).toEqual(
      expect.arrayContaining([
        { field: 'cost', message: 'El coste debe ser mayor que 0' },
      ])
    )
  })
})
