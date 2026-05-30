# Guía de desarrollo — ConRutina

Guía paso a paso para configurar el entorno de desarrollo y ejecutar la aplicación de seguimiento de hábitos ConRutina.

## Instalación y puesta en marcha

### Requisitos previos

- **Node.js** (v16 o superior recomendado)
- **npm** (v8 o superior) o **pnpm**
- **Docker** y **Docker Compose**
- **Git**

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd ConRutina
```

### 2. Configuración del entorno

La fuente canónica de variables es **`.env.example`** en la raíz del monorepo. Copia la plantilla a `.env` antes de levantar Docker o el API:

```bash
cp .env.example .env
```

En Windows:

```bash
copy .env.example .env
```

Revisa y, si hace falta, ajusta los valores en `.env`. La plantilla incluye las ocho variables del proyecto con comentarios de una línea; por ejemplo:

```env
DATABASE_URL=postgresql://conrutina:conrutina_dev_pass@localhost:5432/conrutina
API_PORT=3001
CORS_ORIGIN=http://localhost:5173
POSTGRES_USER=conrutina
POSTGRES_PASSWORD=conrutina_dev_pass
POSTGRES_DB=conrutina
POSTGRES_PORT=5432
NODE_ENV=development
```

**Notas importantes:**
- `DATABASE_URL` debe coincidir con las credenciales `POSTGRES_*` y con el default `conrutina` de `docker-compose.yml`
- `API_PORT` por defecto es **3001** si no se define
- Vite sirve el frontend en **5173** por defecto
- No subas `.env` al repositorio (ya está en `.gitignore`); `.env.example` sí está versionado

### 3. Instalar dependencias

```bash
npm install
```

El proyecto usa un monorepo mínimo: el `package.json` raíz gestiona frontend y backend.

### 4. Base de datos (PostgreSQL con Docker)

```bash
# Levantar PostgreSQL
npm run docker:up

# Comprobar que está en marcha
docker ps

# Ver logs
npm run docker:logs
```

PostgreSQL quedará disponible en:
- **Host:** `localhost`
- **Puerto:** `5432` (o el valor de `POSTGRES_PORT` en `.env`)
- **Base de datos:** `conrutina` (default en `docker-compose.yml`)
- **Usuario y contraseña:** según `POSTGRES_USER` y `POSTGRES_PASSWORD` en `.env` (ver `.env.example`)
- **Volumen:** `conrutina_postgres_data`

### 5. Migraciones de base de datos

```bash
# Generar cliente Prisma (tras cambios en el esquema)
npm run prisma:generate

# Aplicar migraciones
npm run db:migrate

