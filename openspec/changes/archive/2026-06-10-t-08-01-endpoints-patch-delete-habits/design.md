# Design — T-08-01 · Endpoints PATCH y DELETE /api/habits/:id

**Ticket:** T-08-01 · **User Story:** US-08 · **Change:** `t-08-01-endpoints-patch-delete-habits`

## Context

Tras T-07-01 y T-07-02, el vertical slice de hábitos cubre dominio, repositorio Prisma y rutas GET/POST. El puerto `HabitRepository` ya expone `findById`, `update` y `softDelete`; faltan casos de uso de aplicación, validación Zod parcial y rutas HTTP con `:id`.

| Componente | Estado actual | Objetivo T-08-01 |
|------------|---------------|------------------|
| `HabitRepository.update` / `softDelete` | Implementados en Prisma ✅ | Reutilizar sin cambios |
| `HabitRepository.findById` | Implementado ✅ | Usar para ownership check |
| `updateHabit` / `deactivateHabit` | No existen | Crear en capa aplicación |
| `parseUpdateHabitInput` | No existe | Schema Zod parcial en `validation/habit.ts` |
| `createApp.ts` | GET/POST `/api/habits` ✅ | Añadir PATCH/DELETE `/:id` |
| `createApp.test.ts` | Tests GET/POST ✅ | Ampliar PATCH/DELETE |
| `docs/api-spec.yml` | `/api/habits/{id}` PUT/DELETE planificados | PATCH + DELETE implementados |
| `WeekHabit` snapshots | Inmutables por diseño (solo filas `Habit` se actualizan) | Verificar en test DoD |

Referencias: `docs/backend-standards.md` (casos de uso, `NotFoundError`, supertest), `docs/api-spec.yml` (`UpdateHabitRequest`), `docs/data-model.md` (baja lógica, snapshots).

## Goals / Non-Goals

**Goals:**

- Exponer PATCH y DELETE según DoD del ticket con ownership (`userId`) y errores 404 uniformes.
- Centralizar reglas de negocio en casos de uso (`updateHabit`, `deactivateHabit`) reutilizando el puerto existente.
- Validación Zod parcial con mensajes en español; propagación vía `ValidationError` → 400.
- Tests supertest con mocks + test de integridad de snapshots en soft delete (DoD explícito).
- Actualizar OpenAPI: PATCH (no PUT) alineado al ticket y backlog.

**Non-Goals:**

- Auth middleware / `userId` dinámico.
- Mutar `WeekHabit` o `HabitEntry` al editar/desactivar.
- Endpoints de semanas o entradas diarias.
- Cambios en schema Prisma.
- Frontend / E2E.

## Decisions

### 1. Casos de uso con verificación de ownership

**Decisión:** Patrón compartido en ambos casos de uso:

```typescript
async function assertHabitOwnedByUser(
  repo: HabitRepository,
  habitId: number,
  userId: number
): Promise<Habit> {
  const habit = await repo.findById(habitId)
  if (!habit || habit.userId !== userId) {
    throw new NotFoundError('Hábito no encontrado', 'HABIT_NOT_FOUND')
  }
  return habit
}
```

Extraer helper interno en un módulo compartido (p. ej. `application/habitOwnership.ts`) o duplicar mínima lógica inline en cada caso de uso — preferir helper compartido si evita duplicación.

**Rationale:** US-08 esc. 3 — 404 genérico sin filtrar por `isActive` (permite PATCH/DELETE sobre inactivos si existieran; GET list ya los excluye).

**Alternativa descartada:** Filtrar `isActive: true` en búsqueda — rechazaría re-edición de hábitos ya desactivados sin beneficio en MVP.

### 2. `updateHabit(repo, userId, habitId, input)`

**Decisión:**

1. `assertHabitOwnedByUser`
2. `parseUpdateHabitInput(input)` → `UpdateHabitData` parcial
3. `repo.update(habitId, parsedData)` → `Habit`

**Rationale:** Solo actualiza tabla `Habit`; Prisma no toca `WeekHabit` — cumple US-08 esc. 1 y 4 por diseño relacional.

### 3. `deactivateHabit(repo, userId, habitId)`

**Decisión:**

1. `assertHabitOwnedByUser`
2. `repo.softDelete(habitId)` → `Habit` (descartar retorno en handler HTTP)

**Rationale:** Baja lógica ya implementada en repositorio T-07-01; `onDelete: Restrict` en FK preserva histórico.

### 4. Validación Zod parcial — `parseUpdateHabitInput`

**Decisión:** Extender `validation/habit.ts`:

