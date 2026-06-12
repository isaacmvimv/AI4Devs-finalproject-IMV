# Design — T-10-01 · Endpoint PATCH /api/habit-entries/:id

**Ticket:** T-10-01 · **User Story:** US-10 · **Change:** `t-10-01-patch-habit-entry`

## Context

Tras T-09-01/02/03, el backend persiste semanas con `HabitEntry` (7 por `WeekHabit`) y expone `GET /api/weeks/current` y `GET /api/weeks?offset=n`. No existe aún puerto ni repositorio de lectura/escritura de `HabitEntry` fuera de la creación transaccional en `createWeekHabitsWithEntriesInTx`. `createApp.ts` registra profile, habits y weeks; el error handler ya mapea `ConflictError` → 409 y `ValidationError` → 400.

| Componente | Estado actual | Objetivo T-10-01 |
|------------|---------------|------------------|
| `HabitEntry` en Prisma / dominio | Modelo y mapper en `prismaWeekHabitRepository.ts` ✅ | Reutilizar tipos `CompletionStatus`, `HabitEntry` |
| `HabitEntryRepository` | No existe | Puerto con `findByIdWithWeek` + `updateStatus` |
| `updateHabitEntry` | No existe | Caso de uso con ownership + lock check |
| `validation/habitEntry.ts` | No existe | Schema Zod `{ status }` |
| `PATCH /api/habit-entries/:id` | No existe | Ruta en `createApp.ts` |
| `docs/api-spec.yml` | Sin `/api/habit-entries/{id}` | Documentar PATCH |

Referencias: `docs/backend-standards.md` (casos de uso, `validateBody`, supertest), `docs/data-model.md` (`HabitEntry.status`, `Week.isLocked`), patrón T-08-01 (`updateHabit`, `assertHabitOwnedByUser`).

## Goals / Non-Goals

**Goals:**

- Exponer `PATCH /api/habit-entries/:id` según DoD: body `{ status }`, respuesta `{ id, status, updatedAt }`.
- Verificar cadena `HabitEntry → WeekHabit → Week`: ownership por `Week.userId` y `Week.isLocked` antes de persistir.
- Centralizar reglas en `updateHabitEntry`; handler HTTP delgado con `userId=1`.
- Tests unitarios del caso de uso + supertest con mocks (US-10 esc. 1–5).
- Actualizar `docs/api-spec.yml`.

**Non-goals:**

- Frontend (`habitEntryApi.ts`, optimistic toggle) — T-16-01+.
- `POST /api/habits/:id/toggle/:dayIndex` (planificado en OpenAPI legacy).
- Auth middleware; recálculo de totales semanales en cada PATCH.
- Migraciones Prisma; E2E Playwright.

## Decisions

### 1. Puerto `HabitEntryRepository`

**Decisión:** Nuevo puerto en `application/ports/HabitEntryRepository.ts`:

```typescript
export interface HabitEntryWithWeekContext {
  entry: HabitEntry
  weekUserId: number
  weekIsLocked: boolean
}

export interface HabitEntryRepository {
  findByIdWithWeek(entryId: number): Promise<HabitEntryWithWeekContext | null>
  updateStatus(entryId: number, status: CompletionStatus): Promise<HabitEntry>
}
```

**Rationale:** Una sola query con `include: { weekHabit: { include: { week: true } } }` evita N+1 y encapsula el join del DoD.

**Alternativa descartada:** Extender `WeekRepository` — mezcla responsabilidades de semana vs entrada diaria.

### 2. Implementación Prisma

**Decisión:** `infrastructure/prismaHabitEntryRepository.ts` con factory `createPrismaHabitEntryRepository(prisma)`. Reutilizar `mapToHabitEntry` exportándolo desde `prismaWeekHabitRepository.ts` o duplicando el mapper mínimo (preferir export compartido para DRY).

**Rationale:** Consistente con `prismaHabitRepository`, `prismaWeekRepository`.

### 3. Caso de uso `updateHabitEntry`

**Decisión:**

```typescript
export async function updateHabitEntry(
  repo: HabitEntryRepository,
  userId: number,
  entryId: number,
  input: { status: CompletionStatus }
): Promise<HabitEntry> {
  const ctx = await repo.findByIdWithWeek(entryId)
  if (!ctx || ctx.weekUserId !== userId) {
    throw new NotFoundError('Entrada de hábito no encontrada', 'HABIT_ENTRY_NOT_FOUND')
  }
  if (ctx.weekIsLocked) {
    throw new ConflictError(
      'No se puede modificar una semana bloqueada',
      'WEEK_LOCKED'
    )
  }
  return repo.updateStatus(entryId, input.status)
}
```

