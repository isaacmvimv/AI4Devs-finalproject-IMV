# Design — T-09-03 · Endpoint GET /api/weeks/current y GET /api/weeks?offset=n

**Ticket:** T-09-03 · **User Story:** US-09 · **Change:** `t-09-03-endpoint-get-api-weeks-current`

## Context

T-09-01 ✅ entregó `getWeekBoundaries`, tipos de dominio, `WeekRepository`/`WeekHabitRepository`, `getCurrentWeek` y `prismaWeekRepository`. T-09-02 ✅ añadió `findUnlockedWeekBefore`, `lockWeek` y `lockWeekAndTransition`. `createApp.ts` expone profile y hábitos pero **no** rutas `/api/weeks/*`. El frontend calcula stats en memoria (`frontend/src/domain/habit.ts`); el DoD exige mover el cálculo de `stats` a aplicación backend y serializar el DTO del PRD/readme.

| Componente | Estado actual | Objetivo T-09-03 |
|------------|---------------|------------------|
| `lockWeekAndTransition` | Implementado ✅ | Invocado desde caso de uso HTTP `current` |
| `getCurrentWeek` | Implementado ✅ | Ya incluido en `lockWeekAndTransition` — no duplicar llamada |
| `WeekRepository` | CRUD semana actual + lock | + `findWeekByUserAndStartDate`, + `findLastLockedWeekBefore` |
| `createApp.ts` | Sin rutas weeks | + `GET /api/weeks/current`, + `GET /api/weeks` |
| `createApp.test.ts` | Tests profile/habits | + tests weeks con mocks |
| `docs/api-spec.yml` | Sin `/api/weeks/*` | Documentar ambos endpoints |
| Stats backend | No existe | `calculateWeekStats` en aplicación |

Referencias: `docs/backend-standards.md` (handlers delgados, supertest), `readme-entrega-2.md` (schema OpenAPI semana), `docs/data-model.md` (HabitStats, snapshots), patrón T-08-01 (`createApp` + mocks).

## Goals / Non-Goals

**Goals:**

- Exponer `GET /api/weeks/current` y `GET /api/weeks?offset=n` con DTO `{ week, habits, stats, redemptions: [] }`.
- Orquestar transición semanal vía `lockWeekAndTransition` solo en `current` y `offset=0`.
- Calcular `stats` en capa aplicación a partir de entries y snapshots.
- Consultar semanas históricas por offset sin mutar BD.
- Tests supertest + curl manual contra seed demo.
- Actualizar `docs/api-spec.yml`.

**Non-Goals:**

- Canjes, habit-entries PATCH, auth, frontend, redemptions reales.
- Cambios Prisma / migraciones.
- Refactor de `lockWeekAndTransition` o `getCurrentWeek`.
- Tests E2E.

## Decisions

### 1. Casos de uso de aplicación separados del handler

**Decisión:** Crear:

- `getCurrentWeekResponse(weekRepo, habitRepo, userId, now?)` → llama `lockWeekAndTransition`, obtiene `lastWeekPoints`, calcula stats, serializa DTO.
- `getWeekByOffset(weekRepo, habitRepo, userId, offset, now?)` → si `offset === 0`, delega en `getCurrentWeekResponse`; si `offset < 0`, calcula `startDate` desplazado, carga semana read-only, stats y DTO; si no existe → `NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND')`.

**Rationale:** DoD exige stats fuera del endpoint; patrón idéntico a `getActiveHabits` / `createHabit` en T-07-02.

**Alternativa descartada:** Lógica inline en `createApp.ts` — viola backend-standards y dificulta tests unitarios de stats.

### 2. Una sola llamada a `lockWeekAndTransition` en `/current`

**Decisión:** El handler invoca solo `getCurrentWeekResponse`, que internamente llama `lockWeekAndTransition` (ya termina en `getCurrentWeek`).

**Rationale:** El DoD menciona ambos nombres secuencialmente, pero T-09-02 ya compone el flujo; duplicar `getCurrentWeek` sería redundante y arriesga inconsistencias.

### 3. Ampliar `WeekRepository` para historial

**Decisión:** Añadir:

```typescript
findWeekByUserAndStartDate(userId: number, startDate: Date): Promise<WeekWithDetails | null>
findLastLockedWeekBefore(userId: number, beforeStartDate: Date): Promise<Week | null>
```

- `findWeekByUserAndStartDate`: `week.findFirst({ where: { userId, startDate }, include: weekHabits + habitEntries })`
- Offset: `targetStart = addUtcWeeks(getWeekBoundaries(now).startDate, offset)` con helper en `domain/week.ts` (`addUtcWeeks(startDate, weeks)` suma `weeks * 7` días UTC).
- `findLastLockedWeekBefore`: semana bloqueada más reciente con `startDate < beforeStartDate` → fuente de `lastWeekPoints` (`totalPointsEarned`).

**Alternativa descartada:** Offset por índice ordinal (1ª, 2ª semana del usuario) — el backlog y PRD definen offset respecto a la semana ISO actual.

