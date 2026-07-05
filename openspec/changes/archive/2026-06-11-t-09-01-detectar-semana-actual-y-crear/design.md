# Design — T-09-01 · Caso de uso: detectar semana actual y crear si no existe

**Ticket:** T-09-01 · **User Story:** US-09 · **Change:** `t-09-01-detectar-semana-actual-y-crear`

## Context

El monorepo tiene modelos Prisma `Week`, `WeekHabit` y `HabitEntry` migrados (T-03-02 ✅) y el seed demo (T-03-03 ✅) ya crea una semana activa con lógica inline similar al objetivo. `HabitRepository` con `findActiveByUserId` existe (T-07-01 ✅). No hay capa de dominio/aplicación para semanas en `backend/src/`.

| Componente | Estado actual | Objetivo T-09-01 |
|------------|---------------|------------------|
| `backend/prisma/schema.prisma` → Week/WeekHabit/HabitEntry | Modelos completos ✅ | Sin cambios de esquema |
| `backend/src/domain/week.ts` | No existe | `getWeekBoundaries` + tipos de dominio |
| `backend/src/application/ports/WeekRepository.ts` | No existe | `findCurrentWeek`, `createWeek` |
| `backend/src/application/ports/WeekHabitRepository.ts` | No existe | `createWeekHabits` |
| `backend/src/infrastructure/prismaWeekRepository.ts` | No existe | Implementación Prisma |
| `backend/src/infrastructure/prismaWeekHabitRepository.ts` | No existe | Implementación Prisma |
| `backend/src/application/getCurrentWeek.ts` | No existe | Orquestación del DoD |
| `backend/prisma/seed.ts` → `getCurrentWeekBounds` | Hora local, no UTC | **Sin cambios obligatorios** (referencia de flujo) |
| `frontend/src/domain/week.ts` | Offset en memoria | **Sin cambios** |

Referencias: `docs/backend-standards.md` (puertos, transacciones Prisma), `docs/data-model.md` (7 entries por WeekHabit, snapshots al crear semana), patrón T-07-01 (`createHabit`, `prismaHabitRepository`, tests con mock).

## Goals / Non-Goals

**Goals:**

- Implementar `getWeekBoundaries` en dominio con semana ISO (lunes–domingo) en **UTC**, como exige el ticket y US-09 esc. 1.
- Puertos y repositorios Prisma según DoD; caso de uso `getCurrentWeek(userId)` idempotente para semana en curso.
- Creación atómica: Week + WeekHabits + 7×HabitEntry `pending` en **una transacción**; rollback si falla cualquier paso.
- Snapshots iniciales en `WeekHabit` copiados del hábito maestro activo (`name`, `pointsPerDay`, `penalty`).
- Tests unitarios con mocks (patrón `createHabit.test.ts`).

**Non-Goals:**

- `lockWeek`, `lockWeekAndTransition` — T-09-02.
- Endpoints HTTP — T-09-03.
- Estadísticas agregadas (`thisWeekPoints`, `maxStreak`) — tickets US-13/US-09 posteriores.
- Refactor del seed para UTC (mejora opcional futura).

## Decisions

### 1. `getWeekBoundaries` en dominio puro (UTC)

**Decisión:** Función pura en `backend/src/domain/week.ts`:

```typescript
export function getWeekBoundaries(date: Date): { startDate: Date; endDate: Date }
```

- `startDate`: lunes de la semana que contiene `date`, `00:00:00.000 UTC`.
- `endDate`: domingo de esa semana, `23:59:59.999 UTC`.
- Algoritmo: usar `getUTCDay()` (0=domingo → diff = -6 para lunes; 1=lunes → diff=0; etc.), manipular `Date.UTC(...)`.

**Alternativa descartada:** Reutilizar `getCurrentWeekBounds` del seed (hora local) — incumple DoD UTC y acopla seed a dominio.

**Alternativa descartada:** Depender de librería `date-fns` — el ticket y el frontend usan aritmética nativa; mantener cero deps extra.

### 2. Tipos de dominio como interfaces

**Decisión:** En `domain/week.ts`:

```typescript
export interface Week { id, userId, startDate, endDate, isLocked, totalPointsEarned, totalPenalties, createdAt }
export interface WeekHabit { id, weekId, habitId, order, snapshotName, snapshotPoints, snapshotPenalty }
export interface HabitEntry { id, weekHabitId, dayIndex, status, updatedAt }
export type CompletionStatus = 'pending' | 'completed' | 'failed'
```

Mapeo 1:1 desde filas Prisma en repositorios (como `mapToHabit`).

### 3. Puertos segregados Week / WeekHabit

**Decisión:** Dos puertos según DoD del ticket:

