import type { UserReadRepository } from './ports/UserReadRepository'
import type { UserProfile } from '../domain/userProfile'
import { NotFoundError } from '../domain/errors/appErrors'

export async function getUserProfileById(
  repo: UserReadRepository,
  id: number
): Promise<UserProfile> {
  const profile = await repo.findById(id)
  if (!profile) {
    throw new NotFoundError('Usuario no encontrado')
  }
  return profile
}