### 4. Cálculo de `calculateWeekStats`

**Decisión:** Nuevo módulo `backend/src/application/calculateWeekStats.ts`:

```typescript
export interface WeekStats {
  thisWeekPoints: number
  penalties: number
  lastWeekPoints: number
  maxStreak: number
}

export function calculateWeekStats(
  week: WeekWithDetails,
  lastWeekPoints: number,
  currentDayIndex: number, // derivado de now UTC vs week.startDate
): WeekStats
```

- Por cada `WeekHabit`: `completed` → `+= snapshotPoints`; `failed` → `penalties += snapshotPenalty`.
- `maxStreak`: `computeStreakFromEntries(entries, currentDayIndex)` por hábito (misma lógica que `frontend/src/domain/habit.ts` `computeStreakFromStatus`), tomar máximo.
- `lastWeekPoints`: argumento desde `findLastLockedWeekBefore` (0 si null).

**Rationale:** Usar `snapshotPoints`/`snapshotPenalty` garantiza US-09 S5 en semanas bloqueadas y coherencia en semana activa (snapshots copiados al crear WeekHabit).

**Alternativa descartada:** Reutilizar `calculateHabitStats` del frontend — no compartido en monorepo backend; portar solo la lógica mínima.

### 5. Mapper DTO HTTP

**Decisión:** `backend/src/application/mapWeekToApiResponse.ts` (o función en el mismo módulo de respuesta):

- Excluir `userId` y `createdAt` del objeto `week` público (alineado a readme: `id`, `startDate`, `endDate`, `isLocked`, totales opcionales).
- `habits`: array ordenado por `weekHabit.order`; cada item `{ weekHabit, entries }` con entries ordenadas por `dayIndex`.
- Fechas → `.toISOString()` en serialización JSON (Express `res.json` con Dates o mapper explícito).

### 6. Handlers HTTP delgados y wiring

**Decisión:** En `createApp.ts`:

```typescript
const weekRepository = createPrismaWeekRepository(prisma)

app.get('/api/weeks/current', asyncHandler(async (_req, res) => {
  const payload = await getCurrentWeekResponse(weekRepository, habitRepository, 1)
  return res.status(200).json(payload)
}))

app.get('/api/weeks', asyncHandler(async (req, res) => {
  const offset = parseWeekOffsetQuery(req.query.offset) // NaN → ValidationError
  const payload = await getWeekByOffset(weekRepository, habitRepository, 1, offset)
  return res.status(200).json(payload)
}))
```

`parseWeekOffsetQuery`: entero; si ausente en `/api/weeks` → `0` o `ValidationError` según spec (requerir `offset` explícito en query — si falta, default `0` es más ergonómico para `GET /api/weeks` sin query; documentar en api-spec).

**Nota:** Para MVP, `GET /api/weeks` sin `offset` puede defaultear a `0` (equivalente a current). Offset positivo → `404` (no hay semanas futuras).

### 7. Retry tras bloqueo fallido parcial

**Decisión:** Si `lockWeekAndTransition` deja semana bloqueada pero `getCurrentWeek` falla (riesgo T-09-02), `getCurrentWeekResponse` reintenta `getCurrentWeek` una vez antes de propagar error.

**Rationale:** Design T-09-02 documentó mitigación en capa HTTP; implementación mínima sin transacción mega.

### 8. Tests

**Decisión:**

- Unit tests `calculateWeekStats.test.ts`: happy path, ceros, maxStreak.
- Unit tests `getWeekByOffset.test.ts`: offset 0 delega, offset -1 read-only, 404.
- `createApp.test.ts`: mock `getCurrentWeekResponse` / `getWeekByOffset` (patrón T-08-01).
- curl con BD real: seed demo, verificar estructura JSON, `offset=-1` si hay historial (puede requerir fixture o segunda semana manual en informe).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| `lockWeek` OK + `getCurrentWeek` falla | Retry único en `getCurrentWeekResponse`; log error |
| Offset calculado en UTC vs expectativa local | Consistente con T-09-01; documentar en curl informe |
| Seed solo tiene 1 semana → curl `offset=-1` puede 404 | Informe curl documenta caso; opcional insertar semana bloqueada de prueba |
| Query sin `offset` ambiguo | Default `0` en handler; documentar en OpenAPI |
| Stats `maxStreak` depende de `currentDayIndex` | Usar día UTC dentro de la semana retornada, no del cliente |

## Migration Plan

1. Ampliar `WeekRepository` + `prismaWeekRepository`.
2. Implementar `calculateWeekStats`, `getCurrentWeekResponse`, `getWeekByOffset`, mapper DTO.
3. Registrar rutas y cablear repositorios en `createApp.ts`.
4. Tests unitarios + supertest.
5. `npm run dev:api` + curl + actualizar `docs/api-spec.yml`.
6. Sin migración BD.

## Open Questions

_(Ninguna bloqueante — forma del DTO y algoritmo de stats están en DoD, readme y data-model.)_
