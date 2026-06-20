// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../infrastructure/httpClient'
import * as weekApi from '../infrastructure/weekApi'
import * as habitApi from '../infrastructure/habitApi'
import * as habitEntryApi from '../infrastructure/habitEntryApi'
import { toast } from 'sonner'
import type { WeekResponseDto } from '../infrastructure/weekApi'
import { useHabitDashboard } from './useHabitDashboard'

vi.mock('../infrastructure/weekApi')
vi.mock('../infrastructure/habitApi')
vi.mock('../infrastructure/habitEntryApi')
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

function buildWeekResponse(overrides: Partial<WeekResponseDto> = {}): WeekResponseDto {
  return {
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
          id: 10,
          habitId: 1,
          order: 0,
          snapshotName: 'Ejercicio 30 min',
          snapshotEmoji: '🏃',
          snapshotPoints: 5,
          snapshotPenalty: 2,
        },
        entries: [
          { id: 101, dayIndex: 0, status: 'pending' },
          { id: 102, dayIndex: 1, status: 'pending' },
          { id: 103, dayIndex: 2, status: 'pending' },
          { id: 104, dayIndex: 3, status: 'pending' },
          { id: 105, dayIndex: 4, status: 'pending' },
          { id: 106, dayIndex: 5, status: 'pending' },
          { id: 107, dayIndex: 6, status: 'pending' },
        ],
      },
    ],
    stats: {
      thisWeekPoints: 0,
      lastWeekPoints: 10,
      penalties: 0,
      maxStreak: 0,
    },
    redemptions: [],
    ...overrides,
  }
}

