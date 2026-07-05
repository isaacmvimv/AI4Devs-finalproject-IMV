import { useUserProfile } from '../../application/useUserProfile'
import type { ProfileUserDto } from '../../infrastructure/profileApi'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

/** Nombre visible: `name` si está definido, si no `email`. */
function getDisplayName(user: ProfileUserDto): string {
  return user.name ?? user.email
}

/** Iniciales (hasta 2) en mayúsculas a partir del nombre visible. */
function getInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Tarjeta de “usuario logueado” en la esquina superior.
 * Petición relativa `/api/profile`: en desarrollo Vite (vite.config.ts) hace proxy al API en :3001.
 */
export default function UserProfileCard() {
  const { user, loading, error } = useUserProfile()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm max-w-xs text-left" aria-busy="true">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="size-10 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-3 w-32 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm max-w-xs text-left">
        <p className="text-sm text-gray-500">Usuario desconocido</p>
      </div>
    )
  }

  const displayName = getDisplayName(user)
  const initials = getInitials(displayName)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm max-w-xs text-left">
      <div className="flex items-center gap-3">
        <Avatar>
          {user.avatarUrl !== null && (
            <AvatarImage src={user.avatarUrl} alt={`Avatar de ${displayName}`} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate" title={displayName}>
            {displayName}
          </p>
          <p className="text-sm text-gray-600 truncate mt-0.5" title={user.email}>
            {user.email}
          </p>
        </div>
      </div>
    </div>
  )
}
