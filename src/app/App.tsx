import { useState } from 'react';
import { Calendar, Gift } from 'lucide-react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import StatCard from './components/StatCard';
import WeeklyCalendar from './components/WeeklyCalendar';
import HabitRow from './components/HabitRow';
import RewardCard from './components/RewardCard';
import AddHabitModal from './components/AddHabitModal';
import AddRewardModal from './components/AddRewardModal';
import UserProfileCard from './components/UserProfileCard';

interface Habit {
  id: string;
  emoji: string;
  name: string;
  pointsPerDay: number;
  penalty: number;
  streak: number;
  completionStatus: Array<'completed' | 'failed' | 'pending'>;
}

interface Reward {
  id: string;
  emoji: string;
  name: string;
  description: string;
  cost: number;
}

const INITIAL_HABITS: Habit[] = [
  {
    id: '1',
    emoji: '🏋️',
    name: 'Ejercicio 30 min',
    pointsPerDay: 5,
    penalty: 2,
    streak: 2,
    completionStatus: ['completed', 'completed', 'pending', 'pending', 'pending', 'pending', 'pending']
  },
  {
    id: '2',
    emoji: '📚',
    name: 'Leer 20 páginas',
    pointsPerDay: 3,
    penalty: 1,
    streak: 0,
    completionStatus: ['completed', 'failed', 'pending', 'pending', 'pending', 'pending', 'pending']
  },
  {
    id: '3',
    emoji: '😴',
    name: 'Dormir 8 horas',
    pointsPerDay: 4,
    penalty: 2,
    streak: 0,
    completionStatus: ['completed', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending']
  },
  {
    id: '4',
    emoji: '🚫',
    name: 'Sin redes sociales',
    pointsPerDay: 3,
    penalty: 1,
    streak: 0,
    completionStatus: ['completed', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending']
  },
  {
    id: '5',
    emoji: '🐶',
    name: 'Pasear la mascota',
    pointsPerDay: 2,
    penalty: 1,
    streak: 0,
    completionStatus: ['completed', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending']
  }
];

const INITIAL_REWARDS: Reward[] = [
  {
    id: '1',
    emoji: '📺',
    name: 'Película favorita',
    description: 'Disfruta de una película sin culpa',
    cost: 39
  },
  {
    id: '2',
    emoji: '🍕',
    name: 'Comida especial',
    description: 'Pide tu comida favorita',
    cost: 69
  },
  {
    id: '3',
    emoji: '🏖️',
    name: 'Día libre',
    description: 'Un día completo de descanso',
    cost: 139
  },
  {
    id: '4',
    emoji: '🎁',
    name: 'Capricho personal',
    description: 'Compra algo que desees',
    cost: 189
  }
];

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate statistics
  const calculateStats = () => {
    let thisWeekPoints = 0;
    let lastWeekPoints = 72;
    let penalties = 0;
    let maxStreak = 0;

    habits.forEach(habit => {
      habit.completionStatus.forEach((status) => {
        if (status === 'completed') thisWeekPoints += habit.pointsPerDay;
        if (status === 'failed') penalties += habit.penalty;
      });
      if (habit.streak > maxStreak) maxStreak = habit.streak;
    });

    return { thisWeekPoints, lastWeekPoints, penalties, maxStreak };
  };

  const stats = calculateStats();
  const totalPoints = stats.thisWeekPoints + stats.lastWeekPoints - stats.penalties;

  // Determine current day index in the week (0 = Monday, 6 = Sunday)
  const getCurrentDayIndex = () => {
    if (weekOffset !== 0) return -1; // Not current week
    const today = new Date();
    const currentDay = today.getDay();
    // Convert Sunday (0) to 6, and Monday (1) to 0
    return currentDay === 0 ? 6 : currentDay - 1;
  };

  const currentDayIndex = getCurrentDayIndex();

  // Calculate progress (percentage of habits completed TODAY)
  const todayProgress = habits.length > 0 && currentDayIndex >= 0
    ? Math.round((habits.filter(h => h.completionStatus[currentDayIndex] === 'completed').length / habits.length) * 100)
    : 0;

  // Generate week dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (weekOffset * 7));

    const dates = [];
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push({
        day: days[i],
        date: date.getDate()
      });
    }

    const startDate = dates[0].date;
    const endDate = dates[6].date;
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthName = monthNames[monday.getMonth()];

    return {
      dates,
      range: `${startDate} – ${endDate} De ${monthName}`
    };
  };

  const weekData = getWeekDates();

  const handleToggleDay = (habitId: string, dayIndex: number) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newStatus = [...habit.completionStatus];
        const currentStatus = newStatus[dayIndex];

        if (currentStatus === 'pending') {
          newStatus[dayIndex] = 'completed';
        } else if (currentStatus === 'completed') {
          newStatus[dayIndex] = 'failed';
        } else {
          newStatus[dayIndex] = 'pending';
        }

        // Update streak
        let newStreak = 0;
        for (let i = 0; i < newStatus.length; i++) {
          if (newStatus[i] === 'completed') {
            newStreak++;
          } else {
            break;
          }
        }

        return { ...habit, completionStatus: newStatus, streak: newStreak };
      }
      return habit;
    }));
  };

  const handleAddHabit = (newHabit: { emoji: string; name: string; pointsPerDay: number; penalty: number }) => {
    const habit: Habit = {
      id: Date.now().toString(),
      ...newHabit,
      streak: 0,
      completionStatus: ['pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending']
    };
    setHabits([...habits, habit]);
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const handleAddReward = (newReward: { emoji: string; name: string; description: string; cost: number }) => {
    const reward: Reward = {
      id: Date.now().toString(),
      ...newReward
    };
    setRewards([...rewards, reward]);
  };

  const handleRedeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && totalPoints >= reward.cost) {
      alert(`¡Has canjeado: ${reward.name}! 🎉`);
    }
  };

  const handleDeleteReward = (rewardId: string) => {
    setRewards(rewards.filter(r => r.id !== rewardId));
  };

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
          <StatCard
            icon="🏆"
            value={stats.thisWeekPoints}
            label="Esta semana"
            bgColor="#C8E6C9"
          />
          <StatCard
            icon="⚠️"
            value={-stats.penalties}
            label="Penalizaciones"
            bgColor="#FFCDD2"
          />
          <StatCard
            icon="🔥"
            value={stats.maxStreak}
            label="Mejor racha"
            bgColor="#FFE0B2"
          />
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
            {habits.map(habit => (
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
            {rewards.map(reward => (
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
    </div>
  );
}
