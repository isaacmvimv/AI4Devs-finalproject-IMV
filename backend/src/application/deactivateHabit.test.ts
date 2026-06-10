import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '../domain/errors/appErrors'
import type { Habit } from '../domain/habit'
import { deactivateHabit } from './deactivateHabit'
import type { HabitRepository } from './ports/HabitRepository'

describe('deactivateHabit', () => {
  const existingHabit: Habit = {
    id: 5,
    userId: 1,
    emoji: '🏃',
    name: 'Correr',
    pointsPerDay: 10,
    penalty: 5,
    isActive: true,
    createdAt: new Date('2026-06-10T10:00:00.000Z'),
  }

  const deactivatedHabit: Habit = {
    ...existingHabit,
    isActive: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('soft-deletes habit when owned by user', async () => {
    const mockRepo: HabitRepository = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingHabit),
      update: vi.fn(),
      softDelete: vi.fn().mockResolvedValue(deactivatedHabit),
    }

    const result = await deactivateHabit(mockRepo, 1, 5)

    expect(result).toEqual(deactivatedHabit)
    expect(result.isActive).toBe(false)
    expect(mockRepo.findById).toHaveBeenCalledWith(5)
    expect(mockRepo.softDelete).toHaveBeenCalledWith(5)
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when habit belongs to another user', async () => {
    const mockRepo: HabitRepository = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue({ ...existingHabit, userId: 2 }),
      update: vi.fn(),
      softDelete: vi.fn(),
    }

    await expect(deactivateHabit(mockRepo, 1, 5)).rejects.toThrow(NotFoundError)
    await expect(deactivateHabit(mockRepo, 1, 5)).rejects.toMatchObject({
      code: 'HABIT_NOT_FOUND',
    })
    expect(mockRepo.softDelete).not.toHaveBeenCalled()
  })

  it('does not mutate WeekHabit snapshots — repo only exposes Habit operations', async () => {
    const mockRepo: HabitRepository = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingHabit),
      update: vi.fn(),
      softDelete: vi.fn().mockResolvedValue(deactivatedHabit),
    }

    await deactivateHabit(mockRepo, 1, 5)

    const invokedMethods = [
      mockRepo.create,
      mockRepo.findActiveByUserId,
      mockRepo.findById,
      mockRepo.update,
      mockRepo.softDelete,
    ].filter((fn) => fn.mock.calls.length > 0)

    expect(invokedMethods).toHaveLength(2)
    expect(mockRepo.findById).toHaveBeenCalled()
    expect(mockRepo.softDelete).toHaveBeenCalled()
    expect(mockRepo.update).not.toHaveBeenCalled()
  })
})
