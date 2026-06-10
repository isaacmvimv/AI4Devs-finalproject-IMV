# Design — T-06-02 · Endpoint GET /api/profile

**Ticket:** T-06-02 · **User Story:** US-06 · **Change:** `t-06-02-endpoint-get-api-profile`

## Context

Tras T-06-01, el vertical slice de lectura de perfil está completo en dominio/aplicación/infraestructura:

| Componente | Estado tras T-06-01 | Estado objetivo T-06-02 |
|------------|---------------------|-------------------------|
| `getUserProfileById` | Lanza `NotFoundError`; retorna `UserProfile` con `avatarUrl` ✅ | Sin cambios |
| `errorHandler` | Mapea `NotFoundError` → 404 `{ code, message }` ✅ | Reutilizar tal cual |
| `createApp.ts` — `GET /api/profile` | Ruta registrada con lógica legacy: `if (!user)` + 404 `{ error }`, respuesta sin `avatarUrl` | Delegar en caso de uso; serializar DTO completo; sin 404 inline |
| `docs/api-spec.yml` | 404 referencia `LegacyErrorResponse`; ejemplo 200 sin `avatarUrl` | Alinear con contrato estándar |
| Tests HTTP | No existen; `supertest` no está en `package.json` | Añadir devDependency + tests con mock |

Referencias: `docs/backend-standards.md` (asyncHandler, errorHandler, tests HTTP con supertest), `docs/api-spec.yml` (`UserProfile`, `ApiErrorResponse`).

## Goals / Non-Goals

**Goals:**

- Completar la capa de presentación HTTP para lectura de perfil según DoD del ticket.
- Eliminar formato legacy 404 en `/api/profile`.
- Cubrir happy path y not-found con tests supertest + mock (sin BD real).
- Validar manualmente con curl contra seed (`id=1`).

**Non-Goals:**

- Auth / `userId` dinámico.
- Cambios en caso de uso, repositorio o Prisma.
- Fallback `name ?? email` (frontend).
- Tests de integración E2E con BD (US-19).

## Decisions

### 1. Simplificar handler: eliminar rama `if (!user)`

**Decisión:** Reemplazar el bloque actual por:

```typescript
app.get(
  '/api/profile',
  asyncHandler(async (_req, res) => {
    const user = await getUserProfileById(userRepository, 1)
    return res.json(user)
  })
)
```

**Rationale:** `getUserProfileById` ya no retorna `null`; `NotFoundError` propaga a `errorHandler` vía `asyncHandler`. Consistente con el patrón documentado en `backend-standards.md` para handlers posteriores.

**Alternativa descartada:** Mantener `try/catch` local con `res.status(404)` — duplica lógica del `errorHandler`.

### 2. Serializar `UserProfile` completo (incl. `avatarUrl`)

**Decisión:** `res.json(user)` sin mapeo manual de campos.

**Rationale:** El DTO de dominio ya coincide con el contrato OpenAPI; evita omisiones futuras.

### 3. Tests HTTP con `vi.mock` del caso de uso + supertest

**Decisión:**

1. Añadir `supertest` y `@types/supertest` como `devDependencies` en `package.json` raíz.
2. Crear `backend/src/presentation/http/createApp.test.ts` (o `profileRoute.test.ts`).
3. Mockear `../../application/getUserProfile` con `vi.mock` + `vi.mocked(getUserProfileById)`.
4. Instanciar app con Prisma mock mínimo (`vi.fn()` stubs) o cliente Prisma no usado (el mock del caso de uso evita tocar BD).

**Alternativa descartada:** Refactorizar `createApp` con inyección de dependencias — scope mayor que el ticket (S, 1 SP).

**Patrón de test:**

```typescript
vi.mock('../../application/getUserProfile', () => ({
  getUserProfileById: vi.fn(),
}))

// happy path: mockResolvedValue(profile) → expect 200 + body
// not found: mockRejectedValue(new NotFoundError('Usuario no encontrado')) → expect 404 + { code, message }
```

### 4. Actualizar `api-spec.yml` en paso docs

**Decisión:** En `/api/profile`:

- Añadir `avatarUrl` al schema `UserProfile` y al ejemplo 200.
- Cambiar respuesta 404 de `LegacyErrorResponse` a `ApiErrorResponse` con ejemplo `{ code: "USER_NOT_FOUND", message: "Usuario no encontrado" }`.
- Eliminar notas "legacy hasta T-06-01".

### 5. curl manual contra servidor real + seed

**Decisión:** Paso N+2 ejecuta `curl http://localhost:3001/api/profile` con `npm run dev:api` y PostgreSQL activo (`npm run db:up`), validando datos del seed.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| `supertest` nueva dependencia | Alcance mínimo; alineado con backlog y `backend-standards.md` |
| Tests mockean caso de uso, no integración real | DoD del ticket pide supertest + mock; integración BD queda en US-19 |
| `if (!user)` era código muerto pero compilaba | Eliminarlo no rompe tipos (`UserProfile` no es nullable) |
| Regresión en consumidores que esperaban 404 legacy | MVP greenfield; contrato US-06 es el objetivo |

## Migration Plan

1. Instalar `supertest` + tipos.
2. Refactorizar handler en `createApp.ts`.
3. Añadir tests HTTP; `npm test`.
4. `npm run dev:api` + curl contra seed.
5. Actualizar `api-spec.yml` y `backend-standards.md`.
6. Sin migración de BD.

**Rollback:** Revertir handler, tests, dependencias y docs.

## Open Questions

_(Ninguna bloqueante — alcance cerrado por DoD del ticket.)_
