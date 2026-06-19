# Design — T-20-03 · Tests de integración de endpoints principales del backend

**Ticket:** T-20-03 · **User Story:** US-20 · **Change:** `t-20-03-tests-integracion-endpoints`

## Context

El backend tiene tests unitarios con mocks para cada caso de uso y para `createApp` (via `vi.mock`). No existen tests de integración que validen el flujo HTTP → Express → caso de uso → Prisma → PostgreSQL real. El archivo `createApp.test.ts` actual mockea todos los casos de uso y solo valida el ruteo HTTP, no la integración real con la BD.

El proyecto ya usa Docker para PostgreSQL (`npm run docker:up`), Prisma para migraciones, y Vitest como framework de test.

## Goals / Non-Goals

**Goals:**
- Tests de integración contra PostgreSQL real (contenedor Docker) para 4 endpoints críticos.
- Helpers reutilizables (`createTestApp`, `resetDb`, seeders) para futuros tests de integración.
- Aislamiento entre tests (limpieza de BD en `beforeEach`).

**Non-Goals:**
- No se configura una BD SQLite alternativa; se usa PostgreSQL para paridad con producción.
- No se cubre CI/CD ni ejecución automática en pipeline.
- No se modifican endpoints ni lógica de negocio.

## Decisions

### D1: PostgreSQL efímero via Docker (misma instancia, BD separada)

Usar el mismo contenedor Docker de desarrollo pero con una `DATABASE_URL` apuntando a una BD de test separada (p. ej. `conrutina_test`). Alternativa descartada: contenedor Docker efímero por test run (más lento, más complejo).

**Razón:** simplicidad; el contenedor Docker ya existe en el setup del proyecto. Una BD separada garantiza aislamiento sin overhead de levantar/parar contenedores.

### D2: supertest sobre la app Express en memoria

Usar `supertest(createApp(prisma))` con un `PrismaClient` conectado a la BD de test. No se levanta servidor HTTP; supertest maneja el transporte internamente.

**Razón:** estándar de la industria para tests de integración Express; ya existe como dependencia (`createApp.test.ts` lo usa). Evita conflictos de puertos.

### D3: Limpieza con deleteMany en transacción

En `beforeEach`, ejecutar `prisma.$transaction([...deleteMany...])` en orden inverso de dependencias FK para vaciar tablas. Seed específico por test o bloque `describe`.

**Razón:** más rápido que recrear el schema; compatible con Prisma sin extensiones adicionales.

### D4: Estructura de archivos

```
backend/src/__tests__/integration/
├── helpers/
│   ├── testApp.ts          # createTestApp(): { app, prisma }
│   ├── resetDb.ts          # resetDb(prisma): limpia tablas
│   └── seeders.ts          # seedUser(), seedHabitWithWeek(), seedReward()...
├── profile.integration.test.ts
├── habits.integration.test.ts
├── habitEntries.integration.test.ts
└── redemptions.integration.test.ts
```

**Razón:** separar tests de integración de los unitarios (pattern `*.integration.test.ts`). Helpers en subdirectorio para reutilización.

### D5: Variable de entorno DATABASE_URL para test

Usar `dotenv` con un `.env.test` o variable de entorno explícita. El `vitest.config.ts` o un setup file carga la URL de BD de test. Alternativa: configurar en `vitest.workspace` un proyecto separado para integración.

**Razón:** permite ejecutar `npm run test:integration` sin afectar la BD de desarrollo.

### D6: Script npm separado

Añadir `"test:integration": "vitest run --config vitest.integration.config.ts"` o usar un patrón glob que solo incluya `*.integration.test.ts`.

**Razón:** permite ejecutar tests unitarios e integración por separado; los de integración requieren Docker activo.

## Risks / Trade-offs

- **[Dependencia Docker]** → Los tests de integración requieren PostgreSQL activo. Si Docker no está corriendo, fallan. Mitigación: documentar prerequisito y verificar conexión en setup con mensaje claro.
- **[Velocidad]** → Tests contra BD real son más lentos que mocks. Mitigación: solo 4 endpoints × 2 escenarios = ~8 tests; impacto mínimo.
- **[Estado compartido]** → Si `resetDb` falla, tests posteriores pueden contaminar. Mitigación: `afterAll` con disconnect de Prisma y limpieza final.

## Open Questions

_(ninguna — el alcance está bien definido por el DoD del ticket)_
