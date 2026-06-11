# Design — T-09-02 · Caso de uso: bloquear semana anterior y transición semanal

**Ticket:** T-09-02 · **User Story:** US-09 · **Change:** `t-09-02-bloquear-semana-anterior-y-transicion`

## Context

T-09-01 ✅ entregó dominio (`getWeekBoundaries`, tipos), puertos `WeekRepository`/`WeekHabitRepository`, repositorios Prisma y `getCurrentWeek`. Las semanas nuevas ya copian snapshots iniciales del hábito maestro al crear `WeekHabit`, pero **no hay bloqueo** ni recálculo de totales. El PRD y `docs/data-model.md` exigen snapshots definitivos e historial inmutable al bloquear.

| Componente | Estado actual | Objetivo T-09-02 |
|------------|---------------|------------------|
| `WeekRepository` | `findCurrentWeek`, `createWeekWithHabitsAndEntries` | + `findUnlockedWeekBefore`, `lockWeek` |
| `prismaWeekRepository.ts` | Creación transaccional ✅ | + `lockWeek` con JOIN entries/habits |
| `getCurrentWeek.ts` | Detección/creación semana actual ✅ | Reutilizado sin cambios |
| `lockWeekAndTransition.ts` | No existe | Orquestación transición |
| `lockWeekAndTransition.test.ts` | No existe | US-09 esc. 3–5 |

Referencias: `docs/backend-standards.md` (transacciones Prisma, puertos), `docs/data-model.md` (totales en `Week`, snapshots en `WeekHabit`), patrón T-09-01 (`getCurrentWeek.test.ts` con mocks).

## Goals / Non-Goals

**Goals:**

- `lockWeek(weekId)` atómico: totales desde `HabitEntry`, snapshots definitivos desde `Habit` maestro, `isLocked=true`.
- Idempotencia de `lockWeek` si ya bloqueada.
- `lockWeekAndTransition(userId)`: detectar semana desbloqueada anterior, bloquearla, devolver semana actual vía `getCurrentWeek`.
- Tests unitarios con mocks cubriendo transición, idempotencia, snapshots inmutables y totales 0.

**Non-Goals:**

- HTTP, stats de respuesta, `GET /api/weeks?offset=n` — T-09-03.
- Cambios de esquema Prisma.
- Refactor de `getCurrentWeek` salvo reutilización.
- Tests de integración Prisma (patrón T-09-01: solo mocks).

## Decisions

### 1. Ampliar `WeekRepository` (no nuevo puerto)

**Decisión:** Añadir a `WeekRepository`:

```typescript
findUnlockedWeekBefore(userId: number, beforeStartDate: Date): Promise<WeekWithDetails | null>
lockWeek(weekId: number): Promise<Week>
```

**Rationale:** T-09-01 design ya anticipó `lockWeek` en el mismo puerto; evita proliferación de interfaces.

**Alternativa descartada:** `WeekLockRepository` separado — over-engineering para dos métodos relacionados.

### 2. Query `findUnlockedWeekBefore`

**Decisión:** Prisma `week.findFirst`:

```typescript
where: {
  userId,
  isLocked: false,
  startDate: { lt: beforeStartDate },
},
orderBy: { startDate: 'desc' },
include: { weekHabits: { include: { habitEntries: true } } },
```

Devuelve la semana desbloqueada más reciente anterior al lunes actual (UTC). Cubre US-09 S3 (una sola semana stale en MVP).

**Alternativa descartada:** Buscar por `endDate < currentStartDate` — equivalente si boundaries son consistentes; `startDate` alinea con índice `[userId, startDate]`.

### 3. Algoritmo `lockWeek` en transacción

**Decisión:** Dentro de `prisma.$transaction`:

1. `findUnique` week + `weekHabits` + `habitEntries` + `habit` (via `weekHabit.habitId`).
2. Early return si `isLocked === true` (idempotencia).
3. Por cada `WeekHabit`:
   - `completedCount` = entries con `status === 'completed'`
   - `failedCount` = entries con `status === 'failed'`
   - Acumular `totalPointsEarned += completedCount * habit.pointsPerDay`
   - Acumular `totalPenalties += failedCount * habit.penalty`
   - `weekHabit.update` snapshots desde `habit.name`, `habit.pointsPerDay`, `habit.penalty`
4. `week.update` → `isLocked: true`, totales.

**Rationale:** Totales usan valores del hábito maestro **en el momento del bloqueo**, coherentes con snapshots definitivos escritos en el mismo paso (PRD §bloqueo).

**Alternativa descartada:** Usar `snapshotPoints` existentes (copiados al crear semana) — el DoD exige snapshots definitivos al bloquear desde hábito actual; si el usuario editó el hábito durante la semana, el bloqueo refleja el estado al cierre.

### 4. Flujo `lockWeekAndTransition`

**Decisión:**

```typescript
export async function lockWeekAndTransition(
  weekRepo: WeekRepository,
  habitRepo: HabitRepository,
  userId: number,
  now: Date = new Date(),
): Promise<WeekWithDetails> {
  const { startDate } = getWeekBoundaries(now)
  const staleWeek = await weekRepo.findUnlockedWeekBefore(userId, startDate)
  if (staleWeek !== null) {
    await weekRepo.lockWeek(staleWeek.id)
  }
  return getCurrentWeek(weekRepo, habitRepo, userId, now)
}
```

**Rationale:** Separación clara — bloqueo en repositorio, orquestación en aplicación, creación en `getCurrentWeek` ya probado.

**Nota:** `lockWeek` y `getCurrentWeek` son llamadas separadas (no una mega-transacción). Riesgo aceptado en MVP: si falla `getCurrentWeek` tras `lockWeek`, la semana queda bloqueada pero sin semana nueva — T-09-03 puede añadir retry; documentado en riesgos.

**Alternativa descartada:** Transacción única bloqueo+creación — más compleja; el ticket DoD separa `lockWeek` como operación explícita.

### 5. Test de inmutabilidad de snapshots

**Decisión:** En `lockWeekAndTransition.test.ts`:

- Mock `lockWeek` que simula snapshots fijos (`snapshotPoints: 10`).
- Tras "editar hábito" (cambio en mock `HabitRepository`), verificar que el objeto devuelto por mock de semana bloqueada conserva `snapshotPoints: 10`.

Test de integración opcional en T-09-03 con BD real; este ticket valida el contrato del repositorio vía mock (patrón T-08-01 deactivateHabit).

### 6. Sin función de dominio pura para totales

**Decisión:** Cálculo de totales vive en infraestructura (`lockWeek`), no en `domain/week.ts`.

**Rationale:** Depende de persistencia y JOIN; el ticket DoD apunta a transacción Prisma. Si en el futuro se necesita en dominio, extraer helper.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| `lockWeek` exitoso + `getCurrentWeek` falla → usuario sin semana activa | Log error; T-09-03 retry en endpoint; documentar en tasks |
| Dos semanas desbloqueadas (datos corruptos) | `findUnlockedWeekBefore` toma la más reciente; solo una debería existir en flujo normal |
| Hábito eliminado/desactivado antes del bloqueo | JOIN a `Habit` maestro; si falta hábito, fallar transacción (datos inconsistentes) |
| Snapshots al crear vs al bloquear difieren si hábito editado mid-week | Comportamiento deseado: bloqueo fija valores actuales del maestro |

## Migration Plan

1. Ampliar puerto e implementación Prisma (`lockWeek`, `findUnlockedWeekBefore`).
2. Añadir `lockWeekAndTransition.ts` y tests.
3. `npm test` focalizado + `npm run dev:api` (compilación).
4. Actualizar `docs/data-model.md` con flujo de bloqueo.
5. Sin migración Prisma. Wiring HTTP en T-09-03.

## Open Questions

_(Ninguna bloqueante — orden de cálculo vs snapshots y fuente de valores están definidos en DoD y PRD.)_