# (Opcional) Reset y seed
npx prisma migrate reset
npx prisma db seed  # si existe script de seed
```

**Esquema Prisma:** `backend/prisma/schema.prisma`

El bloque `prisma.schema` en `package.json` permite usar la CLI sin `--schema`.

### 6. Datos iniciales

Crea un usuario con `id = 1` para el endpoint de perfil (Prisma Studio o SQL):

```bash
npx prisma studio
```

Registro de ejemplo:
- id: 1
- email: "usuario@ejemplo.com"
- name: "María García"

O con SQL:

```sql
INSERT INTO "User" (id, email, name) VALUES (1, 'usuario@ejemplo.com', 'María García');
```

### 7. Arrancar servidores de desarrollo

Desde la **raíz**, un solo comando levanta frontend y API en paralelo:

```bash
npm run dev
```

Salida esperada en consola (prefijos `web` y `api` de `concurrently`):

```
[web]   VITE v6.x  ready in ... ms
[web]   ➜  Local:   http://localhost:5173/
[api]   [API] PostgreSQL → base de datos: conrutina
[api]   API escuchando en http://localhost:3001 (GET /api/profile)
```

**Atajos** (si solo necesitas un proceso):

```bash
npm run dev:web   # Solo Vite → http://localhost:5173
npm run dev:api   # Solo API → http://localhost:3001
```

### 8. Acceder a la aplicación

Abre en el navegador:

```
http://localhost:5173
```

Deberías ver:
- Tarjeta de perfil en la cabecera (datos del API)
- Calendario semanal de hábitos
- Sección de recompensas
- Panel de estadísticas

**Si el perfil no carga:**
1. Comprueba que el API está en el puerto 3001
2. PostgreSQL accesible
3. Existe `User` con `id = 1`

## Estructura del proyecto

```
ConRutina/
├── backend/                 # API Express + Prisma
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   ├── main.ts
│   │   └── loadEnv.ts
│   └── prisma/
│       └── schema.prisma
├── frontend/                # SPA React + Vite
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   ├── styles/
│   │   └── main.tsx
│   ├── index.html
│   └── tsconfig.json        # Extiende tsconfig raíz (JSX, DOM)
├── backend/
│   └── tsconfig.json        # Extiende tsconfig raíz (ES2022, Node/tsx)
├── docs/
├── docker-compose.yml
├── package.json
├── tsconfig.json            # Base compartida: strict, paths @/*, references
├── vite.config.ts           # Alias @ → frontend/src (alineado con paths TS)
└── .env
```

### Configuración TypeScript

El monorepo usa tres ficheros `tsconfig.json`:

| Fichero | Rol |
| ------- | --- |
| `tsconfig.json` (raíz) | Opciones compartidas: `strict`, `esModuleInterop`, `moduleResolution: bundler`, alias `@/*` → `frontend/src/*`, `references` a frontend y backend. Sin `include` de código. |
| `frontend/tsconfig.json` | Extiende la raíz; `jsx: react-jsx`, `include: src/**/*`. |
| `backend/tsconfig.json` | Extiende la raíz; `target: ES2022`, `module: ESNext`, `include: src/**/*`. |

Comprobación de tipos sin emitir JavaScript:

```bash
npm run typecheck
```

Equivalente manual: `tsc --noEmit -p frontend/tsconfig.json && tsc --noEmit -p backend/tsconfig.json`.

## Pruebas

### Backend (previsto)

```bash
npm test
npm run test:watch
npm run test:coverage
```

*(Vitest aún no configurado; ver [backend-standards.md](./backend-standards.md).)*

### Frontend (previsto)

```bash
npm test
```

E2E con Playwright MCP cuando aplique (ver [openspec-tasks-mandatory-steps.md](./openspec-tasks-mandatory-steps.md)).

## Comandos habituales

### Base de datos

```bash
npm run prisma:generate
npx prisma migrate dev --name add_habit_model
npm run db:migrate
npx prisma studio
npx prisma migrate reset   # ¡Borra datos!
```

### Docker

```bash
npm run docker:up
npm run docker:down
npm run docker:logs
docker-compose down -v     # Elimina contenedor y volumen
```

### Desarrollo

```bash
npm install
npm run dev                # Frontend + API en paralelo
npm run dev:web            # Solo frontend (Vite)
npm run dev:api            # Solo backend (Express)
npm run build              # Build producción → dist/
npm run preview
npm run typecheck          # tsc --noEmit (frontend + backend)
npm run lint               # ESLint sobre frontend/src y backend/src
npm run format             # Prettier (formateo in-place)
npm run format:check       # Prettier sin escribir (útil en CI)
```

## Solución de problemas

### Puerto en uso

**Error:** `EADDRINUSE` en 3001 o 5173

**Solución (Windows):**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F

netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

O ajusta `API_PORT` en `.env` y el `target` del proxy en `vite.config.ts`.

### Error de conexión a la base de datos

**Error:** `P1001: Can't reach database server`

1. `docker ps` — Docker en marcha
2. `npm run docker:up`
3. Revisa `DATABASE_URL` en `.env`
4. `docker logs conrutina-postgres`

### Perfil de usuario 404

1. `npm run dev:api` en ejecución
2. Usuario `id = 1` en la BD
3. Crear usuario (paso 6)
4. Consola del navegador y CORS

### Cliente Prisma no encontrado

```bash
npm run prisma:generate
# Si persiste:
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
```

### Hot reload no funciona

- Frontend: guarda el fichero y revisa la consola de Vite
- Backend: `tsx watch` debería recargar; busca errores de sintaxis
- Reinicia ambos servidores
- Recarga forzada del navegador (Ctrl+Shift+R)

## Flujo de trabajo

### Realizar cambios

