import { Calendar, Gift } from 'lucide-react'
import { useHabitDashboard } from '../application/useHabitDashboard'
import Header from './components/Header'
import ProgressBar from './components/ProgressBar'
import StatCard from './components/StatCard'
import WeeklyCalendar from './components/WeeklyCalendar'
import HabitRow from './components/HabitRow'
import RewardCard from './components/RewardCard'
import AddHabitModal from './components/AddHabitModal'
import AddRewardModal from './components/AddRewardModal'
import UserProfileCard from './components/UserProfileCard'
import { Toaster } from './components/ui/sonner'

export default function App() {
  const {
    habits,
    rewards,
    isHabitModalOpen,
    setIsHabitModalOpen,
    isRewardModalOpen,
    setIsRewardModalOpen,
    weekOffset,
    setWeekOffset,
    stats,
    totalPoints,
    currentDayIndex,
    todayProgress,
    weekData,
    handleToggleDay,
    handleAddHabit,
    handleDeleteHabit,
    handleAddReward,
    handleRedeemReward,
    handleDeleteReward,
  } = useHabitDashboard()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* relative: ancla la tarjeta de perfil arriba-derecha sin mover el título centrado */}
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 z-10 hidden sm:block">
            <UserProfileCard />
          </div>
          <Header />
        </div>

        <ProgressBar progress={todayProgress} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="📊"
            value={stats.lastWeekPoints}
            label="Semana anterior"
            bgColor="#E8F5E9"
          />
          <StatCard icon="🏆" value={stats.thisWeekPoints} label="Esta semana" bgColor="#C8E6C9" />
          <StatCard icon="⚠️" value={-stats.penalties} label="Penalizaciones" bgColor="#FFCDD2" />
          <StatCard icon="🔥" value={stats.maxStreak} label="Mejor racha" bgColor="#FFE0B2" />
        </div>

        {/* Weekly Calendar Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">Calendario semanal</h2>
            </div>
            <button
              onClick={() => setIsHabitModalOpen(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              + Nuevo hábito
            </button>
          </div>

          <WeeklyCalendar
            weekDates={weekData.dates}
            weekRange={weekData.range}
            onPrevWeek={() => setWeekOffset(weekOffset - 1)}
            onNextWeek={() => setWeekOffset(weekOffset + 1)}
            currentDayIndex={currentDayIndex}
          />

          <div className="mt-6 space-y-1">
            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                id={habit.id}
                emoji={habit.emoji}
                name={habit.name}
                points={habit.pointsPerDay}
                streak={habit.streak}
                completionStatus={habit.completionStatus}
                onToggleDay={handleToggleDay}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        </div>

        {/* Rewards Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-800">Recompensas</h2>
            </div>
            <button
              onClick={() => setIsRewardModalOpen(true)}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              + Nueva recompensa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                emoji={reward.emoji}
                name={reward.name}
                description={reward.description}
                cost={reward.cost}
                currentPoints={totalPoints}
                onRedeem={() => handleRedeemReward(reward.id)}
                onDelete={() => handleDeleteReward(reward.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddHabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onAdd={handleAddHabit}
      />

      <AddRewardModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        onAdd={handleAddReward}
      />

      <Toaster />
    </div>
  )
}
