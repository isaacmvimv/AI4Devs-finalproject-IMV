import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Habit, HabitStats } from '../domain/habit'
import type { Reward } from '../domain/reward'
import { INITIAL_REWARDS } from '../domain/fixtures'
import { calculateHabitStats, calculateTodayProgressPercent, toggleHabitDayCompletion } from '../domain/habit'
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
  const [currentWeekId, setCurrentWeekId] = useState(0)
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false)
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekLoading, setWeekLoading] = useState(false)
  const [canGoBack, setCanGoBack] = useState(true)
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
        setCurrentWeekId(dto.week.id)
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

  const handleWeekNav = async (delta: number) => {
    const previousOffset = weekOffset
    const newOffset = weekOffset + delta
    setWeekOffset(newOffset)
    setWeekLoading(true)
    const requestId = ++weekRequestRef.current

    try {
      const dto = await weekApi.fetchWeekByOffset(newOffset)
      if (weekRequestRef.current !== requestId) return
      const mapped = mapWeekResponseToDashboard(dto, getCurrentDayIndexForWeek(newOffset))
      setHabits(mapped.habits)
      setStats(mapped.stats)
      setEntryIdsByHabitId(mapped.entryIdsByHabitId)
      setWeekIsLocked(mapped.isLocked)
      setCanGoBack(true)
    } catch (err) {
      if (weekRequestRef.current !== requestId) return
      if (err instanceof ApiError && err.status === 404) {
        setCanGoBack(false)
        setWeekOffset(previousOffset)
      } else {
        toast.error(errorMessage(err, 'Error al cargar la semana'))
      }
    } finally {
      if (weekRequestRef.current === requestId) {
        setWeekLoading(false)
      }
    }
  }

  const handleToggleDay = (habitId: string, dayIndex: number) => {
    if (weekIsLocked) return
    if (weekOffset === 0 && dayIndex > currentDayIndex) return

    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return

    const previousHabits = habits
    const updatedHabit = toggleHabitDayCompletion(habit, dayIndex)
    const newStatus = updatedHabit.completionStatus[dayIndex]
    const entryId = entryIdsByHabitId[habitId]?.[dayIndex]

    const newHabits = habits.map((h) => (h.id === habitId ? updatedHabit : h))
    setHabits(newHabits)

    const recalculated = calculateHabitStats(newHabits)
    setStats((prev) => ({ ...recalculated, lastWeekPoints: prev.lastWeekPoints }))

    if (entryId === undefined) return

    habitEntryApi.updateHabitEntry(entryId, newStatus).catch((err) => {
      setHabits(previousHabits)
      setStats((prev) => {
        const reverted = calculateHabitStats(previousHabits)
        return { ...reverted, lastWeekPoints: prev.lastWeekPoints }
      })
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

  const handleDeleteHabit = async (habitId: string) => {
    const index = habits.findIndex((h) => h.id === habitId)
    if (index === -1) return

    const previousHabits = habits
    const previousEntryIds = entryIdsByHabitId
    const previousStats = stats

    const remainingHabits = habits.filter((h) => h.id !== habitId)
    setHabits(remainingHabits)
    const recalculated = calculateHabitStats(remainingHabits)
    setStats((prev) => ({ ...recalculated, lastWeekPoints: prev.lastWeekPoints }))
    setEntryIdsByHabitId((prev) => {
      const next = { ...prev }
      delete next[habitId]
      return next
    })

    try {
      await habitApi.deleteHabit(Number(habitId))
      const dto = await weekApi.fetchCurrentWeek()
      const mapped = mapWeekResponseToDashboard(dto, getCurrentDayIndexForWeek(0))
      setHabits(mapped.habits)
      setStats(mapped.stats)
      setEntryIdsByHabitId(mapped.entryIdsByHabitId)
      setWeekIsLocked(mapped.isLocked)
    } catch (err) {
      setHabits(previousHabits)
      setStats(previousStats)
      setEntryIdsByHabitId(previousEntryIds)
      toast.error(errorMessage(err, 'Error al eliminar el hábito'))
    }
  }

  const handleAddReward = async (newReward: {
    emoji: string
    name: string
    description: string
    cost: number
  }): Promise<void> => {
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
    currentWeekId,
    isCurrentWeek: weekIsCurrent,
    isWeekLocked: weekIsLocked,
    weekLoading,
    canGoBack,
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