1. Actualizar `develop`: `git checkout develop` y `git pull origin develop`
2. Crear rama de feature desde `develop`: `git checkout -b feature/[ticket-id]-[ticket-name]` (p. ej. `feature/T-13-01-habit-domain-types`) si esta no existe.
3. Implementar el cambio **solo** en esa rama (sin commits durante la implementación).
4. Respeta Clean Architecture (dominio → aplicación → infraestructura → presentación)
5. Verifica la app, TypeScript y endpoints con curl si tocas el API
6. Tras pasar pruebas obligatorias y **aceptación del usuario** (OpenSpec `/opsx:archive`): commit único con mensaje en **viñetas breves** en español, **push de la rama feature al remoto** (`git push -u origin feature/...`), merge en `develop` (`git checkout develop` → `git pull origin develop` → `git merge feature/...`)
7. Push de `develop` al remoto si el flujo del equipo lo requiere: `git push origin develop`

Detalle completo del flujo Git con OpenSpec: [openspec-tasks-mandatory-steps.md](./openspec-tasks-mandatory-steps.md).

### Flujo OpenSpec (desde el product backlog)

Procesar **un ticket a la vez**, en orden de sprint según [product-backlog.md](./product-backlog.md):

1. **Especificar:** `/opsx-propose-ticket T-XX-YY` — genera `proposal.md`, `specs/`, `design.md` y `tasks.md` en `openspec/changes/t-xx-yy-nombre/`. Configuración en `openspec/config.yaml`.
2. **Revisar** artefactos (alcance = DoD del ticket, Paso 0 con rama `feature/T-XX-YY-nombre`).
3. **Implementar:** `/opsx:apply t-xx-yy-nombre` — código en la rama de feature **sin commits**, pruebas obligatorias ejecutadas por el agente.
4. **Revisar** cambios en el working tree; el usuario acepta o pide ajustes.
5. **Archivar:** `/opsx:archive t-xx-yy-nombre` — commit único, push de la rama feature, merge a `develop`, mover change a `openspec/changes/archive/` e intentar marcar el ticket ✅ en `docs/product-backlog.md` (`npm run openspec:mark-ticket`; si falla, el change queda terminado igualmente).

Ejemplo para el primer ticket del Sprint 0:

```
/opsx-propose-ticket T-01-01
/opsx:apply t-01-01-init-monorepo
/opsx:archive t-01-01-init-monorepo
```

### Calidad de código (ESLint y Prettier)

Configuración centralizada en la raíz del monorepo:

| Fichero | Ámbito |
| ------- | ------ |
| `eslint.config.mjs` | Flat config ESLint 9: bloque TS recomendado, React en `frontend/src`, globals Node en `backend/src` |
| `.prettierrc` | `singleQuote: true`, `semi: false`, `tabWidth: 2`, `trailingComma: es5`, `printWidth: 100` |
| `.prettierignore` | `node_modules`, `dist`, `coverage`, `backend/prisma/migrations` |
| `.editorconfig` | UTF-8, LF, indentación 2 espacios en ficheros de código |

Comandos habituales:

```bash
npm run lint          # Analiza frontend/src y backend/src
npm run format        # Formatea con Prettier
npm run format:check  # Solo comprueba formato (CI)
```

ESLint no usa reglas type-aware (`parserOptions.project`); errores de tipos se detectan con `npm run typecheck`. ESLint sí detecta errores de sintaxis/parsing (US-01 Scenario 3).

### Convenciones de código

- **UI y textos visibles al usuario:** español
- **Código (identificadores, tipos):** inglés (convención del stack TypeScript)
- **TypeScript:** modo estricto, evitar `any`; ejecutar `npm run typecheck` antes de abrir PR
- **ESLint y Prettier:** configuración en la raíz del monorepo (`eslint.config.mjs`, `.prettierrc`, `.editorconfig`). Ejecutar `npm run lint` y, si aplica, `npm run format` antes de abrir PR.
- **Arquitectura:** Clean Architecture en frontend y backend
- **Documentación técnica:** español (esta carpeta `docs/`)

## Despliegue (futuro)

1. **Frontend:** `npm run build` → `dist/` en hosting estático
2. **Backend:** proceso Node aparte (PM2, contenedor, PaaS)
3. **BD:** PostgreSQL gestionado + `npm run db:migrate`
4. **Proxy:** unificar `/api` en producción o configurar URL base del API

---

*Documentación relacionada:*
- [Estándares backend](./backend-standards.md)
- [Estándares frontend](./frontend-standards.md)
- [Especificación API](./api-spec.yml)
- [Modelo de datos](./data-model.md)
- [Infraestructura](./infrastructure.md)
