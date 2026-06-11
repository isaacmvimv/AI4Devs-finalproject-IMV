# Proposal — T-09-01 · Caso de uso: detectar semana actual y crear si no existe

**Ticket:** T-09-01  
**User Story:** US-09 — API: gestión de semanas y bloqueo automático  
**Sprint:** 2 · Ciclo Semanal y Recompensas API

## Why

El modelo Prisma `Week`, `WeekHabit` y `HabitEntry` ya existe (T-03-02 ✅) y el seed demo crea una semana activa con entries `pending` (T-03-03 ✅), pero el backend no tiene utilidad de dominio para calcular límites semanales, puertos de repositorio ni el caso de uso `getCurrentWeek`. Sin esta capa, T-09-02 no puede orquestar la transición semanal ni T-09-03 puede exponer `GET /api/weeks/current`. Es el primer paso del vertical slice de semanas que materializa US-09 esc. 1–2.

## What Changes

- Crear función de dominio `getWeekBoundaries(date): { startDate, endDate }` — lunes 00:00 UTC → domingo 23:59:59.999 UTC.
- Definir tipos de dominio `Week`, `WeekHabit`, `HabitEntry` en `backend/src/domain/week.ts` alineados con Prisma y `docs/data-model.md`.
- Definir puertos `WeekRepository` y `WeekHabitRepository` en `backend/src/application/ports/` con métodos del DoD.
- Implementar `createPrismaWeekRepository` y `createPrismaWeekHabitRepository` en infraestructura.
- Implementar caso de uso `getCurrentWeek(userId)`:
  - Calcula límites de la semana actual.
  - Busca semana existente por `userId` + `startDate`.
  - Si no existe: obtiene hábitos activos (`HabitRepository.findActiveByUserId`), crea `Week`, `WeekHabit` (con snapshots del hábito maestro) y 7 `HabitEntry` con `status: pending` por cada hábito — **todo en una transacción Prisma**.
  - Si existe: devuelve la semana sin duplicar.
- Tests unitarios Vitest: `getWeekBoundaries.test.ts`, `getCurrentWeek.test.ts` (happy path, semana existente, sin hábitos activos, atomicidad con mock de tx).
- **Estado actual:** no existen archivos `*week*` en `backend/src/`; `HabitRepository` ✅ (T-07-01); seed tiene lógica ad hoc `getCurrentWeekBounds` en hora local (no reutilizable como dominio).

## Capabilities

### New Capabilities

- `week-get-current`: Utilidad `getWeekBoundaries`, tipos de dominio de semana, puertos `WeekRepository`/`WeekHabitRepository`, repositorios Prisma y caso de uso `getCurrentWeek` con transacción atómica.

### Modified Capabilities

_(Ninguna — no se alteran specs archivadas; bloqueo/transición HTTP se cubren en T-09-02/T-09-03.)_

## Impact

- **Backend / dominio:** `backend/src/domain/week.ts` (nuevo) — `getWeekBoundaries` + tipos.
- **Backend / aplicación:** `ports/WeekRepository.ts`, `ports/WeekHabitRepository.ts`, `getCurrentWeek.ts` (nuevos).
- **Backend / infraestructura:** `prismaWeekRepository.ts`, `prismaWeekHabitRepository.ts` (nuevos); posible helper de transacción compartida o método compuesto en repositorio.
- **Dependencias:** reutiliza `HabitRepository.findActiveByUserId` (T-07-01 ✅); modelos Prisma Week/WeekHabit/HabitEntry (T-03-02 ✅).
- **Tests:** `getWeekBoundaries.test.ts`, `getCurrentWeek.test.ts`.
- **Documentación:** verificar alineación en `docs/data-model.md` (reglas de semana UTC); sin cambios en `api-spec.yml` (T-09-03).
- **Tickets posteriores:** T-09-02 (`lockWeekAndTransition`), T-09-03 (`GET /api/weeks/current`).

## Non-goals

- Caso de uso `lockWeekAndTransition` ni método `lockWeek` (T-09-02).
- Endpoints HTTP `GET /api/weeks/current` o `GET /api/weeks?offset=n` (T-09-03).
- Cálculo de estadísticas (`thisWeekPoints`, `maxStreak`, etc.) — tickets posteriores de US-09/US-13.
- Wiring de repositorios en `createApp.ts` / `main.ts` — puede hacerse en T-09-03 al registrar rutas.
- Refactor del seed para usar `getWeekBoundaries` de dominio (opcional, fuera del DoD).
- Integración frontend (`frontend/src/domain/week.ts` sigue con offset en memoria).
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-09-01)

| Origen | Escenario | Aplicabilidad en T-09-01 |
|--------|-----------|---------------------------|
| US-09 | Scenario 1 — Primera semana del usuario | **Completo** — `getCurrentWeek` crea Week + WeekHabits + 7×pending por hábito activo |
| US-09 | Scenario 2 — Misma semana | **Completo** — devuelve semana existente sin duplicar |
| US-09 | Scenario 3 — Cambio de semana (transición) | **Fuera de alcance** — T-09-02 |
| US-09 | Scenario 4 — Idempotencia tras bloqueo | **Fuera de alcance** — T-09-02 |
| US-09 | Scenario 5 — Snapshot inmutable | **Parcial** — snapshots iniciales al crear WeekHabit; inmutabilidad post-bloqueo en T-09-02 |
| US-09 | Scenario 6 — GET /api/weeks?offset=n | **Fuera de alcance** — T-09-03 |
