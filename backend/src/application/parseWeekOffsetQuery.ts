import { ValidationError } from '../domain/errors/appErrors'

export function parseWeekOffsetQuery(offset: unknown): number {
  if (offset === undefined || offset === '') {
    return 0
  }

  const raw = Array.isArray(offset) ? offset[0] : offset
  const parsed = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number(raw)

  if (Number.isNaN(parsed)) {
    throw new ValidationError('Datos inválidos', [
      { field: 'offset', message: 'El offset debe ser un número entero' },
    ])
  }

  return parsed
}
