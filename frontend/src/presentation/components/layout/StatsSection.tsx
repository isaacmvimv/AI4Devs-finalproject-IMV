import type { ReactNode } from 'react'
import { Skeleton } from '../ui/skeleton'

interface StatsSectionProps {
  loading?: boolean
  children: ReactNode
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-6 w-12" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export default function StatsSection({ loading, children }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {loading
        ? Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
        : children}
    </div>
  )
}
