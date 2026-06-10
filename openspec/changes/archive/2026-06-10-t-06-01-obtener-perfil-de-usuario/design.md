# Design — T-06-01 · Implementar repositorio y caso de uso: obtener perfil de usuario

**Ticket:** T-06-01 · **User Story:** US-06 · **Change:** `t-06-01-obtener-perfil-de-usuario`

## Context

El monorepo ya tiene capas Clean Architecture parcialmente pobladas durante T-04-01:

| Archivo | Estado actual | Objetivo T-06-01 |
|---------|---------------|------------------|
| `backend/src/domain/userProfile.ts` | `id`, `name`, `email` — sin `avatarUrl` | Añadir `avatarUrl: string \| null` |
| `backend/src/application/ports/UserReadRepository.ts` | Interfaz con `findById` ✅ | Sin cambios de firma |
| `backend/src/infrastructure/prismaUserRepository.ts` | Mapeo parcial (sin `avatarUrl`) | Mapear `avatarUrl` desde Prisma |
| `backend/src/application/getUserProfile.ts` | Devuelve `UserProfile \| null` | Lanzar `NotFoundError`; retorno `Promise<UserProfile>` |
| `backend/src/presentation/http/createApp.ts` | 404 inline `{ error: "..." }` | **Sin cambios** (T-06-02) |
| `backend/src/domain/errors/appErrors.ts` | `NotFoundError` con `USER_NOT_FOUND` ✅ | Reutilizar tal cual |

El modelo Prisma `User` ya incluye `avatarUrl String?` (T-03-02). El seed demo tiene usuario `id=1`.

Referencias: `docs/backend-standards.md` (inyección de puertos, tests con mock de repositorio), `docs/data-model.md` / `schema.prisma` (campo `avatarUrl`).

## Goals / Non-Goals

**Goals:**

- Completar el vertical slice de **lectura** de perfil en dominio + aplicación + infraestructura según DoD del ticket.
- Alinear semántica de error de aplicación con US-06 esc. 3 (`NotFoundError` / `USER_NOT_FOUND`).
- Cubrir happy path y edge con tests unitarios Vitest y repositorio mockeado.

**Non-Goals:**

- Capa HTTP (`GET /api/profile`, formato JSON 404) — T-06-02.
- Fallback UI `name ?? email` — frontend posterior.
- Auth / resolución de `userId` desde token.

## Decisions

### 1. Mantener nombre `getUserProfileById` (no renombrar a `getUserProfile`)

**Decisión:** Conservar `getUserProfileById(repo, id)` como en `backend-standards.md` y código existente.

**Alternativa descartada:** Renombrar a `getUserProfile(userId)` del backlog — rompería imports en `createApp.ts` sin beneficio.

### 2. `NotFoundError` en capa aplicación, `null` en puerto/repositorio

**Decisión:** El repositorio sigue devolviendo `null` si no hay fila; el caso de uso traduce `null` → `throw new NotFoundError('Usuario no encontrado')` (constructor por defecto usa `USER_NOT_FOUND`).

**Rationale:** Separa persistencia (ausencia de dato) de regla de negocio (perfil inexistente para el caller). Consistente con ejemplos de `backend-standards.md` y prepara T-06-02 para mapear `NotFoundError` → HTTP 404 vía `errorHandler`.

### 3. Tipo de retorno del caso de uso: `Promise<UserProfile>`

**Decisión:** Eliminar `| null` del retorno de `getUserProfileById`; ausencia = excepción.

**Impacto en `createApp.ts`:** La rama `if (!user)` queda muerta hasta T-06-02; no rompe compilación. Errores no capturados propagan a `asyncHandler` → `errorHandler` (comportamiento deseable hacia T-06-02).

### 4. Mapeo Prisma → dominio en un solo lugar

**Decisión:** Extender el objeto retornado en `prismaUserRepository.ts`:

```typescript
return {
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
}
```

Sin DTO intermedio adicional — el ticket es acotado (S, 2 SP).

### 5. Tests con mock in-memory del puerto

**Decisión:** `getUserProfile.test.ts` mockea `UserReadRepository` (patrón documentado en `backend-standards.md`), sin Prisma ni BD.

**Casos mínimos:**

1. Repo devuelve perfil → mismo objeto al caller.
2. Repo devuelve `null` → `NotFoundError` con `code === 'USER_NOT_FOUND'`.
3. Perfil con `name: null`, `avatarUrl: null` → valores preservados.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| `createApp` sigue respondiendo 404 legacy si el usuario no existe **antes** de que el error llegue al handler | Aceptado hasta T-06-02; tras T-06-01, `getUserProfileById` lanza y `errorHandler` puede devolver `{ code, message }` cuando se elimine el `if (!user)` |
| Regresión en smoke `/api/profile` con usuario seed | Usuario id=1 existe en seed; happy path intacto |
| Documentación `backend-standards.md` con ejemplos sin `avatarUrl` | Actualizar snippets afectados en paso N+4 docs |

## Migration Plan

1. Actualizar `userProfile.ts` → compilar.
2. Actualizar `prismaUserRepository.ts` → compilar.
3. Refactorizar `getUserProfile.ts` + ajustar tipo de retorno.
4. Añadir tests; `npm test backend/src/application/getUserProfile.test.ts`.
5. Verificación: `npm test` focalizado + suite backend.
6. Sin migración de BD (columna `avatarUrl` ya existe).

**Rollback:** Revertir los cuatro archivos de aplicación/dominio/infra/tests.

## Open Questions

_(Ninguna bloqueante — alcance cerrado por DoD del ticket.)_