```typescript
const updateHabitSchema = z
  .object({
    emoji: z.string().trim().min(1, 'El emoji es obligatorio').optional(),
    name: z.string().trim().min(1, 'El nombre es obligatorio').optional(),
    pointsPerDay: z.number().int().positive('Los puntos por día deben ser mayores que 0').optional(),
    penalty: z.number().int().min(0, 'La penalización no puede ser negativa').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar',
    path: ['input'],
  })
```

**Alternativa descartada:** Reutilizar `createHabitSchema` completo — PATCH debe aceptar campos parciales.

### 5. Handlers HTTP delgados

**Decisión:**

```typescript
app.patch(
  '/api/habits/:id',
  asyncHandler(async (req, res) => {
    const habitId = parseHabitIdParam(req.params.id) // NaN → NotFoundError
    const habit = await updateHabit(habitRepository, 1, habitId, req.body)
    return res.status(200).json(habit)
  })
)

app.delete(
  '/api/habits/:id',
  asyncHandler(async (req, res) => {
    const habitId = parseHabitIdParam(req.params.id)
    await deactivateHabit(habitRepository, 1, habitId)
    return res.status(204).send()
  })
)
```

`parseHabitIdParam`: `Number.parseInt(id, 10)`; si `NaN` → `NotFoundError('Hábito no encontrado', 'HABIT_NOT_FOUND')`.

**Rationale:** Consistente con T-07-02; validación de negocio en aplicación.

### 6. Código de error `HABIT_NOT_FOUND`

**Decisión:** `new NotFoundError('Hábito no encontrado', 'HABIT_NOT_FOUND')` — `errorHandler` ya mapea `NotFoundError` → 404 con `code` del error.

**Alternativa descartada:** 403 Forbidden — el backlog exige 404 para no revelar existencia ajena.

### 7. Tests HTTP con `vi.mock`

**Decisión:** Ampliar `createApp.test.ts` mockeando `updateHabit` y `deactivateHabit`:

| Caso | Expectativa |
|------|-------------|
| PATCH válido | 200 + cuerpo mock |
| PATCH ValidationError | 400 `VALIDATION_ERROR` |
| PATCH NotFoundError | 404 `HABIT_NOT_FOUND` |
| DELETE happy | 204, body vacío |
| DELETE NotFoundError | 404 `HABIT_NOT_FOUND` |
| PATCH id inválido (`abc`) | 404 sin invocar use case (parse param) |

### 8. Test de snapshots WeekHabit (DoD)

**Decisión:** Test en `deactivateHabit.test.ts` con mock de repositorio que:

1. Simula `findById` → hábito del usuario.
2. Simula `softDelete` → `isActive: false`.
3. Verifica que el test **no** invoca ningún método que mutaría `WeekHabit` (el repo actual no los tiene — documentar invariante).

Para mayor robustez en apply: test de integración opcional con Prisma test DB **o** test que consulte `WeekHabit` antes/después vía mock de `prisma` si se añade lectura en test. Enfoque mínimo alineado al DoD: test unitario del caso de uso + comentario en curl paso N+2 verificando snapshots en BD seed tras DELETE.

**Alternativa preferida en apply:** `deactivateHabit.integration.test.ts` condicional o script curl que lee `WeekHabit` vía psql tras DELETE — documentar en tasks.

### 9. Actualización `api-spec.yml`

**Decisión:** En paso docs (§N+4):

- Reemplazar `put` por `patch` en `/api/habits/{id}` con `UpdateHabitRequest`.
- Marcar DELETE como implementado; documentar 404 `HABIT_NOT_FOUND` y 400 en PATCH.
- Respuesta PATCH 200 → `HabitApi` (consistente con GET/POST T-07-02).
- DELETE 204 sin body.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| OpenAPI tenía PUT, ticket pide PATCH | Actualizar spec a PATCH; no registrar PUT |
| Snapshots no mutados es invariante de BD, no lógica explícita | Test documenta invariante; curl verifica post-DELETE |
| PATCH sobre hábito ya inactivo | Permitido (404 solo si no existe o userId distinto); GET list ya lo oculta |
| `userId` hardcodeado | Consistente con T-07-02; auth en ticket posterior |
| Tests mockean casos de uso | DoD del ticket; curl valida persistencia real |

## Migration Plan

1. Añadir `parseUpdateHabitInput` + tests en `validation/habit.ts`.
2. Crear `updateHabit.ts`, `deactivateHabit.ts` + tests unitarios.
3. Registrar rutas PATCH/DELETE en `createApp.ts`.
4. Ampliar `createApp.test.ts`; `npm test`.
5. `npm run dev:api` + curl PATCH/DELETE contra PostgreSQL.
6. Actualizar `docs/api-spec.yml`.
7. Sin migración de BD.

**Rollback:** Revertir casos de uso, rutas, tests y docs.

## Open Questions

_(Ninguna bloqueante — alcance cerrado por DoD del ticket.)_