describe('useHabitDashboard', () => {
  beforeEach(() => {
    vi.mocked(weekApi.fetchCurrentWeek).mockResolvedValue(buildWeekResponse())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('carga la semana activa al montar', async () => {
    const { result } = renderHook(() => useHabitDashboard())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.habits).toHaveLength(1)
    expect(result.current.habits[0]).toMatchObject({
      id: '1',
      name: 'Ejercicio 30 min',
      pointsPerDay: 5,
      penalty: 2,
    })
    expect(result.current.stats).toEqual({
      thisWeekPoints: 0,
      lastWeekPoints: 10,
      penalties: 0,
      maxStreak: 0,
    })
    expect(result.current.error).toBeNull()
    expect(result.current.isWeekLocked).toBe(false)
  })

  it('handleToggleDay actualiza el estado local y llama a updateHabitEntry', async () => {
    vi.mocked(habitEntryApi.updateHabitEntry).mockResolvedValue({
      id: 101,
      status: 'completed',
      updatedAt: '2026-06-08T00:00:00.000Z',
    })

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.handleToggleDay('1', 0)
    })

    expect(result.current.habits[0].completionStatus[0]).toBe('completed')
    await waitFor(() => expect(habitEntryApi.updateHabitEntry).toHaveBeenCalledWith(101, 'completed'))
  })

  it('handleToggleDay actualiza stats.thisWeekPoints al completar', async () => {
    vi.mocked(habitEntryApi.updateHabitEntry).mockResolvedValue({
      id: 101,
      status: 'completed',
      updatedAt: '2026-06-08T00:00:00.000Z',
    })

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.stats.thisWeekPoints).toBe(0)

    act(() => {
      result.current.handleToggleDay('1', 0)
    })

    expect(result.current.stats.thisWeekPoints).toBe(5)
  })

  it('handleToggleDay actualiza stats.penalties al marcar como failed', async () => {
    vi.mocked(habitEntryApi.updateHabitEntry).mockResolvedValue({
      id: 101,
      status: 'completed',
      updatedAt: '2026-06-08T00:00:00.000Z',
    })

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    // pending → completed
    act(() => {
      result.current.handleToggleDay('1', 0)
    })
    expect(result.current.stats.penalties).toBe(0)

    vi.mocked(habitEntryApi.updateHabitEntry).mockResolvedValue({
      id: 101,
      status: 'failed',
      updatedAt: '2026-06-08T00:00:00.000Z',
    })

    // completed → failed
    act(() => {
      result.current.handleToggleDay('1', 0)
    })
    expect(result.current.stats.penalties).toBe(2)
    expect(result.current.stats.thisWeekPoints).toBe(0)
  })

  it('handleToggleDay revierte stats cuando la API falla', async () => {
    vi.mocked(habitEntryApi.updateHabitEntry).mockRejectedValue(
      new ApiError(500, 'UNKNOWN_ERROR', 'Error en la petición'),
    )

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.handleToggleDay('1', 0)
    })

    expect(result.current.stats.thisWeekPoints).toBe(5)

    await waitFor(() => expect(result.current.stats.thisWeekPoints).toBe(0))
    expect(result.current.stats.penalties).toBe(0)
  })

  it('handleToggleDay revierte el estado y muestra un toast en error', async () => {
    vi.mocked(habitEntryApi.updateHabitEntry).mockRejectedValue(
      new ApiError(500, 'UNKNOWN_ERROR', 'Error en la petición'),
    )

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.handleToggleDay('1', 0)
    })

    expect(result.current.habits[0].completionStatus[0]).toBe('completed')

    await waitFor(() => expect(result.current.habits[0].completionStatus[0]).toBe('pending'))
    expect(toast.error).toHaveBeenCalled()
  })

  it('isWeekLocked=true evita que handleToggleDay llame a updateHabitEntry', async () => {
    vi.mocked(weekApi.fetchCurrentWeek).mockResolvedValue(
      buildWeekResponse({
        week: {
          id: 1,
          startDate: '2026-06-08T00:00:00.000Z',
          endDate: '2026-06-14T23:59:59.999Z',
          isLocked: true,
          totalPointsEarned: 0,
          totalPenalties: 0,
        },
      }),
    )

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.handleToggleDay('1', 0)
    })

    expect(result.current.habits[0].completionStatus[0]).toBe('pending')
    expect(habitEntryApi.updateHabitEntry).not.toHaveBeenCalled()
  })

  it('handleToggleDay no permite toggle en días futuros de la semana actual', async () => {
    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const futureDayIndex = result.current.currentDayIndex + 1
    if (futureDayIndex <= 6) {
      act(() => {
        result.current.handleToggleDay('1', futureDayIndex)
      })

      expect(result.current.habits[0].completionStatus[futureDayIndex]).toBe('pending')
      expect(habitEntryApi.updateHabitEntry).not.toHaveBeenCalled()
    }
  })

  it('handleDeleteHabit elimina el hábito y sincroniza la semana actual', async () => {
    vi.mocked(habitApi.deleteHabit).mockResolvedValue(undefined)
    vi.mocked(weekApi.fetchCurrentWeek)
      .mockResolvedValueOnce(buildWeekResponse())
      .mockResolvedValue(buildWeekResponse({ habits: [] }))

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.handleDeleteHabit('1')
    })

    expect(result.current.habits).toHaveLength(0)
    expect(habitApi.deleteHabit).toHaveBeenCalledWith(1)
    expect(weekApi.fetchCurrentWeek).toHaveBeenCalledTimes(2)
  })

  it('handleDeleteHabit recalcula stats al eliminar un hábito con puntos', async () => {
    vi.mocked(weekApi.fetchCurrentWeek)
      .mockResolvedValueOnce(
        buildWeekResponse({
          habits: [
            {
              weekHabit: { id: 10, habitId: 1, order: 0, snapshotName: 'Ejercicio', snapshotEmoji: '🏃', snapshotPoints: 5, snapshotPenalty: 2 },
              entries: [
                { id: 101, dayIndex: 0, status: 'completed' },
                { id: 102, dayIndex: 1, status: 'failed' },
                { id: 103, dayIndex: 2, status: 'pending' },
                { id: 104, dayIndex: 3, status: 'pending' },
                { id: 105, dayIndex: 4, status: 'pending' },
                { id: 106, dayIndex: 5, status: 'pending' },
                { id: 107, dayIndex: 6, status: 'pending' },
              ],
            },
          ],
          stats: { thisWeekPoints: 5, lastWeekPoints: 10, penalties: 2, maxStreak: 1 },
        }),
      )
      .mockResolvedValue(
        buildWeekResponse({
          habits: [],
          stats: { thisWeekPoints: 0, lastWeekPoints: 10, penalties: 0, maxStreak: 0 },
        }),
      )
    vi.mocked(habitApi.deleteHabit).mockResolvedValue(undefined)

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.stats.thisWeekPoints).toBe(5)
    expect(result.current.stats.penalties).toBe(2)

    await act(async () => {
      await result.current.handleDeleteHabit('1')
    })

    expect(result.current.stats.thisWeekPoints).toBe(0)
    expect(result.current.stats.penalties).toBe(0)
    expect(result.current.stats.lastWeekPoints).toBe(10)
  })

  it('handleDeleteHabit revierte stats cuando la API falla', async () => {
    vi.mocked(weekApi.fetchCurrentWeek).mockResolvedValue(
      buildWeekResponse({
        habits: [
          {
            weekHabit: { id: 10, habitId: 1, order: 0, snapshotName: 'Ejercicio', snapshotEmoji: '🏃', snapshotPoints: 5, snapshotPenalty: 2 },
            entries: [
              { id: 101, dayIndex: 0, status: 'completed' },
              { id: 102, dayIndex: 1, status: 'pending' },
              { id: 103, dayIndex: 2, status: 'pending' },
              { id: 104, dayIndex: 3, status: 'pending' },
              { id: 105, dayIndex: 4, status: 'pending' },
              { id: 106, dayIndex: 5, status: 'pending' },
              { id: 107, dayIndex: 6, status: 'pending' },
            ],
          },
        ],
        stats: { thisWeekPoints: 5, lastWeekPoints: 10, penalties: 0, maxStreak: 1 },
      }),
    )
    vi.mocked(habitApi.deleteHabit).mockRejectedValue(
      new ApiError(500, 'UNKNOWN_ERROR', 'Error en la petición'),
    )

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.handleDeleteHabit('1')
    })

    await waitFor(() => expect(result.current.stats.thisWeekPoints).toBe(5))
    expect(result.current.stats.lastWeekPoints).toBe(10)
    expect(weekApi.fetchCurrentWeek).toHaveBeenCalledTimes(1)
  })

  it('handleDeleteHabit restaura el hábito y muestra un toast en error', async () => {
    vi.mocked(habitApi.deleteHabit).mockRejectedValue(
      new ApiError(500, 'UNKNOWN_ERROR', 'Error en la petición'),
    )

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.handleDeleteHabit('1')
    })

    expect(result.current.habits).toHaveLength(1)
    expect(result.current.habits[0].id).toBe('1')
    expect(toast.error).toHaveBeenCalled()
  })

  it('weekLoading es true durante handleWeekNav y vuelve a false', async () => {
    let resolveNav!: (v: WeekResponseDto) => void
    vi.mocked(weekApi.fetchWeekByOffset).mockImplementation(
      () => new Promise((r) => { resolveNav = r }),
    )

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.weekLoading).toBe(false)

    act(() => {
      void result.current.handleWeekNav(-1)
    })

    expect(result.current.weekLoading).toBe(true)

    await act(async () => {
      resolveNav(buildWeekResponse())
    })

    expect(result.current.weekLoading).toBe(false)
  })

  it('404 en fetchWeekByOffset → canGoBack=false y weekOffset revierte', async () => {
    vi.mocked(weekApi.fetchWeekByOffset).mockResolvedValueOnce(buildWeekResponse())

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.handleWeekNav(-1)
    })

    expect(result.current.weekOffset).toBe(-1)
    expect(result.current.canGoBack).toBe(true)

    vi.mocked(weekApi.fetchWeekByOffset).mockRejectedValueOnce(
      new ApiError(404, 'NOT_FOUND', 'No week found'),
    )

    await act(async () => {
      await result.current.handleWeekNav(-1)
    })

    expect(result.current.canGoBack).toBe(false)
    expect(result.current.weekOffset).toBe(-1)
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('race condition: dos navegaciones rápidas, solo la última aplica', async () => {
    let resolveFirst!: (v: WeekResponseDto) => void
    const firstResponse = buildWeekResponse({ habits: [] })
    const secondResponse = buildWeekResponse()

    vi.mocked(weekApi.fetchWeekByOffset)
      .mockImplementationOnce(() => new Promise((r) => { resolveFirst = r }))
      .mockResolvedValueOnce(secondResponse)

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      void result.current.handleWeekNav(-1)
    })

    await act(async () => {
      await result.current.handleWeekNav(-1)
    })

    await act(async () => {
      resolveFirst(firstResponse)
    })

    expect(result.current.habits).toHaveLength(1)
    expect(result.current.weekOffset).toBe(-2)
  })

  it('handleWeekNav llama a fetchWeekByOffset y actualiza habits/isWeekLocked/isCurrentWeek', async () => {
    vi.mocked(weekApi.fetchWeekByOffset).mockResolvedValue(
      buildWeekResponse({
        week: {
          id: 2,
          startDate: '2026-06-01T00:00:00.000Z',
          endDate: '2026-06-07T23:59:59.999Z',
          isLocked: true,
          totalPointsEarned: 5,
          totalPenalties: 0,
        },
        habits: [],
      }),
    )

    const { result } = renderHook(() => useHabitDashboard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.handleWeekNav(-1)
    })

    expect(weekApi.fetchWeekByOffset).toHaveBeenCalledWith(-1)
    expect(result.current.habits).toHaveLength(0)
    expect(result.current.isWeekLocked).toBe(true)
    expect(result.current.isCurrentWeek).toBe(false)
  })
})
