// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useUserProfile } from './useUserProfile'

function mockFetchOnce(response: { ok: boolean; status?: number; json: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 503),
      json: async () => response.json,
    }),
  )
}

describe('useUserProfile', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('carga el perfil correctamente (Sc. 1)', async () => {
    mockFetchOnce({
      ok: true,
      json: { id: 1, name: 'Ana García', email: 'ana@ejemplo.com', avatarUrl: null },
    })

    const { result } = renderHook(() => useUserProfile())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.user).toEqual({
      id: 1,
      name: 'Ana García',
      email: 'ana@ejemplo.com',
      avatarUrl: null,
    })
    expect(result.current.error).toBeNull()
  })

  it('expone un error cuando la API falla (Sc. 3)', async () => {
    mockFetchOnce({ ok: false, status: 503, json: { error: 'Servicio no disponible' } })

    const { result } = renderHook(() => useUserProfile())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeTruthy()
  })
})