**Rationale:** US-10 S2/S5; `ConflictError` con code explícito `WEEK_LOCKED` (no default `CONFLICT`).

**Alternativa descartada:** `UnprocessableError` 422 — el backlog y AC especifican 409.

### 4. Validación Zod — `updateHabitEntrySchema`

**Decisión:** Nuevo `application/validation/habitEntry.ts`:

```typescript
const completionStatusSchema = z.enum(['pending', 'completed', 'failed'], {
  errorMap: () => ({
    message: 'Debe ser pending, completed o failed',
  }),
})

export const updateHabitEntrySchema = z.object({
  status: completionStatusSchema,
})
```

Middleware `validateBody(updateHabitEntrySchema)` en la ruta — validación primaria en HTTP (T-19-01).

### 5. Handler HTTP

**Decisión:**

```typescript
function parseHabitEntryIdParam(id: string): number {
  const entryId = Number.parseInt(id, 10)
  if (Number.isNaN(entryId)) {
    throw new NotFoundError('Entrada de hábito no encontrada', 'HABIT_ENTRY_NOT_FOUND')
  }
  return entryId
}

app.patch(
  '/api/habit-entries/:id',
  validateBody(updateHabitEntrySchema),
  asyncHandler(async (req, res) => {
    const entryId = parseHabitEntryIdParam(req.params.id)
    const entry = await updateHabitEntry(habitEntryRepository, 1, entryId, req.body)
    return res.status(200).json({
      id: entry.id,
      status: entry.status,
      updatedAt: entry.updatedAt.toISOString(),
    })
  })
)
```

**Rationale:** Respuesta acotada al DoD (no devolver `weekHabitId` ni `dayIndex`); `updatedAt` como ISO string en JSON.

### 6. Código de error `HABIT_ENTRY_NOT_FOUND`

**Decisión:** `NotFoundError('Entrada de hábito no encontrada', 'HABIT_ENTRY_NOT_FOUND')` para id inválido, inexistente y ownership ajeno.

**Alternativa descartada:** Reutilizar `HABIT_NOT_FOUND` — semántica incorrecta para entradas diarias.

### 7. Tests

**Decisión:**

| Archivo | Casos |
|---------|-------|
| `updateHabitEntry.test.ts` | Happy path, 404 inexistente, 404 ajeno, 409 locked, ciclo completed→failed |
| `createApp.test.ts` | `vi.mock` de `updateHabitEntry`: 200, 400 (ValidationError vía schema), 404, 409 |

**Rationale:** DoD del ticket pide supertest + mock; curl en §N+2 valida persistencia real contra seed.

### 8. Obtener entry id para curl

**Decisión:** En paso curl, obtener un `HabitEntry.id` desde `GET /api/weeks/current` → `habits[].entries[].id` (o consulta Prisma/seed). Para probar 409, usar `GET /api/weeks?offset=-1` tras forzar transición de semana o semana bloqueada del seed histórico.

### 9. Actualización `api-spec.yml`

**Decisión:** Añadir `/api/habit-entries/{id}` con operación `patch`, schemas `UpdateHabitEntryRequest` y `HabitEntryResponse`, respuestas 200/400/404/409 documentadas.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| No hay segundo usuario en seed para probar 404 ownership | Crear usuario/entry de prueba en curl o mock en unit tests; documentar en informe |
| `updatedAt` depende de `@updatedAt` Prisma | Verificar en curl que cambia tras PATCH |
| Duplicación de mapper `HabitEntry` | Exportar mapper compartido desde infraestructura |
| PATCH no recalcula puntos semanales | Comportamiento esperado; lock semanal agrega totales (T-09-02) |

## Migration Plan

1. Crear puerto + `prismaHabitEntryRepository`.
2. Crear `validation/habitEntry.ts` + tests.
3. Crear `updateHabitEntry.ts` + tests unitarios.
4. Registrar ruta en `createApp.ts`; cablear repositorio.
5. Ampliar `createApp.test.ts`.
6. `npm test`; `npm run dev:api` + curl contra seed.
7. Actualizar `docs/api-spec.yml`.

**Rollback:** Revertir puerto, caso de uso, ruta, tests y docs. Sin migración BD.

## Open Questions

_(Ninguna bloqueante — alcance cerrado por DoD del ticket.)_
