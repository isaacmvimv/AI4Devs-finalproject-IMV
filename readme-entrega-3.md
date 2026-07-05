## Índice

1. [Ficha del proyecto](#0-ficha-del-proyecto)
2. [Descripción general del producto](#1-descripción-general-del-producto)
3. [Arquitectura del sistema](#2-arquitectura-del-sistema)
4. [Modelo de datos](#3-modelo-de-datos)
5. [Especificación de la API](#4-especificación-de-la-api)
6. [Historias de usuario](#5-historias-de-usuario)
7. [Tickets de trabajo](#6-tickets-de-trabajo)
8. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Isaac Mani Valor

### **0.2. Nombre del proyecto:**

ConRutina

### **0.3. Descripción breve del proyecto:**

ConRutina es una aplicación web orientada a la gestión de rutinas y buenos hábitos semanales mediante un sistema de puntuación gamificado. Permite al usuario registrar sus hábitos diarios, monitorizar su progreso a lo largo de la semana y canjear recompensas personalizadas a medida que acumula puntos, todo desde una interfaz amigable, visual e intuitiva.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

Despliegue local de producción con Docker: `http://localhost` (o `http://localhost:${WEB_PORT}`) tras `docker compose -f docker-compose.prod.yml up --build -d`. 
Despliegue en cloud: *No habrá deploy. Se acuerda entrega con video de demo.*.

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido

[https://github.com/isaacmvimv/AI4Devs-finalproject-IMV](https://github.com/isaacmvimv/AI4Devs-finalproject-IMV)

---



## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

Consultar información detallada en el documento: `[docs/prd.md](docs/prd.md)`

### **1.1. Objetivo:**

**ConRutina** es una aplicación web SPA (Single Page Application) que combina tres palancas psicológicas fundamentales para el cambio de comportamiento:

- **Refuerzo positivo:** cada hábito completado suma puntos que el usuario puede convertir en recompensas tangibles que él mismo elige.
- **Consecuencia suave:** los hábitos no realizados aplican una penalización, creando una fricción controlada que no desmotiva pero sí mantiene la atención.
- **Visibilidad del progreso:** la pantalla principal muestra en todo momento el estado del día, la semana y el histórico, dando al usuario una narrativa clara de su evolución.

La propuesta de valor se dirige a tres perfiles principales:


| Para quién                                           | Problema que resuelve                                         | Cómo lo resuelve                                                   | Diferencial                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Personas con voluntad de cambio pero baja constancia | Falta de motivación sostenida para mantener rutinas           | Sistema de puntos + recompensas propias como incentivo             | El usuario define sus propias recompensas, haciendo el incentivo genuinamente personal |
| Usuarios que quieren ver su progreso de forma visual | Frustración ante métodos de seguimiento complejos o aburridos | Interfaz gamificada y ligera (SPA, sin instalación)                | Zero-friction: funciona en cualquier navegador, no requiere app nativa                 |
| Personas que rompen rachas y abandonan               | El "todo o nada" anula el esfuerzo parcial                    | Las semanas se bloquean al terminar, preservando el historial real | El pasado no desaparece: el usuario ve su evolución honesta semana a semana            |


**Ventajas competitivas** frente a soluciones existentes:


| Competidor                | Debilidad del competidor                                                 | Ventaja de ConRutina                                            |
| ------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Habitica                  | Curva de aprendizaje alta, interfaz RPG puede alienar a algunos usuarios | UI minimalista, sin registro obligatorio, entrada inmediata     |
| Streaks / Loop            | Sin sistema de recompensas ni penalizaciones                             | Mecánica bidireccional (puntos + penalizaciones) más motivadora |
| Notion / hojas de cálculo | No gamifican ni sintetizan el progreso automáticamente                   | Dashboard visual automatizado, sin configuración manual         |
| Aplicaciones de coach     | Coste mensual elevado, dependencia de terceros                           | Autónomo, autodirigido, sin suscripción en MVP                  |




### **1.2. Características y funcionalidades principales:**



#### Gestión de hábitos

- **Crear hábito:** el usuario define nombre, emoji representativo, puntos por día completado y penalización por fallo. El hábito queda activo en la semana en curso.
- **Editar hábito:** el usuario puede modificar nombre, emoji, puntos y penalización de un hábito activo (`PATCH /api/habits/:id`). Los cambios no alteran semanas bloqueadas (snapshots inmutables).
- **Marcar estado diario:** cada celda del calendario semanal tiene tres estados: `pendiente` → `completado` → `fallado` → `pendiente` (ciclo de tres estados por clic). Los días futuros de la semana en curso no son editables.
- **Eliminar hábito:** el usuario puede borrar un hábito de la semana en curso (baja lógica). El histórico de semanas anteriores no se altera.
- **Continuidad semanal:** al inicio de cada nueva semana, los hábitos de la semana anterior se trasladan automáticamente a la nueva con puntuaciones a cero.



#### Sistema de puntuación

- Cada día completado suma los `pointsPerDay` del hábito al marcador semanal.
- Cada día fallado resta los `penalty` configurados del hábito.
- Los días en estado `pendiente` no suman ni restan.
- El marcador semanal se reinicia a cero al inicio de cada semana.
- Los puntos acumulados en la semana en curso son los únicos disponibles para canjear recompensas.



#### Recompensas

- **Crear recompensa:** el usuario define nombre, emoji, descripción y coste en puntos.
- **Canjear recompensa:** si el usuario dispone de suficientes puntos netos en la semana en curso (puntos ganados − penalizaciones − canjes previos), puede canjear la recompensa. Solo se permite un canje por semana.
- **Invalidación de canje:** si tras marcar hábitos o eliminar uno el saldo neto cae por debajo del coste del canje, el canje se revierte automáticamente y el usuario recibe un aviso.
- **Eliminar recompensa:** el usuario puede borrar una recompensa en cualquier momento (baja lógica).



#### Calendario semanal y navegación histórica

- La pantalla principal muestra la semana en curso, con los días de la semana como columnas y los hábitos como filas.
- El usuario puede navegar a semanas anteriores para consultar su historial (modo lectura, bloqueado).
- Al finalizar la semana, ésta queda congelada y no puede modificarse.



#### Estadísticas y progreso

- **Barra de progreso del día:** porcentaje de hábitos completados sobre el total en el día actual.
- **Contadores resumen:** puntos de la semana anterior, puntos de la semana actual, penalizaciones totales de la semana, mejor racha.
- **Racha de hábito:** contador de días consecutivos completados para cada hábito individual.



#### Perfil de usuario

- El sistema reconoce al usuario y muestra su nombre y correo en la cabecera.
- En la versión MVP el perfil es un registro único del sistema (simulación de sesión), listo para expandirse a autenticación real.



### **1.3. Diseño y experiencia de usuario:**

La aplicación se compone de una única pantalla que concentra toda la funcionalidad relevante sin necesidad de navegar entre vistas:

**Vista principal — semana actual**

La pantalla principal muestra el perfil de usuario en la cabecera, los contadores de estadísticas semanales (puntos semana anterior, puntos semana actual, penalizaciones, mejor racha), la barra de progreso del día actual, el calendario semanal con las filas de hábitos y sus celdas de estado, y el bloque de recompensas disponibles.

**Vista histórica — semana anterior bloqueada**

Al navegar a una semana pasada con los controles `‹` y `›`, el calendario se muestra en modo solo lectura. Las celdas están deshabilitadas y aparece un indicador visual de "semana bloqueada" que comunica al usuario que ese historial es inmutable.

**Modal: Nuevo hábito**

El modal de creación de hábito permite seleccionar un emoji, escribir el nombre del hábito, definir los puntos ganados por día completado y la penalización por día fallado. Las validaciones se muestran de forma inline antes de enviar el formulario.

**Modal: Nueva recompensa**

El modal de creación de recompensa permite seleccionar emoji, escribir nombre y descripción, y definir el coste en puntos necesario para canjearla. Cada recompensa es completamente personalizada por el usuario.

### **1.4. Instrucciones de instalación:**



#### Prerrequisitos

- **Node.js** LTS reciente (compatible con Vite 6 y Prisma 5)
- **npm** (hay `package-lock.json` en la raíz) o **pnpm**
- **Docker** y **Docker Compose** (recomendado para PostgreSQL local)



#### 1. Clonar el repositorio e instalar dependencias

```bash
npm install
```



#### 2. Configurar variables de entorno

Copiar la plantilla en la raíz del proyecto:

```bash
cp .env.example .env
```

En Windows (PowerShell):

```powershell
copy .env.example .env
```

Variables mínimas (detalle en `.env.example`):

```env
DATABASE_URL=postgresql://conrutina:conrutina_dev_pass@localhost:5432/conrutina
POSTGRES_USER=conrutina
POSTGRES_PASSWORD=conrutina_dev_pass
POSTGRES_DB=conrutina
POSTGRES_PORT=5432
API_PORT=3001
CORS_ORIGIN=http://localhost:5173
```



#### 3. Levantar PostgreSQL con Docker

```bash
npm run db:up
```

o

```bash
docker compose up -d db
```

Esperar hasta que el contenedor esté saludable (unos 15 segundos). Verificar con:

```bash
npm run docker:logs
```

El volumen persistente se llama `ConRutina_postgres_data`.

#### 4. Generar cliente Prisma y aplicar migraciones

```bash
npm run prisma:generate
npm run db:migrate
```



#### 5. (Opcional) Cargar datos de ejemplo

```bash
npm run db:seed
```

Inserta: 1 usuario (`demo@ConRutina.app`, `id=1`), 3 hábitos (Correr, Meditar, Leer), 1 semana activa con 21 entradas diarias y 2 recompensas (Tarde libre — 50 pts, Cena especial — 80 pts).

> **Nota:** Al arrancar el API sin seed, `ensureDemoUser` crea automáticamente el usuario demo (`id=1`) si la base está vacía. Para hábitos, recompensas y semana de ejemplo, ejecuta el seed.



#### 6. Arrancar el proyecto

Un solo comando desde la raíz levanta frontend (Vite, `:5173`) y backend (Express, `:3001`) en paralelo:

```bash
npm run dev
```

Abrir `http://localhost:5173`.

Atajos si solo necesitas uno de los procesos:

```bash
npm run dev:web   # Solo frontend
npm run dev:api   # Solo backend
```



#### 7. Parar PostgreSQL

```bash
npm run db:down
```

o

```bash
docker compose stop db
```



#### Producción local (Docker)

Stack completo (PostgreSQL + API + nginx con SPA):

- Arranque:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Acceso: `http://localhost` (puerto configurable con `WEB_PORT` en `.env`). El API no expone puerto en el host; las peticiones van por el proxy nginx (`/api/` → `api:3001`).

- Parada:

```bash
docker compose -f docker-compose.prod.yml down   # Con datos persistentes
docker compose -f docker-compose.prod.yml down -v   # Sin datos persistentes. Borrando el volumen
```



#### Comandos adicionales


| Comando                    | Descripción                                                     |
| -------------------------- | --------------------------------------------------------------- |
| `npm run build`            | Genera el bundle de producción en `frontend/dist/`              |
| `npm run preview`          | Sirve localmente el build de producción                         |
| `npm run test`             | Tests unitarios (Vitest)                                        |
| `npm run test:integration` | Tests de integración contra PostgreSQL (requiere Docker activo) |
| `npm run test:coverage`    | Tests unitarios con informe de cobertura                        |
| `npm run lint`             | ESLint sobre frontend y backend                                 |
| `npm run typecheck`        | Comprobación de tipos TypeScript                                |
| `npm run docker:up`        | Alias de `db:up`                                                |
| `npm run docker:down`      | Alias de `db:down`                                              |
| `npm run docker:logs`      | Logs del contenedor PostgreSQL                                  |
| `npm run prisma:generate`  | Regenera el cliente Prisma tras cambios en el schema            |


---



## 2. Arquitectura del Sistema



### **2.1. Diagrama de arquitectura:**

ConRutina sigue una **Clean Architecture** en dos árboles independientes (frontend y backend), con separación estricta de capas en cada uno. Esta arquitectura garantiza:

- **Independencia de framework:** la lógica de dominio (hábitos, semanas, puntos) no depende de React ni de Express.
- **Testabilidad:** los casos de uso del dominio son funciones puras fácilmente testeables sin necesidad de montar servidor ni navegador.
- **Escalabilidad:** el frontend puede desplegarse en cualquier CDN; el backend puede escalar horizontalmente sin afectar a la UI.

```mermaid
flowchart TB
  subgraph client["Navegador (Cliente)"]
    React["React SPA\n(Vite bundle)"]
  end

  subgraph devenv["Entorno Desarrollo"]
    Vite["Vite Dev Server\n:5173"]
    API["Express API\n(tsx watch :3001)"]
    Vite -->|"proxy /api"| API
  end

  subgraph prodenv["Entorno Producción"]
    CDN["CDN / Hosting estático\n(frontend/dist/)"]
    APIprod["API Node\n(contenedor / PaaS)"]
  end

  subgraph data["Persistencia"]
    PG[("PostgreSQL 16\n(Docker local / cloud)")]
    Prisma["Prisma ORM\n(PrismaClient)"]
    Prisma -->|"DATABASE_URL"| PG
  end

  React -->|"fetch /api/profile"| Vite
  API --> Prisma
  CDN -->|"sirve HTML+JS+CSS"| client
  APIprod --> Prisma

  style client fill:#E8F5E9,stroke:#4CAF50
  style devenv fill:#E3F2FD,stroke:#2196F3
  style prodenv fill:#FFF3E0,stroke:#FF9800
  style data fill:#FCE4EC,stroke:#E91E63
```



**Patrón arquitectónico:** Clean Architecture con dos árboles independientes (frontend SPA y backend API REST). Ambos implementan las mismas cuatro capas: Presentación, Aplicación, Dominio e Infraestructura.

### **2.2. Descripción de componentes principales:**

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (React SPA)                                           │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  Presentación   │  │   Aplicación     │  │    Dominio     │  │
│  │  (componentes   │→ │  (hooks:         │→ │  (tipos puros, │  │
│  │   React, UI)    │  │  useHabitDash-   │  │  funciones de  │  │
│  │                 │  │  board,          │  │  cálculo,      │  │
│  │  App.tsx        │  │  useUserProfile) │  │  interfaces)   │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
│                               │                                 │
│                    ┌──────────────────┐                         │
│                    │ Infraestructura  │                         │
│                    │ (profileApi,     │                         │
│                    │ habitApi,        │                         │
│                    │ weekApi,         │                         │
│                    │ rewardApi…)      │                         │
│                    └──────────────────┘                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP /api (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (Express API)                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  Presentación   │  │   Aplicación     │  │    Dominio     │  │
│  │  (rutas HTTP,   │→ │  (casos de uso:  │→ │  (entidades,   │  │
│  │  createApp,     │  │  getCurrentWeek, │  │  puertos,      │  │
│  │  CORS, Zod)     │  │  redeemReward,   │  │  interfaces)   │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
│                               │                                 │
│                    ┌──────────────────┐                         │
│                    │ Infraestructura  │                         │
│                    │ (Prisma ORM,     │                         │
│                    │ repositorios)    │                         │
│                    └──────────────────┘                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ DATABASE_URL (TCP)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  BASE DE DATOS                                                  │
│  PostgreSQL 16 (Docker en desarrollo / cloud en producción)     │
└─────────────────────────────────────────────────────────────────┘
```


| Componente          | Tecnología                                                              | Propósito                                                                   |
| ------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **React SPA**       | TypeScript · React 18 · Vite 6 · Tailwind CSS v4 · Radix UI / shadcn/ui | Interfaz de usuario, estado local de hábitos y recompensas, consumo del API |
| **Express API**     | TypeScript · Express 4 · tsx watch · Prisma ORM 5                       | Rutas REST bajo `/api`, casos de uso, acceso a BD                           |
| **PostgreSQL 16**   | Docker (dev) / cloud (prod)                                             | Persistencia de usuarios, semanas, hábitos, entradas diarias y canjes       |
| **Prisma ORM**      | `@prisma/client` 5.x                                                    | Acceso tipado a PostgreSQL; schema versionado con migraciones               |
| **Vite Dev Server** | Vite 6.4.2                                                              | Servidor de desarrollo con HMR y proxy `/api` → Express en `:3001`          |




### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto es un **monorepo** con dos árboles independientes (`frontend/` y `backend/`), ambos escritos en TypeScript y organizados en Clean Architecture:

```
ConRutina/
├── backend/
│   ├── Dockerfile           # Imagen multi-stage del API (Node 20 Alpine)
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema Prisma (PostgreSQL, modelos)
│   │   ├── migrations/      # Migraciones versionadas
│   │   └── seed.ts          # Datos de demo
│   └── src/                 # API Node (Clean Architecture)
│       ├── main.ts          # Entrada: Express + listen + ensureDemoUser
│       ├── domain/
│       ├── application/     # Casos de uso y puertos
│       ├── infrastructure/  # Repositorios Prisma
│       └── presentation/
│           └── http/        # createApp, CORS, rutas /api, middleware Zod
├── frontend/
│   ├── Dockerfile           # Build Vite + nginx
│   ├── nginx.conf           # Proxy /api/ → api:3001, fallback SPA
│   ├── index.html           # HTML shell; raíz #root (raíz de Vite)
│   └── src/
│       ├── main.tsx         # Entrada React
│       ├── domain/          # Tipos y lógica pura (hábitos, semana…)
│       ├── application/     # Hooks (useHabitDashboard, useUserProfile)
│       ├── infrastructure/  # Clientes HTTP (profile, habits, weeks, rewards)
│       ├── presentation/    # App.tsx, components/
│       └── styles/
├── docs/                    # PRD, backlog, api-spec.yml, guías
├── openspec/                # Changes OpenSpec (spec-driven)
├── docker-compose.yml       # PostgreSQL 16 para desarrollo (servicio db)
├── docker-compose.prod.yml  # Stack producción: db + api + web
├── package.json
├── vite.config.ts
└── vitest.integration.config.ts
```

**Patrón de capas en ambos árboles:**

- **Dominio:** tipos puros, funciones de cálculo e interfaces. Sin dependencias de React, Express ni Prisma.
- **Aplicación:** orquesta casos de uso. En frontend son hooks (`useHabitDashboard`, `useUserProfile`); en backend son funciones de caso de uso (`getCurrentWeekResponse`, `redeemReward`, `lockWeekAndTransition`, etc.).
- **Infraestructura:** adapta el mundo exterior. En frontend son los clientes HTTP (`habitApi`, `weekApi`, `rewardApi`, `profileApi`); en backend son los repositorios Prisma.
- **Presentación:** en frontend son los componentes React; en backend son las rutas HTTP, middleware Express y validación Zod.



### **2.4. Infraestructura y despliegue**

**Entorno de desarrollo:**

1. El desarrollador ejecuta `npm run dev` (Vite en `:5173` y Express en `:3001` en paralelo con `concurrently`).
2. Las peticiones del cliente a `/api/*` las recibe Vite y las reenvía al proceso Express (proxy en `vite.config.ts`).
3. Express consulta la BD con Prisma y devuelve JSON.

**Entorno de producción (Docker local):**

1. `docker compose -f docker-compose.prod.yml up --build -d` levanta tres servicios: `db` (PostgreSQL 16), `api` (Express + migraciones Prisma al arrancar) y `web` (nginx sirviendo `frontend/dist/` y proxy `/api/`).
2. La SPA es accesible en `http://localhost` (puerto `${WEB_PORT:-80}`).
3. El volumen de producción (`ConRutina_postgres_prod_data`) es independiente del de desarrollo.

**Entorno de producción (cloud):**

1. `npm run build` genera `frontend/dist/` (HTML + JS + CSS estáticos).
2. Los estáticos se despliegan en cualquier CDN; la API como contenedor Node o PaaS.
3. Un reverse proxy unifica `/api` hacia el backend.

**Diagrama de infraestructura:**

```mermaid
flowchart LR
  subgraph dev["Desarrollo"]
    Vite[Vite dev server]
    Api[Express API]
    BrowserDev[Navegador]
    Vite --> BrowserDev
    BrowserDev -->|fetch /api| Vite
    Vite -->|proxy| Api
  end

  subgraph prod["Producción"]
    Static[Hosting estático]
    BrowserProd[Navegador]
    Static --> BrowserProd
  end

  subgraph app["Aplicación React"]
    Main[main.tsx]
    App[App.tsx]
    Domain[Componentes dominio]
    UI[components/ui]
    Main --> App
    App --> Domain
    Domain --> UI
  end

  subgraph data["Datos local"]
    PG[(PostgreSQL Docker)]
    Prisma[PrismaClient en API]
    Prisma -->|DATABASE_URL| PG
  end

  Api --> Prisma
  BrowserDev --> Main
  BrowserProd --> Main
```



**Docker Compose (desarrollo):**

El fichero `docker-compose.yml` define el servicio `db` con imagen `postgres:16-alpine`, volumen persistente `ConRutina_postgres_data`, health check con `pg_isready` y credenciales configurables vía `.env`.


| Variable            | Uso                                      |
| ------------------- | ---------------------------------------- |
| `POSTGRES_USER`     | Usuario de la instancia (obligatorio)    |
| `POSTGRES_PASSWORD` | Contraseña (obligatorio)                 |
| `POSTGRES_DB`       | Nombre de la BD; por defecto `conrutina` |
| `POSTGRES_PORT`     | Puerto en el host; por defecto `5432`    |




### **2.5. Seguridad**

Prácticas de seguridad **implementadas** en el MVP:

- **CORS estricto:** el origen permitido se lee de la variable de entorno `CORS_ORIGIN` (no hardcodeado). En desarrollo apunta a `http://localhost:5173`; en Docker prod el compose fija `http://localhost`.
- **Validación de entrada (Zod):** middleware `validateBody` en rutas mutables; esquemas en `backend/src/application/validation/`.
- **Variables de entorno separadas del código:** `DATABASE_URL` y credenciales nunca se incluyen en el repositorio. El fichero `.env` está en `.gitignore`. El arranque del servidor valida con Zod que las variables obligatorias estén presentes (`backend/src/config.ts`).
- **Semanas bloqueadas (integridad de datos):** el backend rechaza con `409 Conflict` cualquier mutación sobre entradas de una semana con `isLocked=true`, preservando la inmutabilidad del historial.
- **Baja lógica en lugar de borrado físico:** los hábitos y recompensas eliminados se marcan con `isActive=false`; nunca se eliminan de la BD, preservando la integridad referencial de semanas históricas bloqueadas.
- **Usuario MVP fijado en servidor:** todas las rutas resuelven `userId=1` (sin autenticación real). El API crea el usuario demo al arrancar si la BD está vacía.

**Pendiente para una versión posterior (US-21):**

- Headers HTTP de seguridad con `helmet`.
- Rate limiting con `express-rate-limit`.
- Middleware de autenticación (`X-User-Id` / JWT) centralizado en lugar de `userId` hardcodeado en handlers.



### **2.6. Tests**

Los tests están **implementados** (User Story US-20). La estrategia cubre dos niveles:

**Tests unitarios (Vitest — frontend y backend):**

- **Frontend:** funciones puras en `frontend/src/domain/` (`toggleHabitDayCompletion`, `calculateHabitStats`, `calculateTodayProgressPercent`, `computeStreakFromStatus`, `totalPointsFromStats`, `buildWeekData`) y hooks/clientes HTTP en `frontend/src/application/` e `infrastructure/`.
- **Backend:** casos de uso en `backend/src/application/` (p. ej. `lockWeekAndTransition`, `redeemReward`, `computeCurrentWeekNetPoints`, `reconcileWeekRedemption`) y middleware HTTP.

Comando: `npm run test` · Cobertura: `npm run test:coverage`

**Tests de integración (backend — supertest + PostgreSQL):**

Ejecutados contra una BD PostgreSQL real (requiere Docker activo con `npm run db:up`):

- `GET /api/profile` → 200 con datos correctos
- `POST /api/habits` → 201 con hábito creado; 400 si body inválido
- `PATCH /api/habit-entries/:id` → 409 si la semana está bloqueada (`isLocked=true`)
- `POST /api/weeks/:id/redemptions` → 422 con `{ code: "INSUFFICIENT_POINTS", available, required }` si saldo insuficiente

Comando: `npm run test:integration`

---



## 3. Modelo de Datos



### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
  USER {
    Int id PK
    String email
    String name
    String avatarUrl
    DateTime createdAt
  }

  WEEK {
    Int id PK
    Int userId FK
    DateTime startDate
    DateTime endDate
    Boolean isLocked
    Int totalPointsEarned
    Int totalPenalties
    DateTime createdAt
  }

  HABIT {
    Int id PK
    Int userId FK
    String emoji
    String name
    Int pointsPerDay
    Int penalty
    Boolean isActive
    DateTime createdAt
  }

  WEEK_HABIT {
    Int id PK
    Int weekId FK
    Int habitId FK
    Int order
    String snapshotName
    String snapshotEmoji
    Int snapshotPoints
    Int snapshotPenalty
  }

  HABIT_ENTRY {
    Int id PK
    Int weekHabitId FK
    Int dayIndex
    Enum status
    DateTime updatedAt
  }

  REWARD {
    Int id PK
    Int userId FK
    String emoji
    String name
    String description
    Int cost
    Boolean isActive
    DateTime createdAt
  }

  REWARD_REDEMPTION {
    Int id PK
    Int weekId FK
    Int rewardId FK
    Int pointsSpent
    DateTime redeemedAt
  }

  USER ||--o{ WEEK : "tiene"
  USER ||--o{ HABIT : "crea"
  USER ||--o{ REWARD : "crea"
  WEEK ||--o{ WEEK_HABIT : "contiene"
  HABIT ||--o{ WEEK_HABIT : "aparece en"
  WEEK_HABIT ||--|{ HABIT_ENTRY : "genera"
  WEEK ||--o{ REWARD_REDEMPTION : "registra"
  REWARD ||--o{ REWARD_REDEMPTION : "es canjeada en"
```





### **3.2. Descripción de entidades principales:**



#### User (Usuario)


| Atributo    | Tipo       | Restricciones            | Descripción                     |
| ----------- | ---------- | ------------------------ | ------------------------------- |
| `id`        | `Int`      | PK, autoincrement        | Identificador único del usuario |
| `email`     | `String`   | unique, not null         | Correo electrónico              |
| `name`      | `String?`  | nullable                 | Nombre visible en la cabecera   |
| `avatarUrl` | `String?`  | nullable                 | URL opcional del avatar         |
| `createdAt` | `DateTime` | not null, default: now() | Fecha de creación de la cuenta  |




#### Week (Semana)


| Atributo            | Tipo       | Restricciones            | Descripción                                                 |
| ------------------- | ---------- | ------------------------ | ----------------------------------------------------------- |
| `id`                | `Int`      | PK, autoincrement        | Identificador único de la semana                            |
| `userId`            | `Int`      | FK → User, not null      | Usuario propietario                                         |
| `startDate`         | `DateTime` | not null                 | Lunes de la semana (00:00:00)                               |
| `endDate`           | `DateTime` | not null                 | Domingo de la semana (23:59:59)                             |
| `isLocked`          | `Boolean`  | not null, default: false | `true` cuando la semana ha terminado y no puede modificarse |
| `totalPointsEarned` | `Int`      | not null, default: 0     | Puntos positivos acumulados al bloquear                     |
| `totalPenalties`    | `Int`      | not null, default: 0     | Penalizaciones acumuladas al bloquear                       |
| `createdAt`         | `DateTime` | not null, default: now() | Fecha de creación del registro                              |


*Índice:* `@@index([userId, startDate])` para optimizar `getCurrentWeek`.

#### Habit (Hábito)


| Atributo       | Tipo       | Restricciones            | Descripción                                                      |
| -------------- | ---------- | ------------------------ | ---------------------------------------------------------------- |
| `id`           | `Int`      | PK, autoincrement        | Identificador único del hábito                                   |
| `userId`       | `Int`      | FK → User, not null      | Usuario propietario                                              |
| `emoji`        | `String`   | not null                 | Emoji representativo                                             |
| `name`         | `String`   | not null                 | Nombre descriptivo del hábito                                    |
| `pointsPerDay` | `Int`      | not null, > 0            | Puntos ganados por día completado                                |
| `penalty`      | `Int`      | not null, >= 0           | Puntos perdidos por día fallado                                  |
| `isActive`     | `Boolean`  | not null, default: true  | Indica si el hábito está disponible para añadir a nuevas semanas |
| `createdAt`    | `DateTime` | not null, default: now() | Fecha de creación                                                |




#### WeekHabit (Hábito en una Semana)

Tabla intermedia que representa la asociación de un hábito concreto a una semana específica. Permite que cada semana tenga un conjunto de hábitos diferente y guarda un **snapshot inmutable** de los valores en el momento del bloqueo.


| Atributo          | Tipo     | Restricciones         | Descripción                                                       |
| ----------------- | -------- | --------------------- | ----------------------------------------------------------------- |
| `id`              | `Int`    | PK, autoincrement     | Identificador único                                               |
| `weekId`          | `Int`    | FK → Week, not null   | Semana a la que pertenece                                         |
| `habitId`         | `Int`    | FK → Habit, not null  | Hábito asociado                                                   |
| `order`           | `Int`    | not null              | Orden de visualización en el calendario                           |
| `snapshotName`    | `String` | not null              | Nombre del hábito en el momento del bloqueo (histórico inmutable) |
| `snapshotEmoji`   | `String` | not null, default: "" | Emoji del hábito en el momento del bloqueo                        |
| `snapshotPoints`  | `Int`    | not null              | Puntos del hábito en el momento del bloqueo                       |
| `snapshotPenalty` | `Int`    | not null              | Penalización en el momento del bloqueo                            |


*Restricción:* `@@unique([weekId, habitId])` — evita duplicados de hábito en la misma semana.
*Índice:* `@@index([weekId])`.

#### HabitEntry (Entrada diaria de un Hábito)

Registra el estado de cada hábito por cada día de la semana. Cada `WeekHabit` genera exactamente 7 entradas (Lun–Dom).


| Atributo      | Tipo       | Restricciones              | Descripción                                                      |
| ------------- | ---------- | -------------------------- | ---------------------------------------------------------------- |
| `id`          | `Int`      | PK, autoincrement          | Identificador único                                              |
| `weekHabitId` | `Int`      | FK → WeekHabit, not null   | Relación con el hábito de la semana                              |
| `dayIndex`    | `Int`      | not null, 0–6              | Índice del día (0=Lunes … 6=Domingo)                             |
| `status`      | `Enum`     | not null, default: pending | Estado del hábito para ese día: `pending`, `completed`, `failed` |
| `updatedAt`   | `DateTime` | not null                   | Última actualización                                             |


*Índice:* `@@index([weekHabitId])`.

#### Reward (Recompensa)


| Atributo      | Tipo       | Restricciones            | Descripción                             |
| ------------- | ---------- | ------------------------ | --------------------------------------- |
| `id`          | `Int`      | PK, autoincrement        | Identificador único                     |
| `userId`      | `Int`      | FK → User, not null      | Usuario propietario                     |
| `emoji`       | `String`   | not null                 | Emoji representativo                    |
| `name`        | `String`   | not null                 | Nombre de la recompensa                 |
| `description` | `String`   | not null                 | Descripción breve                       |
| `cost`        | `Int`      | not null, > 0            | Coste en puntos para canjear            |
| `isActive`    | `Boolean`  | not null, default: true  | Indica si la recompensa está disponible |
| `createdAt`   | `DateTime` | not null, default: now() | Fecha de creación                       |




#### RewardRedemption (Canje de Recompensa)

Registra cada vez que el usuario canjea una recompensa en una semana determinada.


| Atributo      | Tipo       | Restricciones         | Descripción                                |
| ------------- | ---------- | --------------------- | ------------------------------------------ |
| `id`          | `Int`      | PK, autoincrement     | Identificador único                        |
| `weekId`      | `Int`      | FK → Week, not null   | Semana en que se canjeó                    |
| `rewardId`    | `Int`      | FK → Reward, not null | Recompensa canjeada                        |
| `pointsSpent` | `Int`      | not null              | Puntos descontados en el momento del canje |
| `redeemedAt`  | `DateTime` | not null              | Timestamp del canje                        |


*Índice:* `@@index([weekId])` para cálculo de saldo disponible.

**Relaciones resumen:**


| From        | To                 | Cardinalidad | Descripción                                                          |
| ----------- | ------------------ | ------------ | -------------------------------------------------------------------- |
| `User`      | `Week`             | 1:N          | Un usuario tiene muchas semanas                                      |
| `User`      | `Habit`            | 1:N          | Un usuario crea y gestiona sus propios hábitos                       |
| `User`      | `Reward`           | 1:N          | Un usuario define sus propias recompensas                            |
| `Week`      | `WeekHabit`        | 1:N          | Una semana tiene varios hábitos activos                              |
| `Habit`     | `WeekHabit`        | 1:N          | Un hábito puede aparecer en múltiples semanas con snapshot inmutable |
| `WeekHabit` | `HabitEntry`       | 1:7          | Cada asociación hábito-semana genera exactamente 7 entradas diarias  |
| `Week`      | `RewardRedemption` | 1:N          | Una semana puede registrar múltiples canjes de recompensas           |
| `Reward`    | `RewardRedemption` | 1:N          | Una recompensa puede ser canjeada en múltiples semanas               |


---



## 4. Especificación de la API

> Los endpoints están bajo el prefijo `/api`. Todas las peticiones y respuestas usan `Content-Type: application/json` (UTF-8). Los valores `DateTime` se expresan en ISO 8601 (UTC).

Especificación OpenAPI completa: `[docs/api-spec.yml](docs/api-spec.yml)`

**Resumen de endpoints implementados:**


| Método   | Ruta                             | Descripción                                            |
| -------- | -------------------------------- | ------------------------------------------------------ |
| `GET`    | `/health`                        | Health check del API                                   |
| `GET`    | `/api/profile`                   | Perfil del usuario (MVP: `id=1`)                       |
| `GET`    | `/api/habits`                    | Listar hábitos activos                                 |
| `POST`   | `/api/habits`                    | Crear hábito                                           |
| `PATCH`  | `/api/habits/:id`                | Editar hábito activo                                   |
| `DELETE` | `/api/habits/:id`                | Baja lógica de hábito                                  |
| `GET`    | `/api/rewards`                   | Listar recompensas activas (incluye `hasBeenRedeemed`) |
| `POST`   | `/api/rewards`                   | Crear recompensa                                       |
| `DELETE` | `/api/rewards/:id`               | Baja lógica de recompensa                              |
| `GET`    | `/api/weeks/current`             | Semana activa (bloqueo automático si cambió la semana) |
| `GET`    | `/api/weeks?offset=n`            | Semana por offset (`0` = actual, `-1` = anterior…)     |
| `PATCH`  | `/api/habit-entries/:id`         | Actualizar estado diario de un hábito                  |
| `POST`   | `/api/weeks/:weekId/redemptions` | Canjear recompensa en la semana indicada               |


---



### Endpoint 1: `GET /api/profile`

Devuelve los datos del usuario para la cabecera de la aplicación.

```yaml
openapi: '3.0.3'
paths:
  /api/profile:
    get:
      summary: Obtener perfil del usuario autenticado
      description: >
        Devuelve los datos de identificación del usuario (id, nombre, email, avatar).
        En el MVP el userId se resuelve en servidor (hardcodeado a 1 o vía header X-User-Id).
      responses:
        '200':
          description: Perfil del usuario encontrado
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 1
                  name:
                    type: string
                    nullable: true
                    example: 'Demo User'
                  email:
                    type: string
                    example: 'demo@ConRutina.app'
                  avatarUrl:
                    type: string
                    nullable: true
                    example: null
        '404':
          description: Usuario no encontrado
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: 'USER_NOT_FOUND'
                  message:
                    type: string
                    example: 'Usuario no encontrado'
        '500':
          description: Error interno del servidor
```

**Ejemplo de petición:**

```bash
curl http://localhost:3001/api/profile
```

**Ejemplo de respuesta (200):**

```json
{
  "id": 1,
  "name": "Demo User",
  "email": "demo@ConRutina.app",
  "avatarUrl": null
}
```

---



### Endpoint 2: `GET /api/weeks/current`

Devuelve la semana activa del usuario con todos sus hábitos, entradas diarias y estadísticas. Si ha cambiado de semana, bloquea la anterior y crea la nueva automáticamente (UC-08).

```yaml
openapi: '3.0.3'
paths:
  /api/weeks/current:
    get:
      summary: Obtener la semana activa del usuario
      description: >
        Devuelve la semana activa con sus WeekHabits, las 7 HabitEntries por hábito y las
        estadísticas calculadas. Si ha cambiado de semana desde el último acceso, bloquea
        la semana anterior (isLocked=true, snapshot inmutable) y crea la nueva con los
        hábitos heredados en status=pending.
      responses:
        '200':
          description: Semana activa encontrada o creada
          content:
            application/json:
              schema:
                type: object
                properties:
                  week:
                    type: object
                    properties:
                      id:
                        type: integer
                        example: 3
                      startDate:
                        type: string
                        format: date-time
                        example: '2026-04-13T00:00:00.000Z'
                      endDate:
                        type: string
                        format: date-time
                        example: '2026-04-19T23:59:59.999Z'
                      isLocked:
                        type: boolean
                        example: false
                  habits:
                    type: array
                    items:
                      type: object
                      properties:
                        weekHabit:
                          type: object
                          properties:
                            id:
                              type: integer
                            habitId:
                              type: integer
                            order:
                              type: integer
                            snapshotName:
                              type: string
                              example: 'Correr'
                            snapshotPoints:
                              type: integer
                              example: 10
                            snapshotPenalty:
                              type: integer
                              example: 5
                        entries:
                          type: array
                          minItems: 7
                          maxItems: 7
                          items:
                            type: object
                            properties:
                              id:
                                type: integer
                              dayIndex:
                                type: integer
                                minimum: 0
                                maximum: 6
                              status:
                                type: string
                                enum: [pending, completed, failed]
                                example: 'pending'
                  stats:
                    type: object
                    properties:
                      thisWeekPoints:
                        type: integer
                        example: 30
                      lastWeekPoints:
                        type: integer
                        example: 75
                      penalties:
                        type: integer
                        example: 5
                      maxStreak:
                        type: integer
                        example: 3
                  redemptions:
                    type: array
                    items:
                      type: object
        '500':
          description: Error interno del servidor
```

**Ejemplo de petición:**

```bash
curl http://localhost:3001/api/weeks/current
```

---



### Endpoint 3: `PATCH /api/habit-entries/{habitEntryId}`

Actualiza el estado (`status`) de una celda concreta del calendario. Rechaza la mutación si la semana está bloqueada.

```yaml
openapi: '3.0.3'
paths:
  /api/habit-entries/{habitEntryId}:
    patch:
      summary: Actualizar el estado de una entrada diaria de hábito
      description: >
        Actualiza el campo status de una HabitEntry concreta. El ciclo de estados
        válidos es: pending → completed → failed → pending. Rechaza la petición con 409
        si la semana asociada está bloqueada (isLocked=true).
      parameters:
        - name: habitEntryId
          in: path
          required: true
          schema:
            type: integer
          example: 42
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status:
                  type: string
                  enum: [pending, completed, failed]
                  example: 'completed'
      responses:
        '200':
          description: Estado actualizado correctamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 42
                  status:
                    type: string
                    enum: [pending, completed, failed]
                    example: 'completed'
                  updatedAt:
                    type: string
                    format: date-time
                    example: '2026-04-18T09:15:00.000Z'
        '400':
          description: Valor de status inválido
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: 'VALIDATION_ERROR'
                  details:
                    type: array
                    items:
                      type: object
                      properties:
                        field:
                          type: string
                          example: 'status'
                        message:
                          type: string
                          example: 'Debe ser pending, completed o failed'
        '404':
          description: HabitEntry no encontrada o no pertenece al usuario
        '409':
          description: La semana está bloqueada y no admite modificaciones
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: 'WEEK_LOCKED'
                  message:
                    type: string
                    example: 'No se puede modificar una semana bloqueada'
```

**Ejemplo de petición:**

```bash
curl -X PATCH http://localhost:3001/api/habit-entries/42 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Ejemplo de respuesta (200):**

```json
{
  "id": 42,
  "status": "completed",
  "updatedAt": "2026-04-18T09:15:00.000Z",
  "redemptionInvalidated": false
}
```

---



## 5. Historias de Usuario

> Tres historias de usuario principales, con criterios INVEST y Acceptance Criteria en formato Gherkin.

Consultar información detallada en el documento: `[docs/product-backlog.md](docs/product-backlog.md)`

---

**Historia de Usuario 1**

### US-18 · UI: estadísticas en tiempo real y navegación histórica

**Como** usuario, **quiero** ver mis puntos, penalizaciones y racha actualizarse instantáneamente al interactuar con el calendario, y poder navegar a semanas anteriores para consultar mi historial, **para** tener feedback inmediato de mi progreso y perspectiva de mi evolución.

**MoSCoW:** `Must Have` · **Complejidad:** `M` · **Story Points:** 5

**INVEST:**


| Criterio    | Evaluación                                                                            |
| ----------- | ------------------------------------------------------------------------------------- |
| Independent | Depende de US-09 (API de semanas con stats reales) y US-16 (toggle de celdas).        |
| Negotiable  | El número máximo de semanas navegables en historial es negociable.                    |
| Valuable    | Las estadísticas y el historial son el motor motivacional y diferencial del producto. |
| Estimable   | Lógica reactiva (dominio US-13) + integración con API de semanas históricas.          |
| Small       | Dos funcionalidades relacionadas unificadas en la barra estadística.                  |
| Testable    | Verificar recálculo inmediato y carga correcta de semanas históricas.                 |


**Acceptance Criteria (BDD):**

```gherkin
# Scenario 1 — Actualización en tiempo real
Given el usuario tiene 20 pts y marca completado un hábito de 10 pts
When hace clic en la celda
Then el StatCard "Puntos esta semana" pasa a 30 en menos de 100ms (optimistic update)
And la barra de progreso del día se actualiza al mismo tiempo

# Scenario 2 — Navegar al historial (happy path)
Given el usuario está en la semana actual y hace clic en "‹"
When se carga la semana anterior vía GET /api/weeks?offset=-1
Then el calendario muestra los hábitos y estados de esa semana (modo lectura)
And las estadísticas reflejan totalPointsEarned y totalPenalties de la semana bloqueada
And se muestra el badge "Semana bloqueada 🔒"

# Scenario 3 — Edge case: no hay semana anterior
Given el usuario está en su primera semana
When hace clic en "‹"
Then el botón "‹" está deshabilitado
And no se produce ningún error ni llamada a la API innecesaria
```

---

**Historia de Usuario 2**

### US-20 · [NFR] Testing automatizado: unitario e integración

**Como** equipo de desarrollo, **quiero** tener tests unitarios para la lógica de dominio del frontend y tests de integración para los endpoints principales del backend, **para** detectar regresiones automáticamente y garantizar la corrección de los cálculos críticos.

**MoSCoW:** `Should Have` · **Complejidad:** `M` · **Story Points:** 8

**INVEST:**


| Criterio    | Evaluación                                                                               |
| ----------- | ---------------------------------------------------------------------------------------- |
| Independent | Los tests de dominio son independientes; los de integración necesitan las APIs estables. |
| Negotiable  | El porcentaje de cobertura objetivo y las herramientas son negociables.                  |
| Valuable    | Reduce el riesgo de regresiones en cálculos de puntos, canjes y bloqueos.                |
| Estimable   | Alcance bien definido: funciones puras del dominio + endpoints críticos.                 |
| Small       | Puede dividirse en unitario y de integración como tareas separadas.                      |
| Testable    | La propia cobertura es la medida.                                                        |


**Acceptance Criteria (BDD):**

```gherkin
# Scenario 1 — Tests unitarios configurados y pasando
Given Vitest está configurado con @vitest/coverage-v8
When se ejecuta "npm run test"
Then todos los tests pasan sin error

# Scenario 2 — Funciones de dominio cubiertas
Given los tests unitarios se ejecutan
Then existen tests para: toggleHabitDayCompletion, calculateHabitStats, calculateTodayProgressPercent, computeStreakFromStatus, totalPointsFromStats, buildWeekData

# Scenario 3 — Tests de integración de API
Given el backend corre contra BD de test (PostgreSQL con Docker)
When se ejecuta "npm run test:integration"
Then GET /api/profile → 200 con datos correctos
And POST /api/habits → 201 con hábito creado; 400 si body inválido
And PATCH /api/habit-entries/:id → 409 si semana bloqueada
And POST /api/weeks/:id/redemptions → 422 si saldo insuficiente
```

---

**Historia de Usuario 3**

### US-23 · [NFR] Entorno de producción y despliegue Docker

**Como** equipo de desarrollo, **quiero** tener Dockerfiles multi-stage para frontend y backend y un docker-compose de producción, **para** poder desplegar ConRutina de forma reproducible en local y preparar el despliegue en cloud.

**MoSCoW:** `Should Have` · **Complejidad:** `M` · **Story Points:** 8

**INVEST:**


| Criterio    | Evaluación                                                                      |
| ----------- | ------------------------------------------------------------------------------- |
| Independent | Puede construirse en paralelo con el desarrollo, refinarse en el último sprint. |
| Negotiable  | El proveedor de hosting (Railway, Render, VPS) es negociable.                   |
| Valuable    | Sin stack Docker reproducible no hay despliegue fiable del MVP.                 |
| Estimable   | Dockerfiles + docker-compose.prod: patrón bien conocido.                        |
| Small       | Historia de infraestructura acotada.                                            |
| Testable    | El stack arranca y la aplicación es accesible en el puerto configurado.         |


**Acceptance Criteria (BDD):**

```gherkin
# Scenario 1 — Docker backend
Given existe "backend/Dockerfile" multi-stage
When se construye la imagen
Then arranca el servidor y ejecuta "prisma migrate deploy" antes de escuchar peticiones

# Scenario 2 — Docker frontend
Given existe "frontend/Dockerfile" multi-stage
When se construye la imagen
Then nginx sirve los estáticos y hace proxy_pass /api → servicio api

# Scenario 3 — Stack completo de producción
Given existe "docker-compose.prod.yml"
When se ejecuta "docker compose -f docker-compose.prod.yml up --build -d"
Then los tres servicios arrancan: db, api, web
And la aplicación es accesible en http://localhost
```

---



## 6. Tickets de Trabajo

> Un ticket de base de datos, uno de backend y uno de frontend, con todo el detalle necesario para desarrollarlos de inicio a fin.

Consultar información detallada en el documento: `[docs/product-backlog.md](docs/product-backlog.md)`

---

**Ticket 1 — Base de datos**

### T-03-01 · Instalar Prisma y definir esquema completo (todos los modelos del PRD)

- **User Story:** US-03 — Configurar Prisma ORM con esquema inicial y migraciones
- **Tipo:** Backend — Base de datos
- **Complejidad:** `M` · **Story Points:** 3
- **Sprint:** Sprint 0 · Scaffolding
- **Estado:** ✅ Implementado
- **Metodología:** Implementado siguiendo el [flujo agéntico de SDD (implementación)](README.md#flujo-agéntico) descrito en el README del repositorio.

**Descripción:**

Instalar `prisma` y `@prisma/client`. Crear `backend/prisma/schema.prisma` con el datasource PostgreSQL y todos los modelos del PRD: `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption` con sus campos, relaciones, índices y enums exactamente como se definen en el modelo de datos (sección 3 de este documento y sección 5.1 del PRD).

**Ficheros a crear / modificar:**

- `backend/prisma/schema.prisma` — esquema canónico de la BD
- `backend/prisma/migrations/` — migraciones versionadas (`init`, ampliaciones como `snapshotEmoji`)
- `package.json` — bloque `"prisma": { "schema": "backend/prisma/schema.prisma", "seed": "..." }`

**Alcance / Definición de hecho:**

- `datasource db { provider = "postgresql", url = env("DATABASE_URL") }`.
- Enum `CompletionStatus { pending completed failed }` para `HabitEntry.status`.
- Campos con valores por defecto: `isLocked @default(false)`, `isActive @default(true)`, `totalPointsEarned @default(0)`, `totalPenalties @default(0)`, `snapshotEmoji @default("")`.
- Índices de rendimiento (consultas frecuentes de `GET /api/weeks/current` y cálculo de saldo):
  - `@@index([userId, startDate])` en `Week` — localizar semana del usuario
  - `@@index([weekId])` en `WeekHabit` — cargar hábitos de una semana
  - `@@index([weekHabitId])` en `HabitEntry` — cargar estados diarios
  - `@@index([weekId])` en `RewardRedemption` — sumar puntos canjeados
- `@@unique([weekId, habitId])` en `WeekHabit` — evitar duplicados de hábito en la misma semana.
- `onDelete: Cascade` en relaciones hijas; `Restrict` en `WeekHabit.habit` y `RewardRedemption.reward` para preservar integridad histórica.
- `npx prisma validate` y `npm run db:migrate` pasan sin errores en BD limpia.

**Verificación de modelos (lista de comprobación):**


| Modelo             | Campos clave                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`             | `id`, `email(unique)`, `name?`, `avatarUrl?`, `createdAt`                                                                                       |
| `Week`             | `id`, `userId(FK)`, `startDate`, `endDate`, `isLocked(default:false)`, `totalPointsEarned(default:0)`, `totalPenalties(default:0)`, `createdAt` |
| `Habit`            | `id`, `userId(FK)`, `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive(default:true)`, `createdAt`                                           |
| `WeekHabit`        | `id`, `weekId(FK)`, `habitId(FK)`, `order`, `snapshotName`, `snapshotEmoji`, `snapshotPoints`, `snapshotPenalty`                                |
| `HabitEntry`       | `id`, `weekHabitId(FK)`, `dayIndex(0-6)`, `status(enum)`, `updatedAt`                                                                           |
| `Reward`           | `id`, `userId(FK)`, `emoji`, `name`, `description`, `cost`, `isActive(default:true)`, `createdAt`                                               |
| `RewardRedemption` | `id`, `weekId(FK)`, `rewardId(FK)`, `pointsSpent`, `redeemedAt`                                                                                 |


**Buenas prácticas aplicadas:**

- Migraciones versionadas en Git (`prisma migrate dev` / `migrate deploy`); nunca editar la BD a mano en producción.
- El esquema es la única fuente de verdad; el cliente se regenera con `npm run prisma:generate` tras cada cambio.
- Seed reproducible en `backend/prisma/seed.ts` invocable con `npm run db:seed`.

**Edge cases a tener en cuenta:**

- PostgreSQL reserva el nombre `User`; si hay conflictos, usar `@@map("users")` en el modelo.
- `WeekHabit.habitId` + `weekId` deben ser únicos compuestos para evitar duplicados al heredar hábitos semanalmente.
- Los snapshots (`snapshotName`, `snapshotEmoji`, `snapshotPoints`, `snapshotPenalty`) deben poblarse al crear la semana y congelarse al bloquear; no depender del hábito maestro en semanas históricas.

**Criterios de aceptación clave:**

```gherkin
# Scenario — Migración inicial
Given el repositorio clonado y PostgreSQL activo
When se ejecuta "npm run prisma:generate" y "npm run db:migrate"
Then todas las tablas del PRD existen con sus FK, índices y enums
And "npm run db:seed" inserta usuario demo, hábitos, semana y recompensas sin error
```

---

**Ticket 2 — Backend**

### T-12-01 · Caso de uso: canjear recompensa con validación transaccional de saldo

- **User Story:** US-12 — API: canjear recompensa
- **Tipo:** Backend — Aplicación
- **Complejidad:** `M` · **Story Points:** 3
- **Sprint:** Sprint 2 · Ciclo Semanal y Recompensas API
- **Estado:** ✅ Implementado
- **Metodología:** Implementado siguiendo el [flujo agéntico de SDD (implementación)](README.md#flujo-agéntico) descrito en el README del repositorio.

**Descripción:**

Implementar el caso de uso `redeemReward(userId, weekId, rewardId)` y el endpoint `POST /api/weeks/:weekId/redemptions`. El saldo disponible de la semana se calcula como `sum(completados × snapshotPoints) − sum(fallados × snapshotPenalty) − sum(redemptions.pointsSpent)`. La verificación del saldo y la creación del `RewardRedemption` deben ocurrir en la **misma transacción** para evitar condiciones de carrera.

**Ficheros a crear / modificar:**

- `backend/src/application/redeemReward.ts` — orquestación del caso de uso
- `backend/src/application/calculateWeekAvailableBalance.ts` — cálculo puro del saldo neto
- `backend/src/application/ports/RewardRedemptionRepository.ts` — puerto con método `redeem(...)`
- `backend/src/infrastructure/prismaRewardRedemptionRepository.ts` — implementación transaccional con Prisma
- `backend/src/presentation/http/createApp.ts` — ruta `POST /api/weeks/:weekId/redemptions`
- `backend/src/application/validation/rewardRedemption.ts` — esquema Zod `{ rewardId: number }`
- `backend/src/application/redeemReward.test.ts` — tests unitarios del caso de uso

**Alcance / Definición de hecho:**

- `redeemReward` delega en `redemptionRepo.redeem({ userId, weekId, rewardId, rewardCost })`.
- Dentro de la transacción Prisma:
  1. `SELECT ... FOR UPDATE` sobre la fila `Week` para serializar canjes concurrentes.
  2. Verificar que la semana pertenece al usuario y `isLocked=false`; si no → `409 WEEK_LOCKED` o `404 WEEK_NOT_FOUND`.
  3. Verificar límite de **un canje por semana** (`WEEK_REDEMPTION_LIMIT` si ya existe un canje).
  4. Calcular `available = calculateWeekAvailableBalance(week, redemptionsSpentTotal)`.
  5. Si `available < reward.cost` → `422 INSUFFICIENT_POINTS` con `{ available, required }`.
  6. Crear `RewardRedemption` con `pointsSpent = reward.cost`.
- Endpoint responde `201` con `{ id, weekId, rewardId, pointsSpent, redeemedAt }`.
- Tests unitarios cubren happy path, saldo insuficiente y semana bloqueada.

**Buenas prácticas aplicadas:**

- Clean Architecture: la lógica de negocio vive en `application/`; Prisma solo en `infrastructure/`.
- Cálculo de saldo como función pura testeable (`calculateWeekAvailableBalance`).
- Errores de dominio tipados (`UnprocessableError`, `ConflictError`, `NotFoundError`) mapeados a HTTP en `errorHandler`.
- Validación de entrada con Zod antes de llegar al caso de uso.

**Criterios de aceptación clave:**

```gherkin
# Scenario — Canje exitoso
Given la semana activa tiene 50 pts netos y la recompensa cuesta 30
When POST /api/weeks/:weekId/redemptions con { rewardId }
Then responde 201 con pointsSpent=30
And el saldo disponible pasa a 20

# Scenario — Saldo insuficiente
Given el saldo neto es 10 y la recompensa cuesta 50
When POST /api/weeks/:weekId/redemptions
Then responde 422 { code: "INSUFFICIENT_POINTS", available: 10, required: 50 }

# Scenario — Semana bloqueada
Given la semana tiene isLocked=true
When POST /api/weeks/:weekId/redemptions
Then responde 409 { code: "WEEK_LOCKED" }

# Scenario — Concurrencia
Given dos peticiones simultáneas con saldo exacto para un solo canje
Then solo una responde 201; la otra 422 o 409
```

---

**Ticket 3 — Frontend**

### T-18-02 · Integrar historial: cargar semanas previas desde API

- **User Story:** US-18 — UI: estadísticas y navegación histórica
- **Tipo:** Frontend — Aplicación + Presentación
- **Complejidad:** `M` · **Story Points:** 3
- **Sprint:** Sprint 4 · UI Stats + Historial
- **Estado:** ✅ Implementado
- **Metodología:** Implementado siguiendo el [flujo agéntico de SDD (implementación)](README.md#flujo-agéntico) descrito en el README del repositorio.

**Descripción:**

Modificar `useHabitDashboard` para que, al cambiar `weekOffset` con los controles `‹` / `›`, cargue la semana correspondiente desde la API (`GET /api/weeks?offset=n`) en lugar de reconstruir datos del estado local. Las semanas históricas bloqueadas deben mostrarse en **modo lectura** con estadísticas congeladas (`totalPointsEarned`, `totalPenalties`).

**Ficheros a crear / modificar:**

- `frontend/src/infrastructure/weekApi.ts` — `fetchCurrentWeek()` y `fetchWeekByOffset(offset)`
- `frontend/src/application/mapWeekResponseToDashboard.ts` — mapeo DTO → estado del dashboard
- `frontend/src/application/useHabitDashboard.ts` — handler `handleWeekNav(delta)` con carga remota
- `frontend/src/presentation/components/layout/WeeklyCalendar.tsx` — controles de navegación y badge de semana bloqueada
- `frontend/src/infrastructure/weekApi.test.ts` y `frontend/src/application/useHabitDashboard.test.ts` — tests

**Alcance / Definición de hecho:**

- `weekApi.fetchWeekByOffset(offset)` → `GET /api/weeks?offset=${offset}` (tipado con `WeekResponseDto`).
- `handleWeekNav(delta)`:
  1. Actualiza `weekOffset` de forma optimista.
  2. Activa `weekLoading=true` (skeleton en calendario mientras carga).
  3. Llama a la API y mapea la respuesta con `mapWeekResponseToDashboard`.
  4. Actualiza `habits`, `stats`, `weekIsLocked`, `entryIdsByHabitId`, `pointsRedeemed`.
  5. Usa `weekRequestRef` para ignorar respuestas obsoletas si el usuario navega rápido.
- Si la API responde `404` (no hay semana en ese offset): revierte el offset, pone `canGoBack=false` y deshabilita el botón `‹`.
- En semanas históricas (`weekOffset < 0` o `isLocked=true`): celdas no interactivas, sin botones de añadir/eliminar hábito.
- `handleToggleDay` rechaza interacción si `weekIsLocked` o si el día es futuro en la semana actual.

**Interfaz expuesta al componente:**

```typescript
const {
  weekOffset,      // 0 = actual, -1 = anterior…
  weekLoading,     // true durante fetch de navegación
  canGoBack,       // false si no hay semana anterior
  weekIsLocked,    // true en semanas bloqueadas
  weekIsCurrent,   // weekOffset === 0
  handleWeekNav,   // (delta: -1 | 1) => Promise<void>
  // … habits, stats, weekData, etc.
} = useHabitDashboard()
```

**Buenas prácticas aplicadas:**

- Separación de capas: el hook orquesta; `weekApi` encapsula HTTP; el dominio no conoce fetch.
- Cancelación de peticiones obsoletas con contador `weekRequestRef` (evita race conditions en navegación rápida).
- Mapeo centralizado DTO → dominio en `mapWeekResponseToDashboard` (único punto de transformación).
- Toasts de error con Sonner ante fallos distintos de 404.

**Criterios de aceptación clave:**

```gherkin
# Scenario — Navegación al historial
Given el usuario está en weekOffset=0
When hace clic en "‹"
Then se llama GET /api/weeks?offset=-1
And el calendario muestra hábitos y estados de la semana anterior
And weekIsLocked=true y las celdas no son interactivas

# Scenario — Sin semana anterior
Given GET /api/weeks?offset=-1 responde 404
Then canGoBack=false, el botón "‹" queda deshabilitado
And weekOffset revierte al valor anterior

# Scenario — Volver a semana actual
Given el usuario está en weekOffset=-1
When hace clic en "›" hasta weekOffset=0
Then las celdas vuelven a ser interactivas
And el badge de bloqueo desaparece
```

---



## 7. Pull Requests

> El MVP de ConRutina está **completo e integrado** en la rama `develop`. Las ramas `feature-entrega*-IMV` documentan los hitos de integración por entrega académica.

**Pull Request 1** — Sprint 0–1: scaffolding, BD, APIs core y perfil

[https://github.com/isaacmvimv/AI4Devs-finalproject-IMV/tree/feature-entrega1-IMV](https://github.com/isaacmvimv/AI4Devs-finalproject-IMV/tree/feature-entrega1-IMV)

**Pull Request 2** — Sprint 2: ciclo semanal, bloqueo automático y recompensas API

[https://github.com/isaacmvimv/AI4Devs-finalproject-IMV/tree/feature-entrega2-IMV](https://github.com/isaacmvimv/AI4Devs-finalproject-IMV/tree/feature-entrega2-IMV)

**Pull Request 3** — Sprint 3–5: UI completa, tests, optimización y Docker producción

[https://github.com/isaacmvimv/AI4Devs-finalproject-IMV/tree/finalproject-IMV](https://github.com/isaacmvimv/AI4Devs-finalproject-IMV/tree/finalproject-IMV)