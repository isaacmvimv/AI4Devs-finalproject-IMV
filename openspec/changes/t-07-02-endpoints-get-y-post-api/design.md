# Design — T-07-02 · Endpoints GET y POST /api/habits

**Ticket:** T-07-02 · **User Story:** US-07 · **Change:** `t-07-02-endpoints-get-y-post-api`

## Context

Tras T-07-01, el vertical slice de hábitos está completo en dominio/aplicación/infraestructura:

| Componente | Estado tras T-07-01 | Estado objetivo T-07-02 |
|------------|---------------------|-------------------------|
| `createHabit` + `parseCreateHabitInput` | Valida Zod; lanza `ValidationError`; persiste vía repo ✅ | Sin cambios |
| `getActiveHabits` | Delega a `findActiveByUserId` ✅ | Sin cambios |
| `createPrismaHabitRepository` | CRUD Prisma completo ✅ | Sin cambios |
| `errorHandler` | Mapea `ValidationError` → 400 `{ code, message, details }` ✅ | Reutilizar tal cual |
| `createApp.ts` | Solo `/health` y `/api/profile`; sin `habitRepository` | Añadir repo + rutas GET/POST |
| `createApp.test.ts` | Tests solo para `/api/profile` | Ampliar con GET/POST habits |
| `docs/api-spec.yml` | `/api/habits` marcado PLANIFICADO; schema `Habit` con campos UI | Implementado + schema API backend |

Referencias: `docs/backend-standards.md` (asyncHandler, errorHandler, supertest), `docs/api-spec.yml` (`CreateHabitRequest`, respuestas 200/201/400).

## Goals / Non-Goals

**Goals:**

- Completar la capa HTTP para creación y listado según DoD del ticket.
- Reutilizar casos de uso existentes sin duplicar validación en handlers.
- Cubrir happy path y errores de validación con supertest + mock (patrón T-06-02).
- Validar manualmente con curl contra seed/PostgreSQL.

**Non-Goals:**

- Auth / `userId` dinámico.
- PATCH/DELETE (T-08-01).
- Cambios en dominio, repositorio o schemas Zod.
- Serialización especial de `createdAt` más allá de `JSON.stringify` (ISO string en respuesta HTTP).
- E2E Playwright.

## Decisions

### 1. Wiring de `habitRepository` en `createApp`

**Decisión:** Instanciar junto a `userRepository`:

```typescript
const habitRepository = createPrismaHabitRepository(prisma)
```

**Rationale:** Mismo patrón que `createPrismaUserRepository`; T-07-01 dejó explícitamente el cableado para este ticket.

### 2. Handlers delgados delegando en casos de uso

**Decisión:**

```typescript
app.get(
  '/api/habits',
  asyncHandler(async (_req, res) => {
    const habits = await getActiveHabits(habitRepository, 1)
    return res.status(200).json(habits)
  })
)

app.post(
  '/api/habits',
  asyncHandler(async (req, res) => {
    const habit = await createHabit(habitRepository, 1, req.body)
    return res.status(201).json(habit)
  })
)
```

**Rationale:** Validación Zod ya vive en `createHabit`; `ValidationError` propaga a `errorHandler`. Consistente con `GET /api/profile`.

**Alternativa descartada:** Middleware Zod separado en capa HTTP — duplicaría reglas ya centralizadas en T-07-01.

### 3. Formato de respuesta GET vs POST

**Decisión:**

- **GET 200:** serializar array de `Habit` tal cual retorna el caso de uso (`id`, `userId`, `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive`, `createdAt`). El DoD del ticket lista campos mínimos; incluir `userId` no contradice el contrato.
- **POST 201:** serializar `Habit` completo incluyendo `userId` e `isActive: true` (US-07 esc. 1).

**Alternativa descartada:** Mapeo DTO distinto por ruta — innecesario en MVP; el tipo de dominio ya coincide con persistencia.

### 4. Tests HTTP con `vi.mock` de casos de uso

**Decisión:**

1. Ampliar `backend/src/presentation/http/createApp.test.ts`.
2. Mockear `../../application/createHabit` y `../../application/getActiveHabits` con `vi.mock`.
3. Casos:
   - GET → 200 con array mock.
   - GET → 200 con `[]`.
   - POST válido → 201 con cuerpo mock.
   - POST inválido → mock `createHabit` rechaza con `ValidationError` → 400 + `details`.

**Alternativa descartada:** Tests solo contra BD real — el DoD pide supertest + mocks; curl cubre integración real en paso N+2.

### 5. Actualización de `api-spec.yml`

**Decisión:** En paso docs (§N+4):

- Cambiar summaries de `/api/habits` GET/POST de `(PLANIFICADO)` a implementado.
- Añadir respuesta 400 en POST referenciando `ApiErrorResponse` con ejemplo `VALIDATION_ERROR`.
- Introducir schema `HabitApi` (o ajustar `Habit`) para respuestas backend: `id` (integer), `userId`, `isActive`, `createdAt` (date-time); mantener `CreateHabitRequest` existente.
- Documentar que `streak`/`completionStatus` del schema legacy pertenecen al contrato frontend futuro, no a estos endpoints.

### 6. curl manual

**Decisión:** Paso N+2:

```bash
curl -s http://localhost:3001/api/habits
curl -s -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -d '{"emoji":"🏃","name":"Correr","pointsPerDay":10,"penalty":5}'
curl -s -X POST ... -d '{"name":"","pointsPerDay":10,"penalty":5,"emoji":"🏃"}'  # 400
```

Restaurar BD si el POST de prueba contamina datos de demo (eliminar fila insertada o `npm run db:seed`).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| `createdAt` serializado como string ISO vs Date | Express `res.json` convierte Date; tests comparan campos relevantes |
| Schema OpenAPI `Habit` mezcla campos UI y API | Documentar split o schema `HabitApi` en paso docs |
| Tests mockean casos de uso, no Prisma | DoD del ticket; curl valida persistencia real |
| `userId` hardcodeado | Consistente con `/api/profile`; auth en ticket posterior |

## Migration Plan

1. Importar casos de uso y factory del repositorio en `createApp.ts`.
2. Registrar rutas GET/POST.
3. Ampliar tests HTTP; `npm test`.
4. `npm run dev:api` + curl contra PostgreSQL.
5. Actualizar `docs/api-spec.yml`.
6. Sin migración de BD.

**Rollback:** Revertir rutas, tests y docs.

## Open Questions

_(Ninguna bloqueante — alcance cerrado por DoD del ticket.)_
