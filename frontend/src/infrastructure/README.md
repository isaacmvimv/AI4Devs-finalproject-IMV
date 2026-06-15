# Capa infrastructure

Clientes HTTP y adaptadores a servicios externos.

- **Cliente base (legacy):** `httpClient.ts` — `apiGet<T>()` sobre `fetch('/api' + path)`, devuelve `ApiGetResult<T>` (`{ok,...}`) parseando `LegacyErrorResponse` (`body.error`). Usado solo por `profileApi.ts` (pendiente de migración, T-06-01).
- **Cliente base (actual):** `httpClient.ts` — `apiRequest<T>(method, path, body?)` sobre `fetch('/api' + path)`, soporta `GET`/`POST`/`PATCH`/`DELETE`, serializa `body` como JSON y **lanza** `ApiError` (`{status, code, message, details?}`) en respuestas no-2xx, parseando el `ApiErrorResponse` real del backend. Para `204 No Content` devuelve `undefined`. En fallo de red lanza `ApiError(0, 'NETWORK_ERROR', ...)`.
- **Adaptadores:**
  - `profileApi.ts` — GET `/api/profile` (usa `apiGet`, legacy)
  - `habitApi.ts` — `fetchHabits` (GET `/api/habits`), `createHabit` (POST `/api/habits`), `deleteHabit` (DELETE `/api/habits/:id`) (usan `apiRequest`)
  - `habitEntryApi.ts` — `updateHabitEntry` (PATCH `/api/habit-entries/:id`) (usa `apiRequest`)

Los adaptadores traducen respuestas HTTP a tipos consumibles por la capa application. El código nuevo debe usar `apiRequest`/`ApiError`; `apiGet`/`ApiGetResult` se mantienen solo por compatibilidad con `profileApi.ts`.
