## Context

`frontend/src/infrastructure/` solo contiene:
- `httpClient.ts`: `apiGet<T>(path)` → `{ok:true,data:T} | {ok:false,status,message}`, basado en `fetch('/api'+path)`. Solo lee `body.error` (formato `LegacyErrorResponse`).
- `profileApi.ts`: `fetchUserProfile()` usando `apiGet`.

El backend (`backend/src/presentation/http/middleware/errorHandler.ts`) ya devuelve el formato real `ApiErrorResponse = {code, message, details?, stack?}` para todos los endpoints de hábitos/entradas (`docs/api-spec.yml`). `apiGet` actual no parsea `code`/`details`, por lo que no permite distinguir `WEEK_LOCKED` (409) de `VALIDATION_ERROR` (400) — algo que US-16 (Escenario 3 y 5) necesita para mostrar mensajes y bloquear edición en semanas cerradas.

No existe `frontend/src/domain/habit.ts` con tipo `HabitEntry`; el `Habit` de dominio (`completionStatus`, `streak`, `id: string`) es una forma de UI distinta de `HabitApi` del backend (`id: number`, `userId`, `isActive`, `createdAt`). Mapear `HabitApi` → `Habit` de dominio es responsabilidad de la capa `application` (fuera de este ticket); `habitApi.ts` devuelve el DTO tal cual lo entrega el backend.

## Goals / Non-Goals

**Goals:**
- Proveer `fetchHabits`, `createHabit`, `deleteHabit` (`habitApi.ts`) y `updateHabitEntry` (`habitEntryApi.ts`) que llamen a los endpoints reales documentados en `docs/api-spec.yml`.
- Introducir un tipo `ApiError` (`{status, code, message, details?}`) y lanzarlo (`throw`) cuando la respuesta no sea 2xx, parseando el body `ApiErrorResponse` real del backend.
- Mantener compatibilidad con `profileApi.ts`/`apiGet` existentes (no romper `useUserProfile`).

**Non-Goals:**
- No se implementan hooks de aplicación, componentes UI ni mapeo `HabitApi` → `Habit` de dominio (US-16, tickets posteriores).
- No se migra `profileApi.ts` al nuevo formato de error en este ticket.
- No se implementa `POST /api/habits/:id/toggle/:dayIndex` (endpoint PLANIFICADO, no usado).

## Decisions

### 1. Tipos DTO en `habitApi.ts` / `habitEntryApi.ts` (no en `domain/`)
Se definen `HabitApiDto` (mirror de `HabitApi` del backend: `id, userId, emoji, name, pointsPerDay, penalty, isActive, createdAt`), `CreateHabitInput` (`emoji, name, pointsPerDay, penalty`) y `HabitEntryApiDto` (`id, status, updatedAt`) localmente en los ficheros de infraestructura, siguiendo el patrón de `profileApi.ts` (`ProfileUserDto`). El mapeo a tipos de dominio (`Habit`, `HabitFormInput`) se hará en la capa `application` en un ticket posterior — evita acoplar `infrastructure` a `domain/habit.ts`, cuya forma (`completionStatus`, `streak`) no corresponde 1:1 con la respuesta del backend.

**Alternativa descartada:** reutilizar `HabitFormInput`/`Habit` de `domain/habit.ts` directamente en `habitApi.ts`. Se descarta porque introduciría un mapeo prematuro y acoplaría infra a domain antes de que exista el caso de uso que lo necesite.

### 2. Nuevo helper `apiRequest` en `httpClient.ts` que soporta todos los verbos y lanza `ApiError`
Se añade a `httpClient.ts`:
```ts
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(method: 'GET'|'POST'|'PATCH'|'DELETE', path: string, body?: unknown): Promise<T> {
  // fetch('/api'+path, {...}); si !res.ok parsea ApiErrorResponse {code,message,details} y throw new ApiError(...)
  // si 204 (DELETE), devuelve undefined as T
}
```
`habitApi.ts`/`habitEntryApi.ts` usan `apiRequest`; `apiGet`/`ProfileApiResult` de `profileApi.ts` se mantienen intactos (no se tocan sus tipos ni su contrato `{ok,...}`) para no romper `useUserProfile`.

**Alternativa descartada:** generalizar `apiGet` para devolver `{ok:false, code, details}` con el mismo patrón `{ok,...}` que `profileApi`. Se descarta porque el ticket pide explícitamente "lanzan errores tipados `ApiError`" (throw), no un resultado discriminado — y cambiar `apiGet` rompería el contrato `ApiGetResult` que ya consume `profileApi.ts`.

### 3. Manejo de `DELETE` (204 sin body) y `PATCH`/`POST` (JSON)
`apiRequest` comprueba `res.status === 204` y devuelve `undefined` sin intentar `res.json()` (evita `SyntaxError` por body vacío). Para `POST`/`PATCH` se envía `Content-Type: application/json` y `JSON.stringify(body)`.

### 4. Manejo de errores de red (fetch rechaza)
Igual que `apiGet`: un `catch` envuelve el fallo de red en `ApiError(0, 'NETWORK_ERROR', 'Sin conexión con el servidor (¿npm run dev:api?)')` para que el llamador pueda distinguir 0 (sin conexión) de errores HTTP reales.

## Risks / Trade-offs

- **[Riesgo]** Duplicar lógica de parsing entre `apiGet` (legacy) y `apiRequest` (nuevo) → **Mitigación**: ambos viven en `httpClient.ts`; se documenta en `README.md` de infrastructure que `apiGet`/`ApiGetResult` son legacy (pendiente T-06-01 según `LegacyErrorResponse` en `api-spec.yml`) y que nuevo código usa `apiRequest`/`ApiError`.
- **[Riesgo]** DTOs locales (`HabitApiDto`) podrían divergir del tipo `Habit` de dominio cuando se implemente el mapeo en US-16 → **Mitigación**: DTOs reflejan 1:1 `docs/api-spec.yml` (`HabitApi`, `HabitEntryResponse`), reduciendo el riesgo de desync; el mapeo futuro es explícito y testeable por separado.

## Open Questions

Ninguna — alcance acotado al DoD del ticket; el mapeo a `domain/habit.ts` se decidirá en el ticket de US-16 que consuma estos clientes.
