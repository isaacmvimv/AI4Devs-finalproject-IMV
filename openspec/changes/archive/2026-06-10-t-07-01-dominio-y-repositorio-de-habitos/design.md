# Design — T-07-01 · Dominio y repositorio de hábitos (crear, listar, desactivar)

**Ticket:** T-07-01 · **User Story:** US-07 · **Change:** `t-07-01-dominio-y-repositorio-de-habitos`

## Context

El monorepo tiene infraestructura backend lista (T-04-01 ✅) y modelo Prisma `Habit` migrado (T-03-02 ✅) con seed demo (T-03-03 ✅). Patrón de referencia reciente: T-06-01 (`UserProfile`, `UserReadRepository`, `getUserProfileById`, tests con mock).

| Componente | Estado actual | Objetivo T-07-01 |
|------------|---------------|------------------|
| `backend/prisma/schema.prisma` → `Habit` | Modelo completo ✅ | Sin cambios de esquema |
| `backend/src/domain/habit.ts` | No existe | Tipo `Habit` + tipos de entrada |
| `backend/src/application/ports/HabitRepository.ts` | No existe | Puerto con 5 métodos (DoD) |
| `backend/src/infrastructure/prismaHabitRepository.ts` | No existe | Implementación Prisma |
| `backend/src/application/validation/habit.ts` | No existe (referenciado en standards) | Schema Zod + mapper a `ValidationError` |
| `backend/src/application/createHabit.ts` | No existe | Validación + `repo.create` |
| `backend/src/application/getActiveHabits.ts` | No existe | Delegación a `findActiveByUserId` |
| `backend/src/presentation/http/createApp.ts` | Sin rutas `/api/habits` | **Sin cambios** (T-07-02) |
| `frontend/src/domain/habit.ts` | Estado React local | **Sin cambios** (frontend posterior) |

Referencias: `docs/backend-standards.md` (puertos, Zod, `ValidationError`), `docs/data-model.md` (reglas `pointsPerDay ≥ 1`, `penalty ≥ 0`), `docs/api-spec.yml` (contrato futuro — no implementar aquí).

## Goals / Non-Goals

**Goals:**

- Implementar vertical slice dominio + aplicación + infraestructura para crear y listar hábitos activos según DoD del ticket.
- Preparar puerto completo (`update`, `softDelete`) para tickets de edición/desactivación sin exponer HTTP aún.
- Validación Zod con mensajes en español alineados a US-07 esc. 3–5.
- Tests unitarios con mock de repositorio (patrón `getUserProfile.test.ts`).

**Non-Goals:**

- Rutas Express `GET/POST /api/habits` — T-07-02.
- Wiring de `habitRepository` en `createApp.ts` / `main.ts` — puede hacerse en T-07-02 al registrar endpoints.
- Casos de uso HTTP para `update`/`softDelete`.
- Migración frontend desde fixtures.

## Decisions

### 1. Tipo `Habit` como interface de dominio (no clase)

**Decisión:** `export interface Habit { ... }` en `domain/habit.ts`, igual que `UserProfile`.

**Alternativa descartada:** Clase con métodos de negocio — el ticket es CRUD acotado; validación vive en Zod + casos de uso.

### 2. Tipos de datos del puerto separados del input HTTP

**Decisión:**

```typescript
// domain/habit.ts
export interface CreateHabitData {
  userId: number
  emoji: string
  name: string
  pointsPerDay: number
  penalty: number
}

export interface UpdateHabitData {
  emoji?: string
  name?: string
  pointsPerDay?: number
  penalty?: number
}
```

El caso de uso `createHabit` recibe `input: unknown`, valida con Zod, y construye `CreateHabitData` con `userId` inyectado.

**Rationale:** Desacopla body HTTP (T-07-02) de persistencia; reutilizable en tests.

### 3. Validación Zod centralizada con helper `parseCreateHabitInput`

