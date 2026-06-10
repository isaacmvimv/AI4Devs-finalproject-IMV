import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotFoundError, ValidationError } from '../domain/errors/appErrors'
import type { Habit } from '../domain/habit'
import type { HabitRepository } from './ports/HabitRepository'
import { updateHabit } from './updateHabit'

describe('updateHabit', () => {
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

  const updatedHabit: Habit = {
    ...existingHabit,
    pointsPerDay: 15,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates habit when owned by user and input is valid', async () => {
    const mockRepo: HabitRepository = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingHabit),
      update: vi.fn().mockResolvedValue(updatedHabit),
      softDelete: vi.fn(),
    }

    const result = await updateHabit(mockRepo, 1, 5, { pointsPerDay: 15 })

    expect(result).toEqual(updatedHabit)
    expect(mockRepo.findById).toHaveBeenCalledWith(5)
    expect(mockRepo.update).toHaveBeenCalledWith(5, { pointsPerDay: 15 })
  })

  it('throws NotFoundError when habit belongs to another user', async () => {
    const mockRepo: HabitRepository = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue({ ...existingHabit, userId: 2 }),
      update: vi.fn(),
      softDelete: vi.fn(),
    }

    await expect(updateHabit(mockRepo, 1, 5, { pointsPerDay: 15 })).rejects.toThrow(
      NotFoundError
    )
    await expect(updateHabit(mockRepo, 1, 5, { pointsPerDay: 15 })).rejects.toMatchObject({
      code: 'HABIT_NOT_FOUND',
      message: 'Hábito no encontrado',
    })
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when habit does not exist', async () => {
    const mockRepo: HabitRepository = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      softDelete: vi.fn(),
    }

    await expect(updateHabit(mockRepo, 1, 99999, { pointsPerDay: 15 })).rejects.toThrow(
      NotFoundError
    )
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('throws ValidationError when input is invalid', async () => {
    const mockRepo: HabitRepository = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingHabit),
      update: vi.fn(),
      softDelete: vi.fn(),
    }

    await expect(updateHabit(mockRepo, 1, 5, {})).rejects.toThrow(ValidationError)
    expect(mockRepo.update).not.toHaveBeenCalled()
  })
})
