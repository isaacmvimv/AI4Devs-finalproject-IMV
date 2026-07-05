export interface Habit {
  id: number
  userId: number
  emoji: string
  name: string
  pointsPerDay: number
  penalty: number
  isActive: boolean
  createdAt: Date
}

export interface CreateHabitData {
  userId: number
  emoji: string
  name: string
  pointsPerDay: number
  penalty: number
}

export interface UpdateHabitData {
  emoji?: string
  name?: string
  pointsPerDay?: number
  penalty?: number
}
