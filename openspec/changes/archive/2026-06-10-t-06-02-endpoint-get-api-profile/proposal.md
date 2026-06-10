# Proposal — T-06-02 · Endpoint GET /api/profile

**Ticket:** T-06-02  
**User Story:** US-06 — API y dominio: gestión de perfil de usuario  
**Sprint:** 1 · APIs Core y Dominio Frontend

## Why

T-06-01 completó el caso de uso `getUserProfileById` con `NotFoundError` (`USER_NOT_FOUND`) y DTO completo (`avatarUrl` incluido), pero la capa HTTP sigue con implementación legacy: el handler en `createApp.ts` comprueba `if (!user)` (rama muerta), omite `avatarUrl` en la respuesta 200 y devuelve 404 con `{ error: "..." }` en lugar del contrato estándar `{ code, message }`. Sin cerrar este ticket, el frontend no puede consumir el perfil con el contrato documentado en US-06 ni validar el flujo con curl.

## What Changes

- Refactorizar el handler `GET /api/profile` en `backend/src/presentation/http/createApp.ts` para delegar en `getUserProfileById(userRepository, 1)` sin manejo inline de 404.
- Responder **200** con `{ id, name, email, avatarUrl }` serializando el `UserProfile` retornado por el caso de uso.
- Propagar `NotFoundError` vía `asyncHandler` → `errorHandler` → **404** `{ code: "USER_NOT_FOUND", message: "Usuario no encontrado" }` (US-06 esc. 3).
- Añadir tests HTTP con supertest (mock del caso de uso o repositorio) en `backend/src/presentation/http/createApp.test.ts` o archivo dedicado al endpoint.
- Actualizar `docs/api-spec.yml`: respuesta 200 con `avatarUrl`, 404 con `ApiErrorResponse` (eliminar referencia a `LegacyErrorResponse`).
- Actualizar snippets legacy en `docs/backend-standards.md` (handler `/api/profile` y formato 404).
- **Estado actual:** la ruta existe parcialmente; requiere alineación con T-06-01 y contrato REST.

## Capabilities

### New Capabilities

- `user-profile-http`: Exposición HTTP de lectura de perfil (`GET /api/profile`), contrato JSON 200/404 y tests supertest.

### Modified Capabilities

_(Ninguna — `user-profile-read` cubre dominio/aplicación en T-06-01; este change añade la capa presentación sin alterar requisitos ya archivados.)_

## Impact

- **Backend / presentación:** `backend/src/presentation/http/createApp.ts`.
- **Backend / tests:** nuevo `backend/src/presentation/http/createApp.test.ts` (o `profileRoute.test.ts`).
- **Dependencias dev:** `supertest` + `@types/supertest` (no instalados aún; requeridos por DoD del ticket).
- **Documentación:** `docs/api-spec.yml`, `docs/backend-standards.md`.
- **Dependencias previas:** T-06-01 ✅ (`getUserProfileById`, `NotFoundError`), T-04-02 ✅ (`errorHandler`), T-03-02 ✅ (seed usuario id=1).
- **Tickets posteriores:** frontend `useUserProfile` (US-06 esc. 2), auth middleware para `userId` dinámico.

## Non-goals

- Middleware de autenticación ni resolución dinámica de `userId` (MVP mantiene `id=1` hardcodeado en el handler).
- Lógica de fallback UI `name ?? email` (US-06 esc. 2 — capa frontend).
- Modificar caso de uso, repositorio o entidad `UserProfile` (alcance T-06-01).
- Tests de integración con BD real (US-19 / ticket posterior).
- E2E Playwright (sin cambios UI en este ticket).
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-06-02)

| Origen | Escenario | Aplicabilidad en T-06-02 |
|--------|-----------|---------------------------|
| US-06 | Scenario 1 — Happy path | **Completo** — `GET /api/profile` → 200 con `{ id, name, email, avatarUrl }` |
| US-06 | Scenario 2 — Usuario sin nombre | **Completo** — 200 con `name: null` (sin fallback en API) |
| US-06 | Scenario 3 — Usuario no encontrado | **Completo** — 404 `{ code: "USER_NOT_FOUND", message: "Usuario no encontrado" }` |
| US-06 | Scenario 4 — Fallo de BD | **Parcial** — 500 vía `errorHandler` si Prisma lanza; sin test obligatorio en DoD del ticket |