```typescript
// WeekRepository
findCurrentWeek(userId: number, startDate: Date): Promise<WeekWithDetails | null>
createWeek(userId: number, startDate: Date, endDate: Date): Promise<Week>

// WeekHabitRepository  
createWeekHabits(weekId: number, activeHabits: Habit[]): Promise<WeekHabitWithEntries[]>
```

`WeekWithDetails` (tipo de aplicación o dominio) incluye `weekHabits` con sus `entries` para respuesta completa del use case.

**Alternativa descartada:** Un solo repositorio monolítico — el ticket separa responsabilidades; T-09-02 ampliará `WeekRepository` con `lockWeek`.

### 4. Transacción Prisma en infraestructura

**Decisión:** Método compuesto en `prismaWeekRepository` (o servicio de infra dedicado):

```typescript
createWeekWithHabitsAndEntries(
  userId: number,
  startDate: Date,
  endDate: Date,
  activeHabits: Habit[],
): Promise<WeekWithDetails>
```

Implementación interna:

```typescript
return prisma.$transaction(async (tx) => {
  const week = await tx.week.create({ data: { userId, startDate, endDate } })
  // por cada habit activo (orden = índice):
  //   weekHabit.create con snapshots
  //   habitEntry.create × 7 (dayIndex 0..6, status pending)
  return mapped WeekWithDetails
})
```

El caso de uso `getCurrentWeek` delega la creación a este método cuando `findCurrentWeek` retorna `null`.

**Rationale:** Garantiza atomicidad del DoD; un mock de `$transaction` permite test de rollback.

**Alternativa descartada:** Tres llamadas sueltas desde el use case — riesgo de Week huérfana si falla `createWeekHabits`.

### 5. Flujo de `getCurrentWeek`

**Decisión:**

```typescript
export async function getCurrentWeek(
  weekRepo: WeekRepository,
  habitRepo: HabitRepository,
  userId: number,
  now: Date = new Date(),
): Promise<WeekWithDetails>
```

1. `{ startDate, endDate } = getWeekBoundaries(now)`
2. `existing = await weekRepo.findCurrentWeek(userId, startDate)` — query por `userId` + `startDate` exacto (índice `[userId, startDate]`).
3. Si `existing !== null` → retornar (US-09 S2).
4. `activeHabits = await habitRepo.findActiveByUserId(userId)`
5. `return weekRepo.createWeekWithHabitsAndEntries(userId, startDate, endDate, activeHabits)` — incluye edge case `[]` hábitos → Week sin WeekHabits (DoD tabla edge).

**Nota:** `createWeekWithHabitsAndEntries` puede vivir en `WeekRepository` como método adicional al DoD mínimo, o en un `WeekCreationService` de infra — preferir extensión del puerto `WeekRepository` para mantener un solo punto de transacción.

### 6. Snapshots al crear (no al bloquear)

**Decisión:** Al crear `WeekHabit`, copiar del `Habit` activo:

- `snapshotName` ← `habit.name`
- `snapshotPoints` ← `habit.pointsPerDay`
- `snapshotPenalty` ← `habit.penalty`
- `order` ← índice en array `findActiveByUserId` (orden `createdAt asc`, ya definido en T-07-01)

Mismo patrón que `backend/prisma/seed.ts` líneas 131–147.

### 7. Tests unitarios

**Decisión:**

| Archivo | Enfoque |
|---------|---------|
| `getWeekBoundaries.test.ts` | Fechas fijas: lunes normal, domingo→lunes, cambio mes/año, año bisiesto |
| `getCurrentWeek.test.ts` | Mock `WeekRepository` + `HabitRepository`: primera semana, semana existente, sin hábitos, rollback en tx |

No tests de integración Prisma en este ticket (patrón T-07-01).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Seed usa hora local; datos demo pueden no coincidir con UTC | Documentar en tests; T-09-03 validará con API; refactor seed opcional |
| Condición de carrera: dos requests simultáneos crean semana duplicada | Índice `[userId, startDate]` + manejo de unique violation en T-09-03; T-09-01 puede documentar retry en ticket HTTP |
| `findCurrentWeek` debe incluir relaciones para respuesta completa | `include: { weekHabits: { include: { habitEntries: true } } }` en Prisma |
| Duplicar lógica seed vs repositorio | Aceptado; seed permanece independiente hasta refactor explícito |

## Migration Plan

1. Añadir archivos de dominio, puertos, infra y use case (sin cambios de esquema).
2. Ejecutar tests unitarios (`npm test`).
3. Verificar compilación `npm run dev:api`.
4. Sin migración Prisma ni despliegue especial.
5. Wiring HTTP en T-09-03.

## Open Questions

_(Ninguna bloqueante — UTC y transacción están definidos en DoD y US-09.)_
