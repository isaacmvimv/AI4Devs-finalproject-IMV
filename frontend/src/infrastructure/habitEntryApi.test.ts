import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './httpClient'
import { updateHabitEntry } from './habitEntryApi'

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

describe('habitEntryApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('updateHabitEntry', () => {
    it('actualiza el estado de una entrada (200)', async () => {
      mockFetchOnce({
        ok: true,
        json: {
          id: 10,
          status: 'completed',
          updatedAt: '2026-06-15T00:00:00.000Z',
          redemptionInvalidated: false,
        },
      })

      const result = await updateHabitEntry(10, 'completed')

      expect(result).toEqual({
        id: 10,
        status: 'completed',
        updatedAt: '2026-06-15T00:00:00.000Z',
        redemptionInvalidated: false,
      })
    })

    it('lanza ApiError WEEK_LOCKED cuando la semana está cerrada (409)', async () => {
      mockFetchOnce({
        ok: false,
        status: 409,
        json: { code: 'WEEK_LOCKED', message: 'La semana está cerrada' },
      })

      await expect(updateHabitEntry(10, 'completed')).rejects.toBeInstanceOf(ApiError)
      await expect(updateHabitEntry(10, 'completed')).rejects.toMatchObject({
        status: 409,
        code: 'WEEK_LOCKED',
      })
    })
  })
})
