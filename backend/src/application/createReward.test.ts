import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ValidationError } from '../domain/errors/appErrors'
import type { Reward } from '../domain/reward'
import { createReward } from './createReward'
import type { RewardRepository } from './ports/RewardRepository'

describe('createReward', () => {
  const validInput = {
    emoji: '🎁',
    name: 'Helado',
    description: 'Un helado de vainilla',
    cost: 50,
  }

  const createdReward: Reward = {
    id: 1,
    userId: 1,
    emoji: '🎁',
    name: 'Helado',
    description: 'Un helado de vainilla',
    cost: 50,
    isActive: true,
    createdAt: new Date('2026-06-10T10:00:00.000Z'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('should_create_reward_when_input_is_valid', () => {
    it('calls repo.create with userId and validated fields and returns reward', async () => {
      const mockRepo: RewardRepository = {
        create: vi.fn().mockResolvedValue(createdReward),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        softDelete: vi.fn(),
      }

      const result = await createReward(mockRepo, 1, validInput)

      expect(result).toEqual(createdReward)
      expect(mockRepo.create).toHaveBeenCalledOnce()
      expect(mockRepo.create).toHaveBeenCalledWith({
        userId: 1,
        emoji: '🎁',
        name: 'Helado',
        description: 'Un helado de vainilla',
        cost: 50,
      })
    })
  })

  describe('should_throw_validation_error_when_cost_is_zero', () => {
    it('throws ValidationError and does not call create when cost is zero', async () => {
      const mockRepo: RewardRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        softDelete: vi.fn(),
      }

      await expect(createReward(mockRepo, 1, { ...validInput, cost: 0 })).rejects.toThrow(
        ValidationError
      )
      await expect(createReward(mockRepo, 1, { ...validInput, cost: 0 })).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
      })
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('should_throw_validation_error_when_name_is_empty', () => {
    it('throws ValidationError and does not call create when name is empty', async () => {
      const mockRepo: RewardRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        softDelete: vi.fn(),
      }

      await expect(createReward(mockRepo, 1, { ...validInput, name: '' })).rejects.toThrow(
        ValidationError
      )
      expect(mockRepo.create).not.toHaveBeenCalled()
    })

    it('throws ValidationError and does not call create when name is missing', async () => {
      const mockRepo: RewardRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        softDelete: vi.fn(),
      }
      const { name: _name, ...inputWithoutName } = validInput

      await expect(createReward(mockRepo, 1, inputWithoutName)).rejects.toThrow(ValidationError)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('should_throw_validation_error_when_emoji_missing', () => {
    it('throws ValidationError when emoji is absent', async () => {
      const mockRepo: RewardRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        softDelete: vi.fn(),
      }
      const { emoji: _emoji, ...inputWithoutEmoji } = validInput

      await expect(createReward(mockRepo, 1, inputWithoutEmoji)).rejects.toThrow(ValidationError)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })
})
