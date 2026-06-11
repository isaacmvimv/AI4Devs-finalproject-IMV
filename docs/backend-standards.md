---
description: Estándares de desarrollo backend, buenas prácticas y convenciones para la aplicación ConRutina en Node.js/TypeScript/Express, incluyendo Clean Architecture, principios SOLID, patrones de arquitectura, diseño de API y prácticas de pruebas
globs:
  - "backend/src/**/*.ts"
  - "backend/prisma/**/*.{prisma,ts}"
  - "backend/tsconfig.json"
  - "backend/package.json"
  - "docs/api-spec.yml"
  - "openspec/changes/**/design.md"
  - "openspec/changes/**/tasks.md"
  - "openspec/changes/**/specs/**/*.md"
alwaysApply: false
---

# Estándares y buenas prácticas del backend — ConRutina

## Índice

- [Resumen](#resumen)
- [Stack tecnológico](#stack-tecnológico)
  - [Tecnologías principales](#tecnologías-principales)
  - [Base de datos y ORM](#base-de-datos-y-orm)
  - [Framework de pruebas](#framework-de-pruebas)
  - [Herramientas de desarrollo](#herramientas-de-desarrollo)
- [Visión de arquitectura](#visión-de-arquitectura)
  - [Clean Architecture](#clean-architecture)
  - [Arquitectura por capas](#arquitectura-por-capas)
  - [Estructura del proyecto](#estructura-del-proyecto)
- [Principios de Clean Architecture](#principios-de-clean-architecture)
  - [Entidades y objetos de valor](#entidades-y-objetos-de-valor)
  - [Casos de uso (servicios de aplicación)](#casos-de-uso-servicios-de-aplicación)
  - [Interfaces puerto (inversión de dependencias)](#interfaces-puerto-inversión-de-dependencias)
  - [Adaptadores (implementaciones de infraestructura)](#adaptadores-implementaciones-de-infraestructura)
- [Principios SOLID y DRY](#principios-solid-y-dry)
  - [Principio de responsabilidad única (SRP)](#principio-de-responsabilidad-única-srp)
  - [Principio abierto/cerrado (OCP)](#principio-abiertocerrado-ocp)
  - [Principio de sustitución de Liskov (LSP)](#principio-de-sustitución-de-liskov-lsp)
  - [Principio de segregación de interfaces (ISP)](#principio-de-segregación-de-interfaces-isp)
  - [Principio de inversión de dependencias (DIP)](#principio-de-inversión-de-dependencias-dip)
  - [DRY (Don't Repeat Yourself)](#dry-dont-repeat-yourself)
- [Estándares de codificación](#estándares-de-codificación)
  - [Convenciones de idioma y nomenclatura](#convenciones-de-idioma-y-nomenclatura)
  - [Uso de TypeScript](#uso-de-typescript)
  - [Manejo de errores](#manejo-de-errores)
  - [Patrones de validación](#patrones-de-validación)
  - [Estándares de logging](#estándares-de-logging)
- [Estándares de diseño de API](#estándares-de-diseño-de-api)
  - [Endpoints REST](#endpoints-rest)
  - [Patrones de petición/respuesta](#patrones-de-peticiónrespuesta)
  - [Formato de respuestas de error](#formato-de-respuestas-de-error)
  - [Configuración CORS](#configuración-cors)
- [Patrones de base de datos](#patrones-de-base-de-datos)
  - [Esquema Prisma](#esquema-prisma)
  - [Migraciones](#migraciones)
  - [Patrón repositorio](#patrón-repositorio)
- [Estándares de pruebas](#estándares-de-pruebas)
  - [Pruebas unitarias](#pruebas-unitarias)
  - [Pruebas de integración](#pruebas-de-integración)
  - [Cobertura de pruebas](#cobertura-de-pruebas)
  - [Estándares de mocking](#estándares-de-mocking)
- [Buenas prácticas de rendimiento](#buenas-prácticas-de-rendimiento)
  - [Optimización de consultas](#optimización-de-consultas)
  - [Patrones async/await](#patrones-asyncawait)
- [Buenas prácticas de seguridad](#buenas-prácticas-de-seguridad)
  - [Validación de entradas](#validación-de-entradas)
  - [Variables de entorno](#variables-de-entorno)
  - [Inyección de dependencias](#inyección-de-dependencias)
- [Flujo de desarrollo](#flujo-de-desarrollo)
  - [Flujo Git](#flujo-git)
  - [Scripts de desarrollo](#scripts-de-desarrollo)
  - [Calidad de código](#calidad-de-código)

---

## Resumen

Este documento define las buenas prácticas, convenciones y estándares del backend de ConRutina. El backend sigue **Clean Architecture** y una organización por capas para garantizar consistencia, mantenibilidad y escalabilidad. Está redactado para que agentes de IA y desarrolladores puedan implementar funcionalidades sin ambigüedad.

## Stack tecnológico

### Tecnologías principales

- **Node.js**: Entorno de ejecución (v16 o superior)
- **TypeScript**: Desarrollo con tipos y módulos ESM
- **Express.js**: Framework web (^4.19.2)
- **Prisma**: ORM moderno para acceso a datos (^5.13.0)

### Base de datos y ORM

- **PostgreSQL**: Base de datos relacional versión 16 (contenedor Docker)
- **Prisma Client**: Cliente tipado (^5.13.0)
- **Prisma Migrate**: Herramienta de migraciones

### Framework de pruebas

- **Vitest**: Framework de pruebas previsto, con soporte TypeScript y API compatible con Jest (`vi` en lugar de `jest`)
- **Ubicación de pruebas**: directorios `__tests__` y archivos `*.test.ts` junto al código bajo `backend/src/`

### Herramientas de desarrollo

- **tsx**: Ejecución de TypeScript en desarrollo (^4.x), p. ej. `npm run dev:api`
- **ESLint**: Linting (previsto en el monorepo)
- **Compilador TypeScript**: Comprobación de tipos y compilación
- **dotenv**: Gestión de variables de entorno (^16.4.5)
- **cors**: Middleware CORS (^2.8.6)

## Visión de arquitectura

### Clean Architecture

ConRutina aplica Clean Architecture: separación de responsabilidades e inversión de dependencias. Las dependencias apuntan hacia el interior; la lógica de negocio no depende de frameworks ni de detalles externos.

**Beneficios:**

- **Testabilidad**: La lógica de negocio se prueba de forma aislada
- **Independencia**: El núcleo no depende de Express, Prisma ni PostgreSQL en el dominio
- **Flexibilidad**: Cambiar implementaciones (p. ej. otro ORM) sin tocar casos de uso
- **Mantenibilidad**: Límites claros entre capas

### Arquitectura por capas

**Capa de presentación** (`backend/src/presentation/`)

- HTTP: peticiones y respuestas
- `createApp()` configura Express y las rutas
- Los controladores (o handlers en rutas) delegan en la capa de aplicación

**Capa de aplicación** (`backend/src/application/`)

- Casos de uso con reglas de negocio de aplicación
- **Puertos** (`application/ports/`): contratos para dependencias externas
- Orquesta entidades de dominio y adaptadores de infraestructura

**Capa de dominio** (`backend/src/domain/`)

- Entidades y objetos de valor
- Lógica de negocio pura, sin dependencias de framework
- Modelos como `UserProfile`, y en evolución `Habit`, `Reward`, etc.

**Capa de infraestructura** (`backend/src/infrastructure/`)

- Implementa los puertos de aplicación
- Acceso a datos con Prisma (p. ej. `createPrismaUserRepository`)
- Integraciones externas y detalles técnicos (logging, configuración)

### Estructura del proyecto

```
backend/
├── src/
│   ├── domain/
│   │   ├── errors/                 # Clases de error (AppError, ValidationError, …)
│   │   ├── userProfile.ts          # Entidades de dominio
│   │   └── habit.ts                # Entidad Habit + tipos CreateHabitData / UpdateHabitData
│   ├── application/
│   │   ├── ports/                  # Interfaces puerto
│   │   │   ├── UserReadRepository.ts
│   │   │   └── HabitRepository.ts
│   │   ├── validation/
│   │   │   └── habit.ts            # Schema Zod + parseCreateHabitInput
│   │   ├── getUserProfile.ts       # Casos de uso
│   │   ├── createHabit.ts
│   │   └── getActiveHabits.ts
│   ├── presentation/
│   │   └── http/
│   │       ├── createApp.ts        # Configuración HTTP
│   │       └── middleware/         # errorHandler, asyncHandler (T-04-02)
│   ├── infrastructure/
│   │   ├── prismaUserRepository.ts # Implementaciones de repositorio
│   │   └── prismaHabitRepository.ts
│   ├── loadEnv.ts                  # Carga de entorno
│   └── main.ts                     # Punto de entrada (composición)
├── prisma/
│   └── schema.prisma               # Esquema de base de datos
├── tsconfig.json
└── (dependencias en package.json raíz del monorepo)
```

La **raíz de composición** es `main.ts`: instancia `PrismaClient` y llama a `createApp(prisma)`. Los repositorios se crean dentro de `createApp`.

## Principios de Clean Architecture

### Entidades y objetos de valor

Las entidades tienen identidad propia; los objetos de valor se definen por sus atributos.

**Ejemplo en ConRutina:**

```typescript
// Entidad de dominio
export interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface Habit {
  id: number;
  userId: number;
  emoji: string;
  name: string;
  pointsPerDay: number;
  penalty: number;
  isActive: boolean;
  createdAt: Date;
}
```

**Buena práctica**: Mantener el dominio puro y libre de frameworks; solo lógica de negocio.

### Casos de uso (servicios de aplicación)

Los casos de uso orquestan el flujo entre entidades e infraestructura.

**Ejemplo en ConRutina:**

```typescript
// Caso de uso en application/
export async function getUserProfileById(
  repository: UserReadRepository,
  userId: number
): Promise<UserProfile> {
  const profile = await repository.findById(userId);
  if (!profile) {
    throw new NotFoundError('Usuario no encontrado');
  }
  return profile;
}

export async function createHabit(
  repository: HabitRepository,
  userId: number,
  input: unknown
): Promise<Habit> {
  const validated = parseCreateHabitInput(input);
  return repository.create({ userId, ...validated });
}

export async function getActiveHabits(
  repository: HabitRepository,
  userId: number
): Promise<Habit[]> {
  return repository.findActiveByUserId(userId);
}
```

**Buena práctica:**

- Un caso de uso por operación de negocio
- Casos de uso simples y enfocados
- Delegar en el dominio cuando corresponda

### Interfaces puerto (inversión de dependencias)

Los puertos definen contratos; el núcleo no conoce Prisma ni Express.

**Ejemplo en ConRutina:**

```typescript
// Puerto en application/ports/
export interface UserReadRepository {
  findById(id: number): Promise<UserProfile | null>;
}
```

**Buena práctica:**

- Definir puertos en `application/ports/`
- Implementar en `infrastructure/`
- Facilita mocks en Vitest y sustitución de adaptadores

### Adaptadores (implementaciones de infraestructura)

Los adaptadores implementan puertos y encapsulan detalles técnicos.

**Ejemplo en ConRutina:**

```typescript
// Adaptador en infrastructure/
export function createPrismaUserRepository(prisma: PrismaClient): UserReadRepository {
  return {
    async findById(id: number): Promise<UserProfile | null> {
      const user = await prisma.user.findUnique({ where: { id } });
      return user
        ? { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
        : null;
    },
  };
}
```

**Buena práctica:**

- Traducir entre persistencia y dominio
- Aislar Prisma en infraestructura
- Devolver tipos de dominio, no modelos Prisma crudos en capas superiores

## Principios SOLID y DRY

### Principios SOLID

#### Principio de responsabilidad única (SRP)

Cada módulo debe tener una única razón de cambio.

**Ejemplo en ConRutina:**

```typescript
// Dominio: solo tipos y reglas de dominio
export interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

// Aplicación: orquestación
export async function getUserProfileById(
  repository: UserReadRepository,
  userId: number
): Promise<UserProfile> {
  const profile = await repository.findById(userId);
  if (!profile) {
    throw new NotFoundError('Usuario no encontrado');
  }
  return profile;
}

// Infraestructura: acceso a datos
export function createPrismaUserRepository(prisma: PrismaClient): UserReadRepository {
  return {
    async findById(id: number): Promise<UserProfile | null> {
      const user = await prisma.user.findUnique({ where: { id } });
      return user
        ? { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
        : null;
    },
  };
}
```

**Recomendación**: Separar dominio, aplicación, presentación e infraestructura.

#### Principio abierto/cerrado (OCP)

Abierto a extensión, cerrado a modificación de contratos estables.

**Ejemplo en ConRutina:**

```typescript
export interface UserReadRepository {
  findById(id: number): Promise<UserProfile | null>;
}

export function createPrismaUserRepository(prisma: PrismaClient): UserReadRepository {
  return { /* implementación Prisma */ };
}

export function createInMemoryUserRepository(seed: UserProfile[]): UserReadRepository {
  return { /* implementación en memoria para tests */ };
}
```

**Recomendación**: Interfaces y composición en `main.ts` para extender sin alterar casos de uso.

#### Principio de sustitución de Liskov (LSP)

Cualquier implementación de un puerto debe cumplir el mismo contrato.

**Ejemplo en ConRutina:**

```typescript
function loadProfile(repository: UserReadRepository, id: number) {
  return repository.findById(id);
}

const prismaRepo = createPrismaUserRepository(prisma);
const memoryRepo = createInMemoryUserRepository([{ id: 1, name: 'Ana', email: 'a@example.com' }]);

loadProfile(prismaRepo, 1);
loadProfile(memoryRepo, 1);
```

**Recomendación**: Misma semántica en todas las implementaciones del puerto.

#### Principio de segregación de interfaces (ISP)

Interfaces pequeñas y específicas mejor que una interfaz monolítica.

**Ejemplo en ConRutina:**

```typescript
export interface UserReadRepository {
  findById(id: number): Promise<UserProfile | null>;
}

export interface UserWriteRepository {
  create(input: CreateUserInput): Promise<UserProfile>;
  update(id: number, input: UpdateUserInput): Promise<UserProfile>;
}

async function getProfile(repo: UserReadRepository, id: number) {
  return repo.findById(id);
}
```

**Recomendación**: Separar lectura y escritura cuando evolucione el modelo.

#### Principio de inversión de dependencias (DIP)

Los módulos de alto nivel dependen de abstracciones, no de Prisma ni Express directamente.

**Ejemplo en ConRutina:**

```typescript
export async function getUserProfileById(
  repository: UserReadRepository,
  userId: number
): Promise<UserProfile> {
  const profile = await repository.findById(userId);
  if (!profile) {
    throw new NotFoundError('Usuario no encontrado');
  }
  return profile;
}

// main.ts — composición
const prisma = new PrismaClient();
const app = createApp(prisma);
```

**Recomendación**: Pasar `PrismaClient` a `createApp` desde `main.ts`; instanciar adaptadores de infraestructura dentro de la capa de presentación o en un módulo de composición dedicado.

### DRY (Don't Repeat Yourself)

Cada pieza de conocimiento debe tener una representación autoritativa.

**Ejemplo en ConRutina:**

```typescript
export function createPrismaUserRepository(prisma: PrismaClient): UserReadRepository {
  return {
    async findById(id: number): Promise<UserProfile | null> {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? mapToUserProfile(user) : null;
    },
  };
}

function mapToUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}
```

**Recomendación**: Centralizar mapeos Prisma → dominio y validaciones reutilizables.

## Estándares de codificación

### Convenciones de idioma y nomenclatura

| Ámbito | Idioma / convención |
|--------|---------------------|
| Código (variables, funciones, clases, interfaces, tipos, archivos) | **Inglés** |
| Comentarios en código | **Inglés** (opcional; preferir código autodocumentado) |
| Respuestas JSON de error visibles al usuario/cliente | **Español** |
| Logs operativos en consola para operadores | **Español** o inglés técnico; mensajes de negocio al usuario en español |
| Mensajes de commit | **Viñetas breves** en español; **un commit único al archivar** (no durante apply); ver [openspec/tasks-core.md](./openspec/tasks-core.md) |
| Este documento y specs en `docs/` | **Español** |

**Nomenclatura:**

- **Variables y funciones**: camelCase (`userId`, `getUserProfileById`)
- **Clases e interfaces**: PascalCase (`UserProfile`, `UserReadRepository`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_API_PORT`)
- **Archivos**: camelCase (`getUserProfile.ts`, `prismaUserRepository.ts`)

**Ejemplos correctos:**

```typescript
export function createPrismaUserRepository(prisma: PrismaClient): UserReadRepository {
  return {
    async findById(userId: number): Promise<UserProfile | null> {
      const row = await prisma.user.findUnique({ where: { id: userId } });
      return row ? mapToUserProfile(row) : null;
    },
  };
}
```

**Evitar** identificadores o nombres de archivo en español:

```typescript
// Evitar
export function crearRepositorioUsuario() { /* ... */ }
```

**Mensajes de error y logs (API / usuario):**

```typescript
// Correcto: código en inglés, mensaje al cliente en español
if (!user) {
  return res.status(404).json({ error: `Usuario con id ${userId} no encontrado` });
}

// Correcto: log técnico; detalle para operador
console.error('[api/profile]', err);
return res.status(500).json({ error: 'Error al leer el usuario' });

// Evitar: mensaje al usuario en inglés si el producto es en español
return res.status(404).json({ error: 'User not found' });
```

### Uso de TypeScript

- **Modo estricto**: Activar `strict` en `tsconfig.json`
- **Tipos explícitos**: Parámetros y retornos en funciones públicas y casos de uso
- **Interfaces**: Para estructuras de datos y puertos
- **Evitar `any`**: Preferir `unknown` y narrowing

```typescript
async function findUserById(
  repository: UserReadRepository,
  id: number
): Promise<UserProfile | null> {
  return repository.findById(id);
}
```

### Manejo de errores

- **Clases de dominio** (`backend/src/domain/errors/`): jerarquía tipada sin dependencias de Express
  - `AppError` (base): `code` (inglés), `message` (español), `details?` opcional
  - `ValidationError` → HTTP 400, code `VALIDATION_ERROR`
  - `NotFoundError` → HTTP 404, code por defecto `USER_NOT_FOUND`
  - `ConflictError` → HTTP 409, code por defecto `CONFLICT`
  - `UnprocessableError` → HTTP 422, code según instancia (p. ej. `INSUFFICIENT_POINTS`)
- **Middleware global** (`presentation/http/middleware/errorHandler.ts`): registrado como **último** middleware en `createApp`
- **asyncHandler**: wrapper para rutas `async` en Express 4; captura rechazos de promesa y los pasa a `next(err)`
- **Errores no tipados**: HTTP 500 con `{ code: "INTERNAL_ERROR", message: "Error interno del servidor" }`; sin detalles de Prisma/SQL al cliente en producción
- **Stack trace**: campo `stack` en JSON solo cuando `NODE_ENV !== 'production'`
- **Propagación**: los casos de uso lanzan errores tipados; los handlers usan `asyncHandler` y `next(err)` para errores inesperados

```typescript
// domain/errors/appErrors.ts
export class ValidationError extends AppError {
  constructor(message: string, details?: Array<{ field: string; message: string }>) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

// presentation/http/middleware/asyncHandler.ts
app.get('/api/profile', asyncHandler(async (_req, res) => {
  const user = await getUserProfileById(deps.userRepository, 1);
  return res.json(user);
}));

// createApp.ts — errorHandler al final
app.use(errorHandler);
```

**Formato estándar de error (handler global):**

```typescript
{
  "code": "VALIDATION_ERROR",
  "message": "Datos inválidos",
  "details": [{ "field": "name", "message": "El nombre es obligatorio" }],
  "stack": "..." // solo fuera de production
}
```

### Patrones de validación

- Validar entradas HTTP con middleware `validateBody(schema)` **antes** de `asyncHandler` y del caso de uso
- Centralizar schemas Zod reutilizables en `application/validation/` (p. ej. `habit.ts`, `reward.ts`)
- Los casos de uso pueden mantener parsers defensivos con los mismos schemas; la validación primaria ocurre en middleware
- Validar antes de ejecutar lógica de negocio o persistencia

```typescript
import { createHabit } from '../application/createHabit';
import { createHabitSchema } from '../application/validation/habit';
import { asyncHandler } from './middleware/asyncHandler';
import { validateBody } from './middleware/validateBody';

app.post(
  '/api/habits',
  validateBody(createHabitSchema),
  asyncHandler(async (req, res) => {
    const habit = await createHabit(deps.habitRepository, 1, req.body);
    return res.status(201).json(habit);
  })
);
```

**Orden de middlewares:** `validateBody(schema)` → `asyncHandler(handler)` → `errorHandler` (global).

**Recompensas (T-11-02):** al registrar `POST /api/rewards`, usar `validateBody(createRewardSchema)` con el schema de `application/validation/reward.ts`.

Validación Zod centralizada en `application/validation/habit.ts`:

```typescript
import { z } from 'zod';
import { ValidationError } from '../../domain/errors/appErrors';

const createHabitSchema = z.object({
  emoji: z.string().trim().min(1, 'El emoji es obligatorio'),
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  pointsPerDay: z.number().int().positive('Los puntos por día deben ser mayores que 0'),
  penalty: z.number().int().min(0, 'La penalización no puede ser negativa'),
});

export function parseCreateHabitInput(input: unknown) {
  const result = createHabitSchema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'input',
      message: issue.message,
    }));
    throw new ValidationError('Datos inválidos', details);
  }
  return result.data;
}
```

### Estándares de logging

- Usar un logger centralizado en `infrastructure/` cuando se introduzca
- Niveles: `info`, `warn`, `error`, `debug`
- Incluir contexto estructurado (`userId`, `route`, `correlationId`)
- No exponer stack traces ni detalles internos en respuestas JSON al cliente

```typescript
logger.info('Perfil obtenido', { userId: user.id });
logger.error('Error al persistir hábito', { habitId, error: (err as Error).message });
```

## Estándares de diseño de API

### Endpoints REST

- Nombres RESTful y sustantivos en rutas
- Métodos HTTP adecuados (GET, POST, PUT, PATCH, DELETE)
- URLs como recursos, no como acciones
- Versionado opcional: `/api/v1/...` cuando el API crezca

**Endpoint actual en ConRutina:**

```typescript
GET    /api/profile         // Perfil de usuario (id fijo 1 en la implementación actual)
```

**Patrón previsto para evolución:**

```typescript
GET    /api/habits
POST   /api/habits
PATCH  /api/habits/:id
DELETE /api/habits/:id
GET    /api/rewards
POST   /api/rewards
DELETE /api/rewards/:id
POST   /api/rewards/:id/redeem
```

### Patrones de petición/respuesta

- Cuerpos JSON en petición y respuesta
- Estructura coherente entre endpoints
- Códigos HTTP semánticos (200, 201, 400, 404, 409, 422, 500)

**Ejemplo en ConRutina (éxito):**

```typescript
// Éxito (200)
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "avatarUrl": null
}
```

**Formato de error estándar** (middleware `errorHandler`; `code` en inglés, `message` en español):

```typescript
{
  "code": "USER_NOT_FOUND",
  "message": "Usuario no encontrado",
  "details": { "userId": 1 }  // opcional
}
```

Los errores de `/api/profile` (p. ej. usuario inexistente) se propagan vía `asyncHandler` al `errorHandler` global con el formato anterior.

### Configuración CORS

- Habilitar CORS para el origen del frontend
- En producción, restringir orígenes explícitos
- Configurar `credentials` según necesidad de cookies

**Configuración actual en ConRutina:**

```typescript
app.use(
  cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: false,
  }),
);
```

**Recomendación**: Origen configurable vía variable de entorno (`CORS_ORIGIN`) leída en `createApp` con default `http://localhost:5173`.

## Patrones de base de datos

### Esquema Prisma

- **Fuente única de verdad**: `backend/prisma/schema.prisma`
- Relaciones con `@relation` de Prisma
- Modelos en PascalCase; campos en camelCase alineados con el dominio

### Migraciones

- Todo cambio de esquema versionado con migraciones
- Nombres descriptivos en inglés para las migraciones
- Revisar SQL generado antes de aplicar en entornos compartidos

```bash
# Crear migración (desarrollo)
npx prisma migrate dev --name add_habit_table

# Aplicar en producción / CI
npm run db:migrate
```

### Patrón repositorio

- **Interfaces (puertos)** en `application/ports/`
- **Implementaciones** en `infrastructure/` con factories (`createPrismaUserRepository`)
- **Inyección** del `PrismaClient` solo en composición (`main.ts`)

```typescript
// application/ports/UserReadRepository.ts
export interface UserReadRepository {
  findById(id: number): Promise<UserProfile | null>;
}

// application/ports/HabitRepository.ts
export interface HabitRepository {
  create(data: CreateHabitData): Promise<Habit>;
  findActiveByUserId(userId: number): Promise<Habit[]>;
  findById(id: number): Promise<Habit | null>;
  update(id: number, data: UpdateHabitData): Promise<Habit>;
  softDelete(id: number): Promise<Habit>;
}

// infrastructure/prismaUserRepository.ts
export function createPrismaUserRepository(prisma: PrismaClient): UserReadRepository {
  return {
    async findById(id: number): Promise<UserProfile | null> {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? mapToUserProfile(user) : null;
    },
  };
}

// infrastructure/prismaHabitRepository.ts
export function createPrismaHabitRepository(prisma: PrismaClient): HabitRepository {
  return {
    async findActiveByUserId(userId: number): Promise<Habit[]> {
      const habits = await prisma.habit.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      return habits.map(mapToHabit);
    },
    // create, findById, update, softDelete …
  };
}
```

### Semanas (T-09-01)

- **Dominio:** `backend/src/domain/week.ts` — tipos `Week`, `WeekHabit`, `HabitEntry` y utilidad `getWeekBoundaries(date)` (lunes–domingo en UTC).
- **Puertos:** `WeekRepository` (`findCurrentWeek`, `createWeekWithHabitsAndEntries`) y `WeekHabitRepository` (`createWeekHabits`).
- **Infraestructura:** `prismaWeekRepository.ts` y `prismaWeekHabitRepository.ts`; la creación de semana usa `prisma.$transaction` para Week + WeekHabits + 7×HabitEntry `pending`.
- **Caso de uso:** `getCurrentWeek(weekRepo, habitRepo, userId, now?)` — idempotente para la semana en curso.

```typescript
// application/getCurrentWeek.ts
export async function getCurrentWeek(
  weekRepo: WeekRepository,
  habitRepo: HabitRepository,
  userId: number,
  now: Date = new Date(),
): Promise<WeekWithDetails> {
  const { startDate, endDate } = getWeekBoundaries(now);
  const existing = await weekRepo.findCurrentWeek(userId, startDate);
  if (existing !== null) return existing;
  const activeHabits = await habitRepo.findActiveByUserId(userId);
  return weekRepo.createWeekWithHabitsAndEntries(userId, startDate, endDate, activeHabits);
}

// application/ports/WeekRepository.ts
export interface WeekRepository {
  findCurrentWeek(userId: number, startDate: Date): Promise<WeekWithDetails | null>;
  createWeekWithHabitsAndEntries(
    userId: number,
    startDate: Date,
    endDate: Date,
    activeHabits: Habit[],
  ): Promise<WeekWithDetails>;
}
```

## Estándares de pruebas

El proyecto usa **Vitest** (`npm run test`, `npm run test:watch`). Las pruebas deben respetar Clean Architecture: unitarias sin base de datos real; integración con contenedor o base de datos de test cuando se definan.

### Pruebas unitarias

#### Estructura de archivos

- Nombre: `[componente].test.ts` o `[componente].spec.ts`
- Colocación: junto al módulo bajo prueba o en `__tests__/`
- Framework: **Vitest** (no Jest)

#### Organización (plantilla)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('getUserProfileById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('should_return_profile_when_user_exists', () => {
    it('returns UserProfile when repository finds user', async () => {
      // Arrange
      const mockRepo: UserReadRepository = {
        findById: vi.fn().mockResolvedValue({
          id: 1,
          name: 'Ana',
          email: 'a@test.com',
          avatarUrl: null,
        }),
      };

      // Act
      const result = await getUserProfileById(mockRepo, 1);

      // Assert
      expect(result).toEqual({
        id: 1,
        name: 'Ana',
        email: 'a@test.com',
        avatarUrl: null,
      });
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
    });
  });
});
```

#### Convención de nombres

- Bloques `describe`: comportamiento esperado, p. ej. `should_return_404_when_user_missing`
- Casos `it`: frase clara en inglés (convención de código de test)
- Patrón **AAA**: Arrange, Act, Assert

#### Mocking con Vitest

- `vi.mock()` para módulos
- `vi.fn()` para dependencias inyectadas
- Mockear puertos, no Prisma real en unitarias
- `beforeEach(() => vi.clearAllMocks())` para aislamiento

```typescript
vi.mock('../../infrastructure/prismaUserRepository', () => ({
  createPrismaUserRepository: vi.fn(),
}));
```

### Pruebas de integración

- Probar `createApp` con supertest o fetch contra app Express en memoria
- Repositorio contra PostgreSQL de test o contenedor efímero (cuando se configure)
- Flujos completos: HTTP → caso de uso → adaptador

### Cobertura de pruebas

Priorizar calidad sobre un umbral fijo. Cuando Vitest reporte cobertura, documentar hitos en `docs/` si el equipo lo exige.

**Categorías por función o caso de uso:**

1. **Happy path**: entradas válidas, salida esperada
2. **Errores**: entradas inválidas, recurso no encontrado, fallos de persistencia
3. **Bordes**: null, límites numéricos, listas vacías
4. **Validación**: reglas de negocio y restricciones de dominio
5. **Integración**: mapeo HTTP ↔ aplicación ↔ puerto

Comando previsto:

```bash
npm run test
npm run test:watch
```

### Estándares de mocking

- Mockear `UserReadRepository` y futuros puertos en pruebas de casos de uso
- Mockear casos de uso o repositorios en pruebas de handlers HTTP
- No usar conexiones reales a PostgreSQL en pruebas **unitarias**

### Pruebas de errores

- Comprobar códigos HTTP y cuerpo `{ error: '...' }` en español
- Verificar propagación desde repositorio hasta respuesta JSON

### Pruebas de capa HTTP

- Mock del repositorio o caso de uso inyectado en `createApp`
- Validar parsing de parámetros y serialización JSON
- 404 con mensaje `Usuario con id X no encontrado` cuando aplique

### Pruebas de casos de uso

- Repositorio en memoria o `vi.fn()`
- Sin Express ni Prisma en la misma prueba unitaria del caso de uso

### Pruebas async

- `async/await` en todos los tests asíncronos
- `await expect(promise).rejects.toThrow(...)` para errores esperados

### Anti-patrones

- No probar detalles internos de Prisma en tests de dominio
- No depender del orden de ejecución entre archivos
- No omitir escenarios de error
- No acoplar tests a mensajes en inglés si la API expone español

### Calidad en tests

- Tipado estricto en datos de prueba
- Nombres de test que documenten el escenario
- Tests tan legibles como el código de producción

### Integración con el flujo de trabajo

- Ejecutar `npm run test` antes de merge a `develop` cuando existan pruebas para el ámbito tocado
- TDD cuando la tarea o OpenSpec lo indiquen
- Actualizar tests al cambiar contratos de puertos o respuestas HTTP

## Buenas prácticas de rendimiento

### Optimización de consultas

- `select` para campos necesarios
- Índices en columnas de filtro frecuente
- Evitar N+1 con `include` / `select` planificados

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: { id: true, name: true, email: true },
});
```

### Patrones async/await

- Preferir `async/await` frente a cadenas `.then()`
- `Promise.all()` para operaciones independientes

```typescript
const [user, habits] = await Promise.all([
  prisma.user.findUnique({ where: { id: 1 } }),
  prisma.habit.findMany({ where: { userId: 1 } }),
]);
```

## Buenas prácticas de seguridad

### Validación de entradas

- Validar y tipar todo input de usuario
- No confiar en datos del cliente para autorización (cuando exista auth, validar en servidor)

### Variables de entorno

- No commitear `.env` ni secretos
- Plantilla en `.env.example` en la raíz del monorepo
- Cargar fichero con `backend/src/loadEnv.ts` (dotenv desde la raíz)
- Validar y tipar con `backend/src/config.ts` (Zod) inmediatamente después de `loadEnv` en `main.ts`
- Fallar al arranque si faltan variables críticas (`DATABASE_URL`) con mensaje accionable

**Patrón en ConRutina:**

```typescript
// main.ts — orden de bootstrap
import './loadEnv.js' // 1. Cargar .env desde disco
import { config } from './config.js' // 2. Validar env (process.exit si inválido)
// 3. Prisma, createApp, listen…
```

`config.ts` valida `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN` y `NODE_ENV`. Si `DATABASE_URL` falta o está vacía:

```text
Variable obligatoria DATABASE_URL no definida. Ver .env.example
```

El objeto exportado `config` expone valores tipados:

| Propiedad     | Origen env   | Default                    |
|---------------|--------------|----------------------------|
| `databaseUrl` | DATABASE_URL | _(obligatoria)_            |
| `apiPort`     | API_PORT     | `3001`                     |
| `corsOrigin`  | CORS_ORIGIN  | `http://localhost:5173`    |
| `nodeEnv`     | NODE_ENV     | `development`              |

`NODE_ENV` solo acepta `development`, `production` o `test`.

### Inyección de dependencias

- Componer dependencias solo en `main.ts`
- Pasar interfaces a `createApp` y casos de uso, no instancias concretas de Prisma en aplicación o dominio

## Flujo de desarrollo

### Flujo Git

- **Rama principal**: `develop`
- **Ramas de feature**: `feature/[ticket-id]-[ticket-name]` desde `develop`; comprobar que no existan antes de crearlas
- **Commits**: Un commit único con mensaje en viñetas breves en español **solo al archivar** el change (cuando el usuario acepta); no commitear durante `/opsx:apply`
- Revisiones de código antes de merge
- **Cierre**: Push de la rama de feature al remoto y merge en `develop` tras pasar las pruebas obligatorias (p. ej. al archivar un change OpenSpec)
- Cambios pequeños y acotados

Ver [openspec/tasks-core.md](./openspec/tasks-core.md).

### Scripts de desarrollo

```bash
npm install                # Instalar dependencias
npm run dev:api           # API con recarga (tsx watch)
npm run build             # Build frontend (monorepo)
npm run test              # Vitest (una pasada)
npm run test:watch        # Vitest en modo watch
npm run prisma:generate   # Generar cliente Prisma
npm run prisma:init       # Inicializar Prisma (una vez)
npm run db:migrate        # Aplicar migraciones (prisma migrate deploy)
npm run docker:up         # Levantar PostgreSQL
npm run docker:down       # Parar contenedores
npm run docker:logs       # Logs de PostgreSQL
```

### Calidad de código

- **ESLint**: `npm run lint` cuando aplique al backend
- **TypeScript**: compilación sin errores
- **Vitest**: tests del ámbito modificado en verde antes de merge
- Revisión humana o de agente según estándares del repositorio

---

Este documento es la referencia para mantener calidad y consistencia en el backend de ConRutina. Los agentes de IA deben aplicarlo al crear puertos, casos de uso, adaptadores Prisma, rutas Express y pruebas Vitest, respetando código en inglés y mensajes de error visibles al usuario en español.
