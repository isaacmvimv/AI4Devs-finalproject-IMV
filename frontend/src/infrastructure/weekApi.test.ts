import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './httpClient'
import { fetchCurrentWeek, fetchWeekByOffset } from './weekApi'
import type { WeekResponseDto } from './weekApi'

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

const weekResponseDto: WeekResponseDto = {
  week: {
    id: 1,
    startDate: '2026-06-08T00:00:00.000Z',
    endDate: '2026-06-14T23:59:59.999Z',
    isLocked: false,
    totalPointsEarned: 0,
    totalPenalties: 0,
  },
  habits: [
    {
      weekHabit: {
        id: 1,
        habitId: 1,
        order: 0,
        snapshotName: 'Ejercicio 30 min',
        snapshotPoints: 5,
        snapshotPenalty: 2,
      },
      entries: [
        { id: 1, dayIndex: 0, status: 'completed' },
        { id: 2, dayIndex: 1, status: 'pending' },
        { id: 3, dayIndex: 2, status: 'pending' },
        { id: 4, dayIndex: 3, status: 'pending' },
        { id: 5, dayIndex: 4, status: 'pending' },
        { id: 6, dayIndex: 5, status: 'pending' },
        { id: 7, dayIndex: 6, status: 'pending' },
      ],
    },
  ],
  stats: {
    thisWeekPoints: 5,
    lastWeekPoints: 0,
    penalties: 0,
    maxStreak: 1,
  },
  redemptions: [],
}

describe('weekApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('fetchCurrentWeek', () => {
    it('devuelve la semana activa (200)', async () => {
      mockFetchOnce({ ok: true, json: weekResponseDto })

      const result = await fetchCurrentWeek()

      expect(result).toEqual(weekResponseDto)
    })
  })

  describe('fetchWeekByOffset', () => {
    it('devuelve una semana histórica bloqueada (200)', async () => {
      const lockedWeek: WeekResponseDto = {
        ...weekResponseDto,
        week: { ...weekResponseDto.week, isLocked: true },
      }
      mockFetchOnce({ ok: true, json: lockedWeek })

      const result = await fetchWeekByOffset(-1)

      expect(result).toEqual(lockedWeek)
    })

    it('lanza ApiError WEEK_NOT_FOUND (404)', async () => {
      mockFetchOnce({
        ok: false,
        status: 404,
        json: { code: 'WEEK_NOT_FOUND', message: 'Semana no encontrada' },
      })

      await expect(fetchWeekByOffset(-99)).rejects.toBeInstanceOf(ApiError)
      await expect(fetchWeekByOffset(-99)).rejects.toMatchObject({
        status: 404,
        code: 'WEEK_NOT_FOUND',
      })
    })
  })
})
