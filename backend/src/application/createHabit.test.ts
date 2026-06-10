import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ValidationError } from '../domain/errors/appErrors'
import type { Habit } from '../domain/habit'
import { createHabit } from './createHabit'
import type { HabitRepository } from './ports/HabitRepository'

describe('createHabit', () => {
  const validInput = {
    emoji: '🏃',
    name: 'Correr',
    pointsPerDay: 10,
    penalty: 5,
  }

  const createdHabit: Habit = {
    id: 1,
    userId: 1,
    emoji: '🏃',
    name: 'Correr',
    pointsPerDay: 10,
    penalty: 5,
    isActive: true,
    createdAt: new Date('2026-06-10T10:00:00.000Z'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('should_create_habit_when_input_is_valid', () => {
    it('calls repo.create with userId and validated fields and returns habit', async () => {
      const mockRepo: HabitRepository = {
        create: vi.fn().mockResolvedValue(createdHabit),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }

      const result = await createHabit(mockRepo, 1, validInput)

      expect(result).toEqual(createdHabit)
      expect(mockRepo.create).toHaveBeenCalledOnce()
      expect(mockRepo.create).toHaveBeenCalledWith({
        userId: 1,
        emoji: '🏃',
        name: 'Correr',
        pointsPerDay: 10,
        penalty: 5,
      })
    })
  })

  describe('should_throw_validation_error_when_name_is_empty', () => {
    it('throws ValidationError and does not call create when name is empty', async () => {
      const mockRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }

      await expect(createHabit(mockRepo, 1, { ...validInput, name: '' })).rejects.toThrow(
        ValidationError
      )
      await expect(createHabit(mockRepo, 1, { ...validInput, name: '' })).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
      })
      expect(mockRepo.create).not.toHaveBeenCalled()
    })

    it('throws ValidationError and does not call create when name is missing', async () => {
      const mockRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }
      const { name: _name, ...inputWithoutName } = validInput

      await expect(createHabit(mockRepo, 1, inputWithoutName)).rejects.toThrow(ValidationError)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('should_throw_validation_error_when_points_per_day_invalid', () => {
    it('throws ValidationError when pointsPerDay is zero', async () => {
      const mockRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }

      await expect(
        createHabit(mockRepo, 1, { ...validInput, pointsPerDay: 0 })
      ).rejects.toThrow(ValidationError)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('should_throw_validation_error_when_emoji_missing', () => {
    it('throws ValidationError when emoji is absent', async () => {
      const mockRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }
      const { emoji: _emoji, ...inputWithoutEmoji } = validInput

      await expect(createHabit(mockRepo, 1, inputWithoutEmoji)).rejects.toThrow(ValidationError)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('should_throw_validation_error_when_penalty_negative', () => {
    it('throws ValidationError when penalty is negative', async () => {
      const mockRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }

      await expect(
        createHabit(mockRepo, 1, { ...validInput, penalty: -1 })
      ).rejects.toThrow(ValidationError)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })
})
