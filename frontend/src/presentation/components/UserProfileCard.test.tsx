// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UserProfileCard from './UserProfileCard'

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

describe('UserProfileCard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    cleanup()
  })

  it('muestra un skeleton mientras carga (Sc. 2)', () => {
    mockFetchOnce({
      ok: true,
      json: { id: 1, name: 'Ana García', email: 'ana@ejemplo.com', avatarUrl: null },
    })

    render(<UserProfileCard />)

    expect(screen.getByRole('generic', { busy: true } as never)).toBeInTheDocument()
    expect(screen.queryByText('undefined')).not.toBeInTheDocument()
  })

  it('muestra nombre, email y avatar con iniciales en éxito (Sc. 1)', async () => {
    mockFetchOnce({
      ok: true,
      json: { id: 1, name: 'Ana García', email: 'ana@ejemplo.com', avatarUrl: null },
    })

    render(<UserProfileCard />)

    expect(await screen.findByText('Ana García')).toBeInTheDocument()
    expect(screen.getByText('ana@ejemplo.com')).toBeInTheDocument()
    expect(screen.getByText('AG')).toBeInTheDocument()
  })

  it('muestra "Usuario desconocido" si la API falla (Sc. 3)', async () => {
    mockFetchOnce({ ok: false, status: 503, json: { error: 'Servicio no disponible' } })

    render(<UserProfileCard />)

    expect(await screen.findByText('Usuario desconocido')).toBeInTheDocument()
  })

  it('usa el email como nombre e iniciales cuando name es null (Sc. 4)', async () => {
    mockFetchOnce({
      ok: true,
      json: { id: 1, name: null, email: 'ana@ejemplo.com', avatarUrl: null },
    })

    render(<UserProfileCard />)

    await waitFor(() => expect(screen.getAllByText('ana@ejemplo.com')).toHaveLength(2))
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
