import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Habit, HabitStats } from '../domain/habit'
import type { Reward } from '../domain/reward'
import { INITIAL_REWARDS } from '../domain/fixtures'
import { calculateTodayProgressPercent, toggleHabitDayCompletion } from '../domain/habit'
import { createRewardFromFormInput } from '../domain/reward'
import { buildWeekData, getCurrentDayIndexForWeek } from '../domain/week'
import { ApiError } from '../infrastructure/httpClient'
import * as habitApi from '../infrastructure/habitApi'
import * as habitEntryApi from '../infrastructure/habitEntryApi'
import * as weekApi from '../infrastructure/weekApi'
import { mapWeekResponseToDashboard } from './mapWeekResponseToDashboard'

const EMPTY_STATS: HabitStats = {
  thisWeekPoints: 0,
  lastWeekPoints: 0,
  penalties: 0,
  maxStreak: 0,
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

export function useHabitDashboard() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS)
  const [stats, setStats] = useState<HabitStats>(EMPTY_STATS)
  const [entryIdsByHabitId, setEntryIdsByHabitId] = useState<Record<string, number[]>>({})
  const [weekIsLocked, setWeekIsLocked] = useState(false)
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false)
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const weekRequestRef = useRef(0)

  const totalPoints = stats.thisWeekPoints + stats.lastWeekPoints - stats.penalties

  const currentDayIndex = useMemo(() => getCurrentDayIndexForWeek(weekOffset), [weekOffset])

  const todayProgress = useMemo(
    () => calculateTodayProgressPercent(habits, currentDayIndex),
    [habits, currentDayIndex]
  )

  const weekData = useMemo(() => buildWeekData(weekOffset), [weekOffset])
  const weekIsCurrent = weekOffset === 0

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const dto = await weekApi.fetchCurrentWeek()
        if (cancelled) return
        const mapped = mapWeekResponseToDashboard(dto, getCurrentDayIndexForWeek(0))
        setHabits(mapped.habits)
        setStats(mapped.stats)
        setEntryIdsByHabitId(mapped.entryIdsByHabitId)
        setWeekIsLocked(mapped.isLocked)
      } catch (err) {
        if (cancelled) return
        setHabits([])
        setError(errorMessage(err, 'Error al cargar la semana'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleWeekNav = async (offset: number) => {
    setWeekOffset(offset)
    const requestId = ++weekRequestRef.current

    try {
      const dto = await weekApi.fetchWeekByOffset(offset)
      if (weekRequestRef.current !== requestId) return
      const mapped = mapWeekResponseToDashboard(dto, getCurrentDayIndexForWeek(offset))
      setHabits(mapped.habits)
      setStats(mapped.stats)
      setEntryIdsByHabitId(mapped.entryIdsByHabitId)
      setWeekIsLocked(mapped.isLocked)
    } catch (err) {
      if (weekRequestRef.current !== requestId) return
      toast.error(errorMessage(err, 'Error al cargar la semana'))
    }
  }

  const handleToggleDay = (habitId: string, dayIndex: number) => {
    if (weekIsLocked) return

    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return

    const previousHabits = habits
    const updatedHabit = toggleHabitDayCompletion(habit, dayIndex)
    const newStatus = updatedHabit.completionStatus[dayIndex]
    const entryId = entryIdsByHabitId[habitId]?.[dayIndex]

    setHabits(habits.map((h) => (h.id === habitId ? updatedHabit : h)))

    if (entryId === undefined) return

    habitEntryApi.updateHabitEntry(entryId, newStatus).catch((err) => {
      setHabits(previousHabits)
      toast.error(errorMessage(err, 'Error al actualizar el hábito'))
    })
  }

  const handleAddHabit = async (newHabit: {
    emoji: string
    name: string
    pointsPerDay: number
    penalty: number
  }) => {
    try {
      await habitApi.createHabit(newHabit)
      const dto = await weekApi.fetchCurrentWeek()
      const mapped = mapWeekResponseToDashboard(dto, getCurrentDayIndexForWeek(0))
      setHabits(mapped.habits)
      setStats(mapped.stats)
      setEntryIdsByHabitId(mapped.entryIdsByHabitId)
      setWeekIsLocked(mapped.isLocked)
    } catch (err) {
      toast.error(errorMessage(err, 'Error al crear el hábito'))
    }
  }

  const handleDeleteHabit = (habitId: string) => {
    const index = habits.findIndex((h) => h.id === habitId)
    if (index === -1) return

    const removedHabit = habits[index]
    const removedEntryIds = entryIdsByHabitId[habitId]

    setHabits(habits.filter((h) => h.id !== habitId))
    setEntryIdsByHabitId((prev) => {
      const next = { ...prev }
      delete next[habitId]
      return next
    })

    habitApi.deleteHabit(Number(habitId)).catch((err) => {
      setHabits((current) => {
        const restored = [...current]
        restored.splice(index, 0, removedHabit)
        return restored
      })
      if (removedEntryIds) {
        setEntryIdsByHabitId((prev) => ({ ...prev, [habitId]: removedEntryIds }))
      }
      toast.error(errorMessage(err, 'Error al eliminar el hábito'))
    })
  }

  const handleAddReward = (newReward: {
    emoji: string
    name: string
    description: string
    cost: number
  }) => {
    const reward = createRewardFromFormInput(newReward, Date.now().toString())
    setRewards([...rewards, reward])
  }

  const handleRedeemReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId)
    if (reward && totalPoints >= reward.cost) {
      alert(`¡Has canjeado: ${reward.name}! 🎉`)
    }
  }

  const handleDeleteReward = (rewardId: string) => {
    setRewards(rewards.filter((r) => r.id !== rewardId))
  }

  return {
    habits,
    rewards,
    isHabitModalOpen,
    setIsHabitModalOpen,
    isRewardModalOpen,
    setIsRewardModalOpen,
    weekOffset,
    isCurrentWeek: weekIsCurrent,
    isWeekLocked: weekIsLocked,
    loading,
    error,
    stats,
    totalPoints,
    currentDayIndex,
    todayProgress,
    weekData,
    handleWeekNav,
    handleToggleDay,
    handleAddHabit,
    handleDeleteHabit,
    handleAddReward,
    handleRedeemReward,
    handleDeleteReward,
  }
}
