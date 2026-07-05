# Proposal — T-09-03 · Endpoint GET /api/weeks/current y GET /api/weeks?offset=n

**Ticket:** T-09-03 · **User Story:** US-09 · **Sprint:** 2 · Ciclo Semanal y Recompensas API · **Change:** `t-09-03-endpoint-get-api-weeks-current` · **Rama:** `feature/T-09-03-endpoint-get-api-weeks-current`

## Why

T-09-01 ✅ y T-09-02 ✅ entregaron dominio, repositorios Prisma y casos de uso `getCurrentWeek` y `lockWeekAndTransition`, pero el backend aún no expone rutas HTTP de semanas. Sin `GET /api/weeks/current` y `GET /api/weeks?offset=n`, el frontend sigue en memoria con `weekOffset` y la mecánica distintiva de ConRutina (bloqueo automático al cargar, historial inmutable) no es consumible por la SPA ni verificable con curl. Este ticket cierra el vertical slice de US-09 esc. 1–6 en la capa de presentación.

## What Changes

- Registrar `GET /api/weeks/current` en `createApp.ts`: orquesta `lockWeekAndTransition` (que ya delega en `getCurrentWeek`) y devuelve DTO completo con `week`, `habits`, `stats` y `redemptions: []`.
- Registrar `GET /api/weeks?offset=n` (`n=0` semana actual, `n<0` histórico); `404` si no existe la semana solicitada.
- Añadir casos de uso de aplicación para ensamblar la respuesta y calcular `stats` (`thisWeekPoints`, `penalties`, `lastWeekPoints`, `maxStreak`) fuera del handler HTTP.
- Ampliar `WeekRepository` con consulta por `startDate` desplazado (offset semanal) para historial.
- Cablear `createPrismaWeekRepository` en `createApp.ts` junto a repositorios existentes.
- Tests supertest con mocks (happy path transición, idempotencia, offset histórico, 404).
- Actualizar `docs/api-spec.yml` con ambos endpoints y el schema de respuesta.

## Capabilities

### New Capabilities

- `week-http`: exposición HTTP de semanas (`GET /api/weeks/current`, `GET /api/weeks?offset=n`), DTO de respuesta, stats en capa aplicación y errores 404.

### Modified Capabilities

_(Ninguna — los specs archivados `week-get-current` y `week-lock-transition` cubren dominio/aplicación ya implementados; este change añade capa HTTP sin alterar sus requisitos.)_

## Non-goals

- Endpoints de canjes (`POST /api/weeks/:weekId/redemptions`) — T-12-02.
- `PATCH /api/habit-entries/:id` — T-10-01.
- Auth middleware / `userId` dinámico (MVP: `userId=1` hardcoded).
- Integración frontend (`useHabitDashboard` con API) — tickets Sprint 3+.
- Cálculo de `redemptions` distinto de array vacío — hasta T-12.
- Cambios de esquema Prisma o migraciones.
- Tests E2E Playwright.

## Acceptance Criteria (US-09)

| Escenario Gherkin | Cobertura T-09-03 |
|-------------------|-------------------|
| S1 — Primera semana del usuario | `GET /api/weeks/current` crea semana + WeekHabit + entries pending |
| S2 — Misma semana sin duplicados | `GET /api/weeks/current` devuelve semana existente |
| S3 — Transición de semana | `current` orquesta bloqueo + nueva semana |
| S4 — Idempotencia | Dos GET `current` seguidos sin duplicar |
| S5 — Snapshot inmutable | `GET /api/weeks?offset=-1` conserva `snapshotPoints` históricos |
| S6 — Historial con offset | `offset=-1` → 200 bloqueada; `offset=-5` → 404 |

## Impact

- **Código:** `backend/src/presentation/http/createApp.ts`, `createApp.test.ts`; nuevos módulos en `backend/src/application/` (`getWeekResponse`, `getWeekByOffset`, `calculateWeekStats`, mapper DTO); ampliación `WeekRepository` + `prismaWeekRepository.ts`.
- **API:** nuevas rutas documentadas en `docs/api-spec.yml` (hoy solo hábitos y profile).
- **Dependencias:** reutiliza T-09-01 (`getCurrentWeek`), T-09-02 (`lockWeekAndTransition`), T-07-01 (`HabitRepository`).
- **Documentación:** `docs/api-spec.yml`; verificar alineación en `docs/data-model.md` (stats desde API).
