# Design — T-19-01 · Middleware de validación Zod reutilizable

**Ticket:** T-19-01 · **User Story:** US-19 · **Change:** `t-19-01-middleware-de-validacion-zod-reutilizable`

## Context

- **Completado (T-04-02):** `ValidationError` con `details?: Array<{ field, message }>`, `errorHandler` mapea a **400** `{ code: "VALIDATION_ERROR", message, details }`, `asyncHandler` para rutas async.
- **Completado (T-07-01):** `application/validation/habit.ts` con `createHabitSchema`, `updateHabitSchema` y funciones `parseCreateHabitInput` / `parseUpdateHabitInput` que lanzan `ValidationError`.
- **Completado (T-07-02 / T-08-01):** Rutas `POST` y `PATCH /api/habits` en `createApp.ts`; la validación ocurre **dentro** de `createHabit` / `updateHabit` vía parsers, no en middleware HTTP.
- **Pendiente:** `validateBody.ts` no existe; `/api/rewards` no está registrado (T-11-02); no hay `application/validation/reward.ts`.
- **Contrato objetivo:** US-19 Scenario 2 — body inválido → 400 con `details[]` por campo; reutilizable en futuras rutas POST/PATCH.

## Goals / Non-Goals

**Goals:**

- Cumplir DoD T-19-01: factory `validateBody(schema)`, mapeo Zod → `details`, tests unitarios.
- Cablear middleware en `POST /api/habits` y `PATCH /api/habits/:id` sin cambiar el contrato HTTP existente.
- Exportar schemas Zod desde `application/validation/` para DRY entre middleware y casos de uso.
- Añadir `createRewardSchema` listo para `POST /api/rewards` (T-11-02).
- Mantener compatibilidad con `errorHandler` existente (sin cambios en T-04-02).

**Non-goals:**

- Validación frontend (React Hook Form, toasts).
- Middleware para query/path params.
- Implementar rutas o casos de uso de recompensas (T-11-01/T-11-02).
- Eliminar por completo `parseCreateHabitInput` / `parseUpdateHabitInput` — pueden permanecer como defensa en capa aplicación hasta refactor posterior, pero la validación HTTP primaria pasa al middleware.
- Auth middleware o `userId` dinámico.

## Decisions

### 1. Ubicación: `presentation/http/middleware/validateBody.ts`

**Decisión:** Factory en capa presentación; importa `ValidationError` del dominio y `ZodSchema` de `zod`. No depende de Prisma ni casos de uso.

**Alternativa descartada:** Validación solo en aplicación — ya implementada pero no cumple el DoD de middleware reutilizable en Express.

### 2. Firma y flujo del middleware

**Decisión:** Middleware **síncrono** que usa `schema.safeParse(req.body)`:

```typescript
import type { ZodSchema } from 'zod'
import { ValidationError } from '../../../domain/errors/appErrors'

function mapZodIssues(issues: ZodIssue[]): Array<{ field: string; message: string }> {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'input',
    message: issue.message,
  }))
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return next(new ValidationError('Datos inválidos', mapZodIssues(result.error.issues)))
    }
    req.body = result.data
    next()
  }
}
```

- Usar `next(err)` (no `throw`) — middleware síncrono estándar Express 4.
- Sustituir `req.body` por datos parseados/coaccionados por Zod (trim, tipos).

**Alternativa descartada:** Lanzar `ValidationError` sin `next` — no garantiza llegada al `errorHandler` sin wrapper adicional.

### 3. Reutilización de schemas en `application/validation/`

**Decisión:** Refactor mínimo de `habit.ts`:

- Exportar `createHabitSchema` y `updateHabitSchema` (constantes ya definidas).
- Mantener `parseCreateHabitInput` / `parseUpdateHabitInput` delegando en los mismos schemas (tests existentes en `habit.test.ts` siguen válidos).

Crear `application/validation/reward.ts`:

```typescript
export const createRewardSchema = z.object({
  emoji: z.string().trim().min(1, 'El emoji es obligatorio'),
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  cost: z.number().int().positive('El coste debe ser mayor que 0'),
})
```

Alineado con US-11 S1/S4 (`cost > 0`).

### 4. Registro en `createApp.ts`

**Decisión:** Orden de middlewares por ruta:

```typescript
app.post(
  '/api/habits',
  validateBody(createHabitSchema),
  asyncHandler(async (req, res) => { ... })
)

app.patch(
  '/api/habits/:id',
  validateBody(updateHabitSchema),
  asyncHandler(async (req, res) => { ... })
)
```

Importar schemas desde `application/validation/habit`.

**Recompensas:** Si `POST /api/rewards` no existe al aplicar, no registrar ruta nueva. DoD "recompensas" se cumple con `createRewardSchema` exportado + test unitario de `validateBody(createRewardSchema)` simulando body `{ cost: 0 }`. T-11-02 añadirá `validateBody(createRewardSchema)` al registrar la ruta.

### 5. Tests Vitest

**Decisión:** `backend/src/presentation/http/middleware/validateBody.test.ts`:

- Mock `req`, `res`, `next` (patrón similar a `errorHandler.test.ts`).
- Casos: schema simple (p. ej. `z.object({ name: z.string().min(1) })`), happy path, un campo, varios campos.
- Caso integración ligera con `createHabitSchema` / `createRewardSchema` importados.
- Sin supertest ni PostgreSQL en este fichero.

**Regresión:** `createApp.test.ts` debe seguir PASS — los mocks de `createHabit`/`updateHabit` pueden recibir body ya validado; tests 400 pueden mockear fallo en use case **o** probar body inválido real sin mock de validación (preferible al menos un caso E2E supertest con body inválido sin mock).

### 6. Documentación

**Decisión:** Actualizar sección "Patrones de validación" en `docs/backend-standards.md` con ejemplo `validateBody` + enlace a schemas. No modificar `api-spec.yml` salvo nota en descripción de POST/PATCH hábitos indicando validación en middleware (comportamiento 400 sin cambio).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Doble validación (middleware + use case) | Aceptable a corto plazo; misma fuente de schemas evita reglas divergentes |
| `req.body` mutado tras parse puede sorprender handlers | Documentar en backend-standards; tipado sigue siendo `unknown` en Express |
| DoD recompensas sin ruta HTTP | Schema + test unitario; T-11-02 cablea middleware |
| Tests `createApp.test.ts` mockean use case y no middleware | Añadir casos supertest sin mock que envíen body inválido real |

## Migration Plan

1. Implementar `validateBody.ts` + tests unitarios.
2. Exportar schemas en `habit.ts`; crear `reward.ts` con schema.
3. Registrar middleware en rutas hábitos POST/PATCH.
4. Ejecutar `npm test`, curl regresión POST/PATCH inválidos.
5. Actualizar `docs/backend-standards.md`.
6. Sin migración de BD.

## Open Questions

- _(Ninguna bloqueante)_ — Refactor para eliminar parsers duplicados en use cases puede hacerse en ticket posterior si se desea validación única en middleware.
