# Tasks — T-16-01 · Infraestructura frontend: clientes HTTP para hábitos y entradas

**Ticket:** T-16-01 · **User Story:** US-16 · **Change:** `t-16-01-clientes-http-para-habitos-y` · **Rama:** `feature/T-16-01-clientes-http-para-habitos-y`
**Pasos aplicables:** unit=sí · curl=N/A (sin cambios backend) · e2e=N/A (sin componentes UI) · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)
- [x] 0.1 git checkout develop && git pull origin develop
- [x] 0.2 Validar rama no existe (local/remoto): `git branch --list "feature/T-16-01-clientes-http-para-habitos-y"` y `git branch -r --list "origin/feature/T-16-01-clientes-http-para-habitos-y"`
- [x] 0.3 git checkout -b feature/T-16-01-clientes-http-para-habitos-y
- [x] 0.4 git branch --show-current

## 1. Cliente HTTP base con errores tipados
- [x] 1.1 En `frontend/src/infrastructure/httpClient.ts`, añadir clase `ApiError extends Error` con `status: number`, `code: string`, `message: string`, `details?: unknown`
- [x] 1.2 Añadir helper `apiRequest<T>(method, path, body?)` que use `fetch('/api'+path)`, serialice `body` como JSON para `POST`/`PATCH`, parsee `ApiErrorResponse` (`code`, `message`, `details`) en respuestas no-2xx y lance `ApiError`
- [x] 1.3 Manejar `204 No Content` (DELETE) sin intentar `res.json()`
- [x] 1.4 Manejar fallo de red (`fetch` rechaza) lanzando `ApiError(0, 'NETWORK_ERROR', ...)`
- [x] 1.5 Mantener `apiGet`/`ApiGetResult`/`profileApi.ts` sin cambios de contrato

## 2. `habitApi.ts` — DTOs y funciones (DoD: GET/POST/DELETE /api/habits)
- [x] 2.1 Crear `frontend/src/infrastructure/habitApi.ts` con tipos `HabitApiDto` (`id, userId, emoji, name, pointsPerDay, penalty, isActive, createdAt`) y `CreateHabitInput` (`emoji, name, pointsPerDay, penalty`), alineados con `HabitApi`/`CreateHabitRequest` de `docs/api-spec.yml`
- [x] 2.2 Implementar `fetchHabits(): Promise<HabitApiDto[]>` → `GET /api/habits`
- [x] 2.3 Implementar `createHabit(input: CreateHabitInput): Promise<HabitApiDto>` → `POST /api/habits`
- [x] 2.4 Implementar `deleteHabit(id: number): Promise<void>` → `DELETE /api/habits/:id`

## 3. `habitEntryApi.ts` — DTO y función (DoD: PATCH /api/habit-entries/:id)
- [x] 3.1 Crear `frontend/src/infrastructure/habitEntryApi.ts` con tipo `HabitEntryApiDto` (`id, status, updatedAt`), alineado con `HabitEntryResponse` de `docs/api-spec.yml`
- [x] 3.2 Implementar `updateHabitEntry(entryId: number, status: 'pending'|'completed'|'failed'): Promise<HabitEntryApiDto>` → `PATCH /api/habit-entries/:id`

## 4. Tests unitarios (DoD: habitApi.test.ts, habitEntryApi.test.ts)
- [x] 4.1 `habitApi.test.ts`: `fetchHabits` (200), `createHabit` happy path (201) y error de validación (400 con `details`), `deleteHabit` happy path (204) y `404 HABIT_NOT_FOUND`
- [x] 4.2 `habitEntryApi.test.ts`: `updateHabitEntry` happy path (200) y `409 WEEK_LOCKED` → `ApiError` con `code='WEEK_LOCKED'`
- [x] 4.3 Mockear `fetch` con `vi.stubGlobal`/`vi.unstubAllGlobals` siguiendo el patrón de `frontend/src/application/useUserProfile.test.ts`

## 5. Verificación → tasks-core §N+1 (OBLIGATORIO)
- [x] 5.1 `cd frontend && npm run test -- habitApi habitEntryApi` (focalizado) y suite completa de frontend
- [x] 5.2 `cd frontend && npm run build` (typecheck) y `npm run dev` para confirmar arranque sin errores
- [x] 5.3 Informe en `openspec/changes/t-16-01-clientes-http-para-habitos-y/reports/YYYY-MM-DD-step-05-verification.md`

## 6. curl → N/A
- [x] 6.1 Documentar en el informe de verificación que `curl` es N/A: el ticket consume endpoints de backend ya existentes y probados (`/api/habits`, `/api/habit-entries`), sin cambios en `backend/`

## 7. E2E → N/A
- [x] 7.1 Documentar en el informe de verificación que E2E es N/A: este ticket no añade componentes UI ni flujos de usuario visibles (solo infraestructura `infrastructure/`)

## 8. Documentación → tasks-core §N+4 (OBLIGATORIO)
- [x] 8.1 Actualizar `frontend/src/infrastructure/README.md` describiendo `apiRequest`/`ApiError`, `habitApi.ts` y `habitEntryApi.ts`

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
- [x] Commit único, push de `feature/T-16-01-clientes-http-para-habitos-y` y merge a `develop` (solo en `/opsx:archive`)
