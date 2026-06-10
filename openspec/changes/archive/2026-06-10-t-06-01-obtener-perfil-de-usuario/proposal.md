# Proposal — T-06-01 · Implementar repositorio y caso de uso: obtener perfil de usuario

**Ticket:** T-06-01  
**User Story:** US-06 — API y dominio: gestión de perfil de usuario  
**Sprint:** 1 · APIs Core y Dominio Frontend

## Why

Tras el scaffold de Express (US-04) y el modelo Prisma de `User` (US-03), la lectura de perfil existe de forma parcial: el repositorio Prisma y el puerto `UserReadRepository` están esbozados, pero la entidad `UserProfile` no incluye `avatarUrl`, el caso de uso devuelve `null` en lugar de lanzar `NotFoundError`, y no hay tests unitarios del flujo de aplicación. Sin completar esta capa de dominio/aplicación/infraestructura, T-06-02 no puede exponer `GET /api/profile` con el contrato `{ code, message }` en 404 (US-06 esc. 3) ni el payload completo con `avatarUrl` (US-06 esc. 1).

## What Changes

- Completar `UserProfile` en `backend/src/domain/userProfile.ts` con campo `avatarUrl: string | null`.
- Mantener/validar el puerto `UserReadRepository` con `findById(id): Promise<UserProfile | null>`.
- Actualizar `createPrismaUserRepository` para mapear `avatarUrl` desde `prisma.user.findUnique`.
- Refactorizar `getUserProfileById` para lanzar `NotFoundError` (código `USER_NOT_FOUND`) cuando el repositorio devuelve `null`; retorno tipado `Promise<UserProfile>`.
- Añadir tests unitarios `backend/src/application/getUserProfile.test.ts` (happy path, `NotFoundError`, preservación de `name`/`email`/`avatarUrl`).
- **Estado actual:** archivos parcialmente implementados sin `avatarUrl`, sin `NotFoundError` en el caso de uso, sin tests; `createApp.ts` sigue manejando 404 inline (alcance T-06-02).

## Capabilities

### New Capabilities

- `user-profile-read`: Entidad `UserProfile`, puerto de lectura, repositorio Prisma y caso de uso `getUserProfileById` con semántica de error tipado.

### Modified Capabilities

_(Ninguna — no se alteran requisitos normativos de specs archivadas; la capa HTTP y el contrato REST se cubren en T-06-02.)_

## Impact

- **Backend / dominio:** `backend/src/domain/userProfile.ts`.
- **Backend / aplicación:** `backend/src/application/getUserProfile.ts`, `backend/src/application/ports/UserReadRepository.ts` (validación de firma).
- **Backend / infraestructura:** `backend/src/infrastructure/prismaUserRepository.ts`.
- **Backend / errores:** reutiliza `NotFoundError` de `backend/src/domain/errors/appErrors.ts` (T-04-02 ✅).
- **Tests:** nuevo `backend/src/application/getUserProfile.test.ts`.
- **Documentación:** alinear ejemplos en `docs/backend-standards.md` si difieren del DoD (`avatarUrl`, `NotFoundError` en caso de uso).
- **Dependencias previas:** T-03-02 (modelo User con `avatarUrl`), T-04-01 (capas), T-04-02 (`NotFoundError`).
- **Tickets posteriores:** T-06-02 (endpoint `GET /api/profile`, contrato 404 estructurado), frontend `useUserProfile` (US-06 esc. 2 fallback por email).

## Non-goals

- Registrar o modificar la ruta `GET /api/profile` en `createApp.ts` (T-06-02).
- Migrar el formato legacy `{ error: "..." }` en 404 HTTP (T-06-02).
- Middleware de autenticación ni resolución dinámica de `userId` (MVP mantiene id fijo en capa HTTP).
- Lógica de fallback frontend `name ?? email` (US-06 esc. 2 — ticket frontend).
- Tests curl/E2E del endpoint (T-06-02 / US-19).
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-06-01)

| Origen | Escenario | Aplicabilidad en T-06-01 |
|--------|-----------|---------------------------|
| US-06 | Scenario 1 — Happy path | **Parcial** — DTO completo con `avatarUrl` en capa aplicación/repositorio (HTTP en T-06-02) |
| US-06 | Scenario 2 — Usuario sin nombre | **Parcial** — repositorio preserva `name: null` (fallback UI fuera de alcance) |
| US-06 | Scenario 3 — Usuario no encontrado | **Completo** — caso de uso lanza `NotFoundError` / `USER_NOT_FOUND` |
| US-06 | Scenario 4 — Fallo de BD | **Fuera de alcance** — propagación Prisma → 500 HTTP en T-06-02 + handler global |
