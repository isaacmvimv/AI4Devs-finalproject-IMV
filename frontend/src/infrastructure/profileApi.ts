/** Contrato JSON de GET /api/profile (alineado con el backend). */
export interface ProfileUserDto {
  id: number
  name: string | null
  email: string
}

export type ProfileApiResult = { ok: true; user: ProfileUserDto } | { ok: false; error: string }

export async function fetchUserProfile(): Promise<ProfileApiResult> {
  try {
    const res = await fetch('/api/profile')
    const body = (await res.json()) as ProfileUserDto | { error?: string }

    if (!res.ok) {
      const message =
        'error' in body && typeof body.error === 'string'
          ? body.error
          : 'No se pudo cargar el perfil'
      return { ok: false, error: message }
    }

    return { ok: true, user: body as ProfileUserDto }
  } catch {
    return {
      ok: false,
      error: 'Sin conexión con el servidor (¿npm run dev:api?)',
    }
  }
}
