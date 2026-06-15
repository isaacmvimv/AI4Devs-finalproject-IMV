# Tasks — T-14-01 · Hook useUserProfile y componente UserProfileCard

**Ticket:** T-14-01 · **User Story:** US-14 · **Change:** `t-14-01-hook-useuserprofile-y-componente-userprofilecard` · **Rama:** `feature/T-14-01-hook-useuserprofile-y-componente-userprofilecard`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=sí · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)
- [x] 0.1 git checkout develop && git pull origin develop
- [x] 0.2 Validar rama no existe (local/remoto)
- [x] 0.3 git checkout -b feature/T-14-01-hook-useuserprofile-y-componente-userprofilecard
- [x] 0.4 git branch --show-current

## 1. Contrato `ProfileUserDto`
- [x] 1.1 Añadir `avatarUrl: string | null` a `ProfileUserDto` en `frontend/src/infrastructure/profileApi.ts`, alineado con `components.schemas.UserProfile` de `docs/api-spec.yml` (DoD: `fetchUserProfile()` con manejo de errores HTTP — ya cubierto, solo extender el tipo)

## 2. `useUserProfile` (revisión)
- [x] 2.1 Revisar `frontend/src/application/useUserProfile.ts`: confirmar que expone `loading`, `data` (`user`, incluyendo `avatarUrl`) y `error` (DoD: hook gestiona los tres estados); ajustar solo si los tests del paso 6 detectan un defecto

## 3. Infraestructura de tests de componentes
- [x] 3.1 Añadir devDependencies `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- [x] 3.2 Configurar `vitest.config.ts` con `environmentMatchGlobs: [['frontend/src/**', 'jsdom']]` (o `environment: 'jsdom'` global / `// @vitest-environment jsdom` por archivo si `environmentMatchGlobs` no aplica), manteniendo los tests de `backend/src/**` en `node`

## 4. `UserProfileCard` — skeleton, error, datos y avatar
- [x] 4.1 Helpers de presentación en `UserProfileCard.tsx`: `getDisplayName(user)` (`name ?? email`) y `getInitials(displayName)`
- [x] 4.2 Skeleton con utilidades Tailwind (`animate-pulse`) mientras `loading=true` (DoD: muestra skeleton durante la carga)
- [x] 4.3 Estado de error: mostrar "Usuario desconocido" cuando `error` no nulo (DoD: error → "Usuario desconocido")
- [x] 4.4 Estado de éxito: mostrar `getDisplayName(user)` y `email`; si `name` es `null`, `getDisplayName` devuelve `email` (DoD: `name=null` → muestra email)
- [x] 4.5 Avatar con `Avatar`/`AvatarImage`/`AvatarFallback` de `presentation/components/ui/avatar.tsx`: `AvatarImage` si `avatarUrl` no es `null`, `AvatarFallback` con iniciales en caso contrario (DoD: `avatarUrl=null` → iniciales)

## 5. Tests unitarios (mapeo AC US-14 Sc. 1–4)
- [x] 5.1 `frontend/src/application/useUserProfile.test.ts` (Vitest + `renderHook`, mock `fetch`): API 200 → `data` con `name`/`email`/`avatarUrl` (Sc. 1); error → estado `error` (Sc. 3)
- [x] 5.2 `frontend/src/presentation/components/UserProfileCard.test.tsx` (Vitest + Testing Library, mock `fetch`): muestra nombre/email/avatar en éxito (Sc. 1); skeleton durante `loading` (Sc. 2); "Usuario desconocido" en error (Sc. 3); `name=null` → email como nombre e iniciales desde email (Sc. 4)

## 6. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)
- [x] 6.1 `npm test` (focalizado a `frontend/src/application/useUserProfile.test.ts` y `frontend/src/presentation/components/UserProfileCard.test.tsx`), luego suite completa `npm run test`
- [x] 6.2 `npm run dev:api` + `npm run dev`, verificar `http://localhost:5173`: tarjeta de perfil en cabecera muestra nombre/email reales (backend con datos de seed)
- [x] 6.3 Informe en `openspec/changes/t-14-01-hook-useuserprofile-y-componente-userprofilecard/reports/YYYY-MM-DD-step-06-verification.md`

## 7. E2E → tasks-core §N+3 (OBLIGATORIO)
- [x] 7.1 Playwright MCP: con servidor frontend+API activos, navegar a `http://localhost:5173`, verificar que la cabecera muestra nombre y email del usuario (sin "undefined" ni vacíos)
- [x] 7.2 Informe en `openspec/changes/t-14-01-hook-useuserprofile-y-componente-userprofilecard/reports/YYYY-MM-DD-step-07-e2e-testing.md`

## 8. Documentación → tasks-core §N+4 (OBLIGATORIO)
- [x] 8.1 Actualizar `docs/frontend-standards.md` si cambia la infraestructura de testing (Vitest/jsdom/Testing Library) — sección "Estándares de pruebas"
- [x] 8.2 Confirmar que `docs/api-spec.yml` (`UserProfile.avatarUrl`) ya refleja el contrato usado (sin cambios si ya está alineado)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
