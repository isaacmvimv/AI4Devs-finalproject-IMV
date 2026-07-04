import { describe, expect, it } from 'vitest'
import type { RewardFormInput } from './reward'
import { createRewardFromFormInput } from './reward'

describe('createRewardFromFormInput', () => {
  it('maps RewardFormInput to Reward (US-13 / T-13-02)', () => {
    const input: RewardFormInput = {
      emoji: '🍕',
      name: 'Pizza',
      description: 'Pizza grande',
      cost: 50,
    }

    expect(createRewardFromFormInput(input, 'reward-abc')).toEqual({
      id: 'reward-abc',
      emoji: '🍕',
      name: 'Pizza',
      description: 'Pizza grande',
      cost: 50,
      hasBeenRedeemed: false,
    })
  })

  it('does not mutate the original input', () => {
    const input: RewardFormInput = {
      emoji: '🍕',
      name: 'Pizza',
      description: 'Pizza grande',
      cost: 50,
    }
    const snapshot = { ...input }

    createRewardFromFormInput(input, 'reward-abc')

    expect(input).toEqual(snapshot)
  })
})
