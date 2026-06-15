export type ApiGetResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string }

/** Respuesta de error estándar del middleware errorHandler (ApiErrorResponse). */
interface ApiErrorResponse {
  code: string
  message: string
  details?: unknown
}

/** Error tipado lanzado por `apiRequest` para respuestas no-2xx o fallos de red. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Realiza una petición a `/api` + path lanzando `ApiError` en respuestas no-2xx
 * o fallos de red. Devuelve `undefined` para respuestas `204 No Content`.
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  let res: Response
  try {
    res = await fetch('/api' + path, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Sin conexión con el servidor (¿npm run dev:api?)')
  }

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => null)) as ApiErrorResponse | null
    throw new ApiError(
      res.status,
      errorBody?.code ?? 'UNKNOWN_ERROR',
      errorBody?.message ?? 'Error en la petición',
      errorBody?.details,
    )
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

export async function apiGet<T>(path: string): Promise<ApiGetResult<T>> {
  try {
    const res = await fetch('/api' + path)
    const body = (await res.json()) as T | { error?: string }

    if (!res.ok) {
      const message =
        typeof body === 'object' &&
        body !== null &&
        'error' in body &&
        typeof body.error === 'string'
          ? body.error
          : 'Error en la petición'
      return { ok: false, status: res.status, message }
    }

    return { ok: true, data: body as T }
  } catch {
    return {
      ok: false,
      status: 0,
      message: 'Sin conexión con el servidor (¿npm run dev:api?)',
    }
  }
}
