import { z } from 'zod'

export const redeemRewardSchema = z.object({
  rewardId: z.number().int().positive({ message: 'Debe ser un entero positivo' }),
})

export type RedeemRewardInput = z.infer<typeof redeemRewardSchema>
