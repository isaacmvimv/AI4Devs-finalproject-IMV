import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './httpClient'
import { createHabit, deleteHabit, fetchHabits } from './habitApi'

function mockFetchOnce(response: { ok: boolean; status?: number; json?: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 500),
      json: async () => response.json,
    }),
  )
}

const habitDto = {
  id: 1,
  userId: 1,
  emoji: '🏃',
  name: 'Correr',
  pointsPerDay: 10,
  penalty: 5,
  isActive: true,
  createdAt: '2026-06-01T00:00:00.000Z',
}

describe('habitApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('fetchHabits', () => {
    it('devuelve la lista de hábitos (200)', async () => {
      mockFetchOnce({ ok: true, json: [habitDto] })

      const result = await fetchHabits()

      expect(result).toEqual([habitDto])
    })
  })

  describe('createHabit', () => {
    it('crea un hábito (201)', async () => {
      mockFetchOnce({ ok: true, status: 201, json: habitDto })

      const result = await createHabit({
        emoji: '🏃',
        name: 'Correr',
        pointsPerDay: 10,
        penalty: 5,
      })

      expect(result).toEqual(habitDto)
    })

    it('lanza ApiError con details en error de validación (400)', async () => {
      mockFetchOnce({
        ok: false,
        status: 400,
        json: {
          code: 'VALIDATION_ERROR',
          message: 'Datos inválidos',
          details: [{ field: 'name', message: 'Requerido' }],
        },
      })

      await expect(
        createHabit({ emoji: '🏃', name: '', pointsPerDay: 10, penalty: 5 }),
      ).rejects.toMatchObject({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        details: [{ field: 'name', message: 'Requerido' }],
      })
    })
  })

  describe('deleteHabit', () => {
    it('elimina un hábito (204)', async () => {
      mockFetchOnce({ ok: true, status: 204 })

      const result = await deleteHabit(1)

      expect(result).toBeUndefined()
    })

    it('lanza ApiError HABIT_NOT_FOUND (404)', async () => {
      mockFetchOnce({
        ok: false,
        status: 404,
        json: { code: 'HABIT_NOT_FOUND', message: 'Hábito no encontrado' },
      })

      await expect(deleteHabit(999)).rejects.toBeInstanceOf(ApiError)
      await expect(deleteHabit(999)).rejects.toMatchObject({
        status: 404,
        code: 'HABIT_NOT_FOUND',
      })
    })
  })
})
