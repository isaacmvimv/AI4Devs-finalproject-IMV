# ConRutina

Aplicación web para seguimiento de hábitos y recompensas: interfaz en **React** (SPA con **Vite**) y un **API HTTP** en **Node** (**Express** + **Prisma**) que puede leer el perfil de usuario desde **PostgreSQL**. El tablero de hábitos y recompensas se gestiona principalmente en el cliente; el backend expone hoy `**GET /api/profile`** para datos de perfil persistidos.

## Tabla de contenidos

- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Configuración](#configuración)
- [Scripts disponibles](#scripts-disponibles)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Instalación

### Requisitos previos

- **Node.js** (versión recomendada no está fijada en el repositorio; usa una LTS reciente compatible con Vite 6 y Prisma 5).
- **npm** (hay `package-lock.json` en la raíz) o **pnpm** (existe `pnpm-workspace.yaml`).
- **Docker** y **Docker Compose** (opcional pero recomendable para PostgreSQL local).

### Pasos

1. Clona el repositorio y sitúate en la raíz del proyecto.
2. Instala dependencias (**raíz**):

```bash
npm install
```

3. Crea un archivo `**.env**` en la raíz (no versionado) con las variables descritas en [Configuración](#configuración).
4. (Opcional) Levanta PostgreSQL con Docker (**raíz**):

```bash
npm run docker:up
```

o

```bash
docker-compose up -d
```

5. Genera el cliente de Prisma (sólo la primera vez) (**raíz**; el esquema está en `backend/prisma/schema.prisma` y se resuelve desde la raíz gracias a `package.json`):

```bash
npm run prisma:generate
```

o

```bash
npx prisma db push
```

Aplica el esquema a la base de datos según tu flujo habitual con Prisma (por ejemplo `npx prisma migrate dev` si trabajas con migraciones locales). En el repositorio **no hay carpeta de migraciones versionada** en el momento de redactar este README; si falta, créala con Prisma según tu entorno.


6. Parada de PostgreSQL con Docker (**raíz**):

```bash
docker-compose down
```

## Uso

### Desarrollo (frontend + API)

Un solo comando desde la **raíz** levanta la SPA (Vite, puerto **5173**) y el API Express (puerto **3001** o `API_PORT`) en paralelo:

```bash
npm run dev
```

Abre en el navegador `http://localhost:5173` (o la URL que indique la consola).

**Requisitos para el perfil de usuario y el API:**

1. PostgreSQL accesible y `DATABASE_URL` válida en `.env`.
2. Un registro `User` con `id = 1` en la base (es lo que usa el caso de uso actual del API).

Consulta [Instalación](#instalación) para Docker, Prisma y variables de entorno.

### Atajos de desarrollo parcial

Si solo necesitas uno de los procesos:

```bash
npm run dev:web   # Solo frontend (Vite)
npm run dev:api   # Solo backend (Express + recarga con tsx watch)
```

El API escucha por defecto en `http://localhost:3001`. Vite reenvía las peticiones que empiezan por `/api` a ese origen (ver `vite.config.ts`).

### Ejemplos básicos

- Probar el API directamente (con el servidor en marcha):

```bash
curl http://localhost:3001/api/profile
```

- Vista previa del build estático de la SPA (**raíz**):

```bash
npm run build
npm run preview
```

> ⚠️ Información no disponible: no hay en el repositorio un procedimiento documentado de despliegue a producción para el API Node; el `build` de Vite genera estáticos en `dist/`, que pueden servirse desde un hosting estático, pero el API requiere un despliegue Node aparte si lo usas en producción.

## Estructura del proyecto


| Ruta                 | Descripción                                                                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/`          | Raíz de la SPA para Vite (`index.html`, `src/`). Presentación (`presentation/`), dominio (`domain/`), casos de uso vía hooks (`application/`), adaptadores HTTP (`infrastructure/`).    |
| `backend/src/`       | API Express: arranque en `main.ts`, composición HTTP en `presentation/http/createApp.ts`, casos de uso en `application/`, puertos en `application/ports/`, Prisma en `infrastructure/`. |
| `backend/prisma/`    | Esquema Prisma (`schema.prisma`): modelos como `User` y `Calendar`, datasource PostgreSQL.                                                                                              |
| `docker-compose.yml` | Servicio **PostgreSQL 16** (Alpine) con volumen persistente.                                                                                                                            |
| `vite.config.ts`     | Configuración de Vite: `root` en `frontend/`, alias `@` → `frontend/src`, proxy `/api` → `http://localhost:3001`.                                                                       |
| `docs/`              | Documentación adicional; `docs/infrastructure.md` amplía arquitectura y stack.                                                                                                          |
| `openspec/`          | Configuración OpenSpec (`config.yaml`); no forma parte del runtime de la aplicación.                                                                                                    |


## Configuración

Variables de entorno habituales en `**.env`** en la **raíz** del proyecto (cargado por el API vía `backend/src/loadEnv.ts`):


| Variable            | Uso                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`      | Cadena de conexión **PostgreSQL** para Prisma y el `PrismaClient` del API. Obligatoria para el API con base de datos.                            |
| `POSTGRES_USER`     | Usuario de la instancia en Docker Compose.                                                                                                       |
| `POSTGRES_PASSWORD` | Contraseña de la instancia en Docker Compose.                                                                                                    |
| `POSTGRES_DB`       | Nombre de la base en el contenedor; por defecto en `docker-compose.yml`: `**conrutina`**.                                                       |
| `POSTGRES_PORT`     | Puerto en el host; por defecto **5432**.                                                                                                         |
| `API_PORT`          | Puerto del API Express; por defecto **3001**. Si lo cambias, ajusta también el `server.proxy` de `vite.config.ts` para que el `target` coincida. |


Ejemplo de formato para `DATABASE_URL` (ajusta usuario, contraseña, puerto y base):

```env
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/conrutina"
```

> ⚠️ Información no disponible: no hay un archivo `.env.example` versionado en el repositorio; las claves anteriores se infieren de `docker-compose.yml`, Prisma y el código del API.

## Scripts disponibles


| Comando                   | Descripción                                                                 |
| ------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`             | Frontend (Vite) y API (Express) en paralelo con `concurrently`.           |
| `npm run dev:web`         | Solo servidor de desarrollo Vite (SPA).                                     |
| `npm run dev:api`         | Solo API Express con recarga (`tsx watch` sobre `backend/src/main.ts`).     |
| `npm run build`           | Build de producción de la SPA → `dist/`.                           |
| `npm run build:dev`       | Build en modo development.                                         |
| `npm run preview`         | Sirve el contenido de `dist/` localmente.                          |
| `npm run lint`            | Ejecuta ESLint (`eslint .`).                                       |
| `npm run test`            | Ejecuta Vitest una vez (`vitest run`).                             |
| `npm run test:watch`      | Vitest en modo observación.                                        |
| `npm run docker:up`       | `docker compose up -d`.                                            |
| `npm run docker:down`     | `docker compose down`.                                             |
| `npm run docker:logs`     | Logs del servicio `postgres`.                                      |
| `npm run prisma:init`     | `npx prisma init`.                                                 |
| `npm run prisma:generate` | `npx prisma generate`.                                             |
| `npm run db:migrate`      | `npx prisma migrate deploy`.                                       |


> ⚠️ Información no disponible: en `package.json` existen los scripts `lint` y `test`, pero **no** aparecen `eslint` ni `vitest` como dependencias en el mismo `package.json`. Es posible que fallen hasta instalar y configurar esas herramientas explícitamente.

## Tecnologías utilizadas

- **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS 4, Radix UI, componentes tipo shadcn, Motion, Recharts, Sonner, date-fns, entre otras dependencias listadas en `package.json`.
- **Backend:** Node.js, Express, CORS, Prisma 5, `@prisma/client`, `tsx` (desarrollo).
- **Base de datos:** PostgreSQL 16 (imagen Docker oficial Alpine).

## Contribución

1. Crea una rama a partir de la rama principal del repositorio.
2. Realiza cambios acotados y con mensajes de commit claros.
3. Abre un pull request describiendo el propósito del cambio y cómo probarlo (por ejemplo: `npm run dev` con PostgreSQL y `.env` configurados).

Si el proyecto adopta más adelante guías formales (estilo de código, convenciones de commits, plantillas de PR), enlázalas aquí cuando existan en el repositorio.

## Licencia

Derechos de autor reservados. El texto legal completo está en el archivo `[LICENSE](LICENSE)` en la raíz del repositorio: el software y su código fuente son propiedad exclusiva del autor; no se concede permiso para usarlo, copiarlo, modificarlo, fusionarlo, publicarlo, distribuirlo, sublicenciarlo o venderlo sin permiso explícito por escrito del autor.