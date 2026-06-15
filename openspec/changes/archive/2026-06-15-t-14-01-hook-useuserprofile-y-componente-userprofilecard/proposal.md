## Why

**Ticket:** T-14-01 · **User Story:** US-14 (Sprint 3 — UI Core: Perfil, Hábitos y Recompensas)

US-14 requiere que la cabecera muestre el nombre, email y avatar del usuario cargados desde `GET /api/profile`, para dar confirmación visual de que el sistema reconoce al usuario. El scaffold de T-05-04 ya creó versiones mínimas de `profileApi.fetchUserProfile()`, `useUserProfile` y `UserProfileCard`, pero no cubren los criterios de aceptación de US-14: faltan `avatarUrl` en el contrato, skeleton de carga, mensaje "Usuario desconocido" en error, y fallback de iniciales/email.

## What Changes

- Extender `ProfileUserDto` (`frontend/src/infrastructure/profileApi.ts`) con el campo `avatarUrl: string | null`, alineado con `components.schemas.UserProfile` de `docs/api-spec.yml`.
- `useUserProfile` (`frontend/src/application/useUserProfile.ts`): mantiene los estados `loading`, `data` (`user`) y `error`; sin cambios funcionales salvo el nuevo campo `avatarUrl` propagado por el DTO.
- `UserProfileCard` (`frontend/src/presentation/components/UserProfileCard.tsx`):
  - Muestra un **skeleton** (placeholders animados) mientras `loading` es `true`.
  - Si `error`, muestra **"Usuario desconocido"** de forma no intrusiva (sin bloquear el resto del dashboard).
  - Si `name` es `null`, muestra el `email` como nombre visible.
  - Renderiza un avatar (Radix `Avatar`/`AvatarImage`/`AvatarFallback`): imagen si `avatarUrl` no es `null`, iniciales del nombre (o email si `name` es `null`) en caso contrario.
- Añadir infraestructura de pruebas unitarias de componentes (Vitest + Testing Library + jsdom) para cubrir los escenarios BDD de US-14 (1–4) en `useUserProfile` y `UserProfileCard`.

## Capabilities

### New Capabilities
- `user-profile-card-ui`: Hook `useUserProfile` y componente `UserProfileCard` que muestran el perfil del usuario (nombre, email, avatar) con estados de carga, error y fallbacks, en la cabecera de la aplicación.

### Modified Capabilities
(ninguna — `user-profile-read` y `user-profile-http` son capacidades de backend no modificadas por este ticket)

## Impact

- `frontend/src/infrastructure/profileApi.ts`: añadir `avatarUrl` al `ProfileUserDto`.
- `frontend/src/application/useUserProfile.ts`: sin cambios de lógica (revisión/tests).
- `frontend/src/presentation/components/UserProfileCard.tsx`: reescritura de la UI (skeleton, error, avatar con fallback).
- `package.json` / `vitest.config.ts`: añadir dependencias de testing de componentes (`@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) y entorno `jsdom` para tests de `frontend/src/**`.
- Nuevos tests: `frontend/src/application/useUserProfile.test.ts`, `frontend/src/presentation/components/UserProfileCard.test.tsx`.

## Non-goals

- No se modifica el endpoint `GET /api/profile` ni la capa backend (`user-profile-read`, `user-profile-http`).
- No se implementa edición de perfil ni subida de avatar.
- No se rediseña el layout completo de la cabecera (`Header.tsx`, `AppLayout`) más allá de integrar `UserProfileCard` si no está ya integrado.
- No se cubren otros componentes de la cabecera fuera de `UserProfileCard`.

## Acceptance Criteria (referencia US-14)

Mapeo a los escenarios Gherkin de US-14:
- Scenario 1 (happy path: nombre, email, avatar/iniciales) → DoD items 3, 5.
- Scenario 2 (skeleton de carga) → DoD item 3.
- Scenario 3 (error de API → "Usuario desconocido") → DoD item 3.
- Scenario 4 (`name=null` → email como nombre, sin excepción) → DoD item 4.
