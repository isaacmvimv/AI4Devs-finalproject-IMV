## Context

T-05-04 dejó un scaffold mínimo de las tres capas implicadas:

- `frontend/src/infrastructure/profileApi.ts`: `ProfileUserDto { id, name, email }` y `fetchUserProfile()` vía `apiGet<ProfileUserDto>('/profile')`.
- `frontend/src/application/useUserProfile.ts`: hook con `{ user, loading, error }`, ya con `cancelled` flag y manejo de error correcto.
- `frontend/src/presentation/components/UserProfileCard.tsx`: render simple ("Cargando perfil…", mensaje de error crudo, nombre/email).

`docs/api-spec.yml` (`UserProfile`) ya define `avatarUrl: string | null` en el backend (T-06-01/T-06-02), pero el DTO del frontend no lo incluye. `UserProfileCard.tsx` no está integrado en `Header.tsx`/`AppLayout` (verificar en paso N+1; si falta, integrarlo es parte del DoD del scaffold de cabecera, no de este ticket — se deja como N/A si ya está cableado en `App.tsx`).

No existe infraestructura de pruebas de componentes React (Testing Library/jsdom); `vitest.config.ts` usa `environment: 'node'` para `backend/src/**` y `frontend/src/**` (solo tests de dominio puro hasta ahora).

## Goals / Non-Goals

**Goals:**
- Alinear `ProfileUserDto` con el contrato `UserProfile` de `api-spec.yml` (añadir `avatarUrl`).
- Cumplir los 4 escenarios BDD de US-14 en `UserProfileCard`: happy path, skeleton de carga, error → "Usuario desconocido", `name=null` → email.
- Avatar con imagen (`avatarUrl`) o iniciales como fallback, usando el primitivo Radix `Avatar`/`AvatarImage`/`AvatarFallback` ya disponible en `presentation/components/ui/avatar.tsx`.
- Tests unitarios (Vitest + Testing Library) para `useUserProfile` y `UserProfileCard` cubriendo los escenarios anteriores.

**Non-Goals:**
- No se modifica el backend (`user-profile-read`, `user-profile-http`) ni `api-spec.yml` (el campo `avatarUrl` ya está documentado).
- No se implementa edición/subida de avatar.
- No se reestructura `Header.tsx`/`AppLayout` más allá de confirmar/integrar el render de `UserProfileCard` si no estuviera ya enlazado.

## Decisions

### 1. `ProfileUserDto` — añadir `avatarUrl`
Añadir `avatarUrl: string | null` a `ProfileUserDto` en `profileApi.ts`, sin cambiar la forma de `ProfileApiResult` ni `fetchUserProfile()` (el backend ya lo devuelve según `api-spec.yml`).

### 2. `useUserProfile` — sin cambios funcionales
La lógica actual (`loading`/`user`/`error`, cleanup con `cancelled`) ya cumple "gestiona estados loading, data, error" del DoD. Solo se añaden/ajustan tests; no se modifica el hook salvo que los tests revelen un defecto.

### 3. Derivar nombre visible e iniciales en la capa de presentación
Helpers locales en `UserProfileCard.tsx` (sin nueva capa de dominio, dado el alcance pequeño S/2 puntos):
- `getDisplayName(user)`: `user.name ?? user.email`.
- `getInitials(displayName)`: primeras letras de hasta 2 palabras del `displayName` (p. ej. "Ana García" → "AG"; "ana@ejemplo.com" → "A"), en mayúsculas.

Alternativa considerada: mover estos helpers a `src/domain/`. Se descarta por ahora — son puramente de presentación (formato de texto para UI) y el ticket es de tamaño S; si se reutilizan en otro componente de cabecera, se promoverán a `domain/` en un ticket posterior.

### 4. Skeleton de carga
Reutilizar utilidades Tailwind (`animate-pulse` + bloques `bg-gray-200 rounded`) en lugar de añadir un nuevo primitivo `Skeleton`, consistente con "evitar CSS personalizado cuando existan utilidades de Tailwind".

### 5. Avatar con fallback
Usar `Avatar`, `AvatarImage`, `AvatarFallback` de `presentation/components/ui/avatar.tsx` (Radix, ya instalado en T-05-03):
- `avatarUrl` no nulo → `<AvatarImage src={avatarUrl} alt="Avatar de ..." />`.
- `avatarUrl` nulo → `<AvatarFallback>{initials}</AvatarFallback>`.

### 6. Infraestructura de tests de componentes (Testing Library + jsdom)
El DoD del ticket sugiere tests RTL + `renderHook` con mock de `fetch`, y la US-14 los referencia explícitamente en su tabla "Tests unitarios sugeridos" (alineados a los escenarios Gherkin 1–3). Como no existe esta infraestructura:

- Añadir `@testing-library/react`, `@testing-library/jest-dom` y `jsdom` como devDependencies.
- En `vitest.config.ts`, usar `environmentMatchGlobs: [['frontend/src/**', 'jsdom']]` (mantiene `environment: 'node'` por defecto para `backend/src/**`), o un proyecto separado si `environmentMatchGlobs` no está disponible en la versión de Vitest instalada — verificar en implementación.
- Mock de `fetch` global en los tests (sin tocar `vitest.setup.ts` salvo necesidad puntual).

Alternativa considerada: omitir tests de componentes y limitarse a verificación manual. Se descarta porque el DoD/US-14 los pide explícitamente como criterio de "Testable", y son la forma más directa de verificar los 4 escenarios BDD sin depender de Playwright para un componente aislado.

## Risks / Trade-offs

- **[Riesgo] Añadir `jsdom`/Testing Library incrementa el tiempo de instalación y el alcance "no-código de producto" del ticket.** → Mitigación: son devDependencies acotadas, estándar para RTL; no afectan el bundle de producción.
- **[Riesgo] `environmentMatchGlobs` podría no existir en la versión de Vitest del proyecto.** → Mitigación: si no está disponible, usar `test.environment: 'jsdom'` global (los tests de dominio puro/backend funcionan igual bajo jsdom) o `// @vitest-environment jsdom` por archivo de test del frontend.
- **[Riesgo] `UserProfileCard` podría no estar montado en `App.tsx`/`Header.tsx`.** → Mitigación: verificar en paso N+1 (dev server); si falta, añadir el render en `Header.tsx` como ajuste mínimo dentro del alcance (está implícito en "perfil de usuario en cabecera" de US-14).

## Open Questions

Ninguna bloqueante; decisiones por defecto documentadas arriba.
