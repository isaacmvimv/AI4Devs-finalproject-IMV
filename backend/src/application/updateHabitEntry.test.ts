import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConflictError, NotFoundError } from '../domain/errors/appErrors'
import type { HabitEntry } from '../domain/week'
import type { HabitEntryRepository } from './ports/HabitEntryRepository'
import { updateHabitEntry } from './updateHabitEntry'

describe('updateHabitEntry', () => {
  const sampleEntry: HabitEntry = {
    id: 42,
    weekHabitId: 10,
    dayIndex: 0,
    status: 'pending',
    updatedAt: new Date('2026-06-10T10:00:00.000Z'),
  }

  const completedEntry: HabitEntry = {
    ...sampleEntry,
    status: 'completed',
    updatedAt: new Date('2026-06-10T11:00:00.000Z'),
  }

  const failedEntry: HabitEntry = {
    ...sampleEntry,
    status: 'failed',
    updatedAt: new Date('2026-06-10T12:00:00.000Z'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates entry status on happy path (US-10 S1)', async () => {
    const mockRepo: HabitEntryRepository = {
      findByIdWithWeek: vi.fn().mockResolvedValue({
        entry: sampleEntry,
        weekUserId: 1,
        weekIsLocked: false,
      }),
      updateStatus: vi.fn().mockResolvedValue(completedEntry),
    }

    const result = await updateHabitEntry(mockRepo, 1, 42, { status: 'completed' })

    expect(result).toEqual(completedEntry)
    expect(mockRepo.findByIdWithWeek).toHaveBeenCalledWith(42)
    expect(mockRepo.updateStatus).toHaveBeenCalledWith(42, 'completed')
  })

  it('throws ConflictError when week is locked (US-10 S2)', async () => {
    const mockRepo: HabitEntryRepository = {
      findByIdWithWeek: vi.fn().mockResolvedValue({
        entry: sampleEntry,
        weekUserId: 1,
        weekIsLocked: true,
      }),
      updateStatus: vi.fn(),
    }

    await expect(updateHabitEntry(mockRepo, 1, 42, { status: 'completed' })).rejects.toThrow(
      ConflictError
    )
    await expect(updateHabitEntry(mockRepo, 1, 42, { status: 'completed' })).rejects.toMatchObject({
      code: 'WEEK_LOCKED',
      message: 'No se puede modificar una semana bloqueada',
    })
    expect(mockRepo.updateStatus).not.toHaveBeenCalled()
  })

  it('allows completed to failed transition (US-10 S3)', async () => {
    const mockRepo: HabitEntryRepository = {
      findByIdWithWeek: vi.fn().mockResolvedValue({
        entry: completedEntry,
        weekUserId: 1,
        weekIsLocked: false,
      }),
      updateStatus: vi.fn().mockResolvedValue(failedEntry),
    }

    const result = await updateHabitEntry(mockRepo, 1, 42, { status: 'failed' })

    expect(result).toEqual(failedEntry)
    expect(mockRepo.updateStatus).toHaveBeenCalledWith(42, 'failed')
  })

  it('throws NotFoundError when entry does not exist', async () => {
    const mockRepo: HabitEntryRepository = {
      findByIdWithWeek: vi.fn().mockResolvedValue(null),
      updateStatus: vi.fn(),
    }

    await expect(updateHabitEntry(mockRepo, 1, 99999, { status: 'completed' })).rejects.toThrow(
      NotFoundError
    )
    await expect(updateHabitEntry(mockRepo, 1, 99999, { status: 'completed' })).rejects.toMatchObject({
      code: 'HABIT_ENTRY_NOT_FOUND',
      message: 'Entrada de hábito no encontrada',
    })
    expect(mockRepo.updateStatus).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when entry belongs to another user (US-10 S5)', async () => {
    const mockRepo: HabitEntryRepository = {
      findByIdWithWeek: vi.fn().mockResolvedValue({
        entry: { ...sampleEntry, id: 200 },
        weekUserId: 2,
        weekIsLocked: false,
      }),
      updateStatus: vi.fn(),
    }

    await expect(updateHabitEntry(mockRepo, 1, 200, { status: 'completed' })).rejects.toThrow(
      NotFoundError
    )
    await expect(updateHabitEntry(mockRepo, 1, 200, { status: 'completed' })).rejects.toMatchObject({
      code: 'HABIT_ENTRY_NOT_FOUND',
    })
    expect(mockRepo.updateStatus).not.toHaveBeenCalled()
  })
})
