import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Habit } from '../domain/habit'
import { getActiveHabits } from './getActiveHabits'
import type { HabitRepository } from './ports/HabitRepository'

describe('getActiveHabits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('should_return_active_habits_from_repository', () => {
    it('returns the same array the repository provides', async () => {
      const habits: Habit[] = [
        {
          id: 1,
          userId: 1,
          emoji: '🏃',
          name: 'Correr',
          pointsPerDay: 10,
          penalty: 5,
          isActive: true,
          createdAt: new Date('2026-06-10T10:00:00.000Z'),
        },
        {
          id: 2,
          userId: 1,
          emoji: '📚',
          name: 'Leer',
          pointsPerDay: 5,
          penalty: 2,
          isActive: true,
          createdAt: new Date('2026-06-10T11:00:00.000Z'),
        },
      ]
      const mockRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn().mockResolvedValue(habits),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }

      const result = await getActiveHabits(mockRepo, 1)

      expect(result).toEqual(habits)
      expect(mockRepo.findActiveByUserId).toHaveBeenCalledWith(1)
    })
  })

  describe('should_return_empty_array_when_no_active_habits', () => {
    it('returns empty array when repository returns no habits', async () => {
      const mockRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn().mockResolvedValue([]),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }

      const result = await getActiveHabits(mockRepo, 1)

      expect(result).toEqual([])
      expect(mockRepo.findActiveByUserId).toHaveBeenCalledWith(1)
    })
  })
})
