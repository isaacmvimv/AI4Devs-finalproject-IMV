import type { CreateHabitData, Habit, UpdateHabitData } from '../../domain/habit'

export interface HabitRepository {
  create(data: CreateHabitData): Promise<Habit>
  findActiveByUserId(userId: number): Promise<Habit[]>
  findById(id: number): Promise<Habit | null>
  update(id: number, data: UpdateHabitData): Promise<Habit>
  softDelete(id: number): Promise<Habit>
}