**Decisión:** Schema Zod en `application/validation/habit.ts`:

```typescript
const createHabitSchema = z.object({
  emoji: z.string().trim().min(1, 'El emoji es obligatorio'),
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  pointsPerDay: z.number().int().positive('Los puntos por día deben ser mayores que 0'),
  penalty: z.number().int().min(0, 'La penalización no puede ser negativa'),
})
```

En error Zod → `ValidationError('Datos inválidos', details)` mapeando `field` + `message` (mismo patrón que config Zod T-04-03).

**Alternativa descartada:** Validación inline en el caso de uso — duplica reglas y dificulta reuso en T-07-02.

### 4. `softDelete` como `update` con `isActive: false`

**Decisión:** `softDelete(id)` ejecuta `prisma.habit.update({ where: { id }, data: { isActive: false } })`.

**Rationale:** Cumple DoD del puerto y US-07 esc. 2 (inactivos excluidos del listado) sin borrado físico (histórico `WeekHabit` con `onDelete: Restrict`).

### 5. `findActiveByUserId` con filtro Prisma explícito

**Decisión:**

```typescript
prisma.habit.findMany({
  where: { userId, isActive: true },
  orderBy: { createdAt: 'asc' },
})
```

**Rationale:** Garantiza esc. 2 en repositorio; el caso de uso es delegación fina (testeable por separado).

### 6. Factory `createPrismaHabitRepository(prisma: PrismaClient)`

**Decisión:** Misma convención que `createPrismaUserRepository`; función pura que retorna objeto que implementa el puerto.

**Impacto:** T-07-02 instanciará en `main.ts` o deps de `createApp` junto a `userRepository`.

### 7. Tests: mock manual del puerto (sin Prisma)

**Decisión:** Objetos parciales `HabitRepository` en Vitest, verificando:

**createHabit.test.ts:**
1. Input válido → `repo.create` llamado una vez con `userId` + campos + resultado devuelto.
2. `name` vacío → `ValidationError`, `create` no llamado.
3. `pointsPerDay: 0` → `ValidationError`.
4. Sin `emoji` → `ValidationError`.
5. `penalty: -1` → `ValidationError`.

**getActiveHabits.test.ts:**
1. Repo devuelve 2 hábitos → mismo array al caller.
2. Repo devuelve `[]` → `[]`.

### 8. Firma de casos de uso: `(repo, userId, input?)`

**Decisión:** `createHabit(repo, userId, input)` y `getActiveHabits(repo, userId)` — inyección explícita del puerto (consistente con `getUserProfileById(repo, id)`).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Duplicación de reglas entre Zod y `data-model.md` | Mantener mensajes alineados a US-07; documentar en paso N+4 si hay divergencia |
| Puerto `update`/`softDelete` sin tests en DoD | Implementar métodos en Prisma repo; tests opcionales mínimos o deferidos — no bloquean DoD |
| `createApp` no compila si se importa repo sin usar | No cablear deps hasta T-07-02 |
| Seed demo con ids fijos de hábitos | Sin migración; tests unitarios no tocan BD |

## Migration Plan

1. Crear `domain/habit.ts` → compilar.
2. Crear puerto + tipos en `application/ports/HabitRepository.ts`.
3. Implementar `prismaHabitRepository.ts`.
4. Añadir `validation/habit.ts` + `createHabit.ts` + `getActiveHabits.ts`.
5. Añadir tests; ejecutar `npm test -- backend/src/application/createHabit.test.ts backend/src/application/getActiveHabits.test.ts`.
6. Verificación: `npm test` + `npm run dev:api` (compilación).
7. Sin migración Prisma (tabla `Habit` ya existe).

**Rollback:** Eliminar archivos nuevos bajo `domain/`, `application/`, `infrastructure/` relacionados con hábitos.

## Open Questions

_(Ninguna bloqueante — alcance cerrado por DoD del ticket.)_
