# Infraestructura y arquitectura técnica — HabitHero

Documento orientado a desarrolladores que deben entender el proyecto y añadir funcionalidades. Describe el **stack**, los **componentes de software**, su **relación**, **versiones**, **estructura de carpetas**, **configuración** y **comandos** habituales.

---

## 1. Resumen ejecutivo

**HabitHero** es una aplicación web **SPA (Single Page Application)** escrita en **TypeScript** con **React**. El estado de hábitos y recompensas vive hoy en **memoria del cliente** (`useState` en el componente raíz); la UI **aún no** consume una API propia del proyecto.

Para **persistencia** el repositorio incluye **Prisma ORM** (cliente y CLI **5.x**, alineados con `@prisma/client`) y un esquema **PostgreSQL** en `backend/prisma/schema.prisma`. Un servicio **PostgreSQL 16** (imagen Alpine) se levanta con **`docker-compose.yml`** en la raíz; la cadena de conexión se define con **`DATABASE_URL`** en `.env` (ver [§7](#7-principales-ficheros-de-configuración) y [§12](#12-base-de-datos-prisma-y-docker)).

El empaquetado y el servidor de desarrollo los proporciona **Vite**. Los estilos se basan en **Tailwind CSS v4** (plugin oficial de Vite) y en variables CSS de tema (patrón tipo **shadcn/ui** con **Radix UI** y utilidades como `cn()`).

En `package.json` siguen existiendo scripts para **Vitest/ESLint** que pueden requerir dependencias o configuración adicional no detalladas aquí (ver [§11 Notas y advertencias](#11-notas-y-advertencias)).

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión en proyecto | Propósito |
|------|------------|---------------------|-----------|
| Runtime (navegador) | JavaScript (ES modules) | — | Ejecución en el cliente |
| Lenguaje | TypeScript (sintaxis `.ts`/`.tsx`) | Sin paquete `typescript` en lockfile; `tsconfig` orienta al IDE y al compilador embebido de Vite | Tipado estático y mejor DX |
| UI | React | **18.3.1** (peer; instalado vía npm) | Componentes y estado reactivo |
| Bundler / dev server | Vite | **6.4.2** (`package.json`; lockfile alineado) | Desarrollo con HMR, build a estáticos |
| Plugin React | `@vitejs/plugin-react` | **4.7.0** | Fast Refresh y JSX |
| Estilos | Tailwind CSS | **4.1.12** | Utilidades CSS y diseño responsive |
| Integración Tailwind–Vite | `@tailwindcss/vite` | **4.1.12** | Procesa Tailwind en el pipeline de Vite |
| Animaciones CSS (Tailwind) | `tw-animate-css` | **1.3.8** | Utilidades de animación |
| Iconos (pantalla principal) | `lucide-react` | **0.487.0** | Iconos vectoriales (p. ej. calendario, regalo) |
| Utilidad clases | `clsx` + `tailwind-merge` | **2.1.1** / **3.2.0** | Componer clases y resolver conflictos (`cn()` en UI) |
| Variantes de componentes | `class-variance-authority` | **0.7.1** | Variantes tipadas de estilos (patrón shadcn) |
| Primitivos accesibles (UI kit) | Radix UI (`@radix-ui/react-*`) | Varias **1.x–2.x** (ver `package.json`) | Diálogos, menús, formularios accesibles |
| Componentes Material | MUI (`@mui/material`, `@emotion/*`) | **7.3.5** / **11.14.x** | Disponibles; la pantalla principal no depende de ellos de forma obligatoria |
| Formularios / UX adicionales | `react-hook-form`, `motion`, `recharts`, `react-router`, etc. | Ver `package.json` | Librerías listas para pantallas más complejas; **React Router** está instalado pero **no se usa aún** en `App.tsx` |
| ORM / acceso a datos | **Prisma** (`prisma`, `@prisma/client`) | **^5.13.0** (resolución típica **5.22.x** en lockfile) | Esquema y cliente generado para **PostgreSQL** |
| Base de datos (desarrollo / local) | **PostgreSQL** | **16** (`postgres:16-alpine` en Docker) | Motor al que apunta `DATABASE_URL` del esquema Prisma |

**Versión de la aplicación:** `0.0.1` (`package.json`, campo `version`).

**Node / gestor de paquetes:** el repo incluye `package-lock.json` (npm) y `pnpm-workspace.yaml` (workspace mínimo con el paquete raíz `.`). Puedes usar **npm** o **pnpm** según tu entorno; las versiones concretas de dependencias transitivas están resueltas en el lockfile que uses.

---

## 3. Componentes de software (lógicos)

### 3.1 Contenedor de entrega

| Componente | Descripción |
|------------|-------------|
| **Aplicación cliente (SPA)** | HTML único (`index.html`) + bundle JS/CSS generado por Vite. Toda la lógica de negocio visible está en React. |
| **Servidor de desarrollo Vite** | Sirve módulos ES en caliente durante `npm run dev`. No es un backend de producción. |
| **Artefacto de producción** | Carpeta `dist/` con assets estáticos listos para desplegar en cualquier hosting estático (CDN, S3, Netlify, etc.). |

### 3.2 Módulos dentro del código fuente

| Componente | Ubicación típica | Propósito |
|------------|------------------|-----------|
| **Punto de entrada** | `src/main.tsx` | Monta React en `#root` e importa estilos globales. |
| **Raíz de la app** | `src/app/App.tsx` | Estado global local (hábitos, recompensas, modales, semana), cálculo de estadísticas y composición de vistas. |
| **Componentes de dominio** | `src/app/components/*.tsx` | UI de negocio: cabecera, filas de hábito, calendario semanal, tarjetas de estadísticas/recompensas, modales. |
| **Kit UI reutilizable** | `src/app/components/ui/*` | Primitivos (botones, diálogos, tablas, etc.) alineados con Radix + Tailwind + CVA. |
| **Utilidades UI** | `src/app/components/ui/utils.ts`, `use-mobile.ts` | Helpers (`cn`, detección móvil). |
| **Figma / diseño** | `src/app/components/media_handler/ImageWithFallback.tsx` | Imagen con fallback (útil si se exporta diseño desde Figma). |
| **Estilos globales** | `src/styles/*` | Encadenado: fuentes → Tailwind → tema (variables CSS). |
| **OpenSpec (metodología)** | `openspec/config.yaml` | Configuración para flujo spec-driven con IA (propuestas, tareas); no afecta al runtime de la app. |
| **Capa de datos (Prisma)** | `backend/prisma/schema.prisma` | Define el **datasource** PostgreSQL (`DATABASE_URL`), el **generator** `prisma-client-js` y los modelos de dominio actuales (p. ej. `User`, `Calendar`). El cliente se genera con `prisma generate`. |
| **PostgreSQL (Docker)** | `docker-compose.yml` | Servicio `postgres` con volumen persistente; credenciales y nombre de BD vía variables de entorno (ver [§12](#12-base-de-datos-prisma-y-docker)). |

---

## 4. Relación entre componentes

Flujo de **desarrollo**:

1. El desarrollador ejecuta Vite (`npm run dev`).
2. El navegador carga `index.html`, que ejecuta `src/main.tsx` como módulo ES.
3. `main.tsx` renderiza `<App />`, que importa componentes hijos y estilos ya procesados por Tailwind (vía plugin Vite).

Flujo de **producción**:

1. `npm run build` genera `dist/`.
2. Un servidor web estático sirve `index.html` y los assets con hash; el cliente ejecuta el mismo grafo de React sin Vite.

**Dependencias de datos (UI):** no hay llamadas HTTP en el código de la SPA analizado; el estado de la interfaz es **local** al árbol de React bajo `App`.

**Persistencia preparada:** Prisma + PostgreSQL existen en el repo para cuando exista un proceso (p. ej. backend o scripts) que instancie `PrismaClient` y ejecute migraciones; no forman parte aún del flujo obligatorio de `npm run dev` de la SPA.

```mermaid
flowchart LR
  subgraph dev["Desarrollo"]
    Vite[Vite dev server]
    BrowserDev[Navegador]
    Vite --> BrowserDev
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

  subgraph data["Datos opcional local"]
    PG[(PostgreSQL Docker)]
    Prisma[Prisma schema + client]
    Prisma -.->|DATABASE_URL| PG
  end

  BrowserDev --> Main
  BrowserProd --> Main
```

---

## 5. Propósito de cada pieza (para perfiles junior)

- **React**: Encapsula la interfaz en **componentes** y reacciona a cambios de **estado**. Si añades una funcionalidad, lo habitual es crear un componente o ampliar `App` y pasar **props** o **callbacks**.
- **Vite**: Une todos los archivos en algo que el navegador entiende. En desarrollo recarga rápido (**HMR**). No sustituye un servidor de API.
- **TypeScript**: Ayuda a detectar errores antes de ejecutar. Los interfaces `Habit` y `Reward` en `App.tsx` definen la forma de los datos.
- **Tailwind**: Estilos como clases en `className`. Evita escribir mucho CSS suelto; consulta la doc de Tailwind v4 para nuevas utilidades.
- **Alias `@/`**: En imports, `@/app/...` apunta a `src/app/...` (configurado en `vite.config.ts` y `tsconfig.json`).
- **Radix + carpeta `ui/`**: Si necesitas un modal, select o tooltip accesible, reutiliza primero lo que ya hay en `components/ui` en lugar de inventar desde cero.
- **Prisma**: El archivo `backend/prisma/schema.prisma` describe tablas y tipos; tras cambiar el esquema, regenera el cliente con `prisma generate`. Las migraciones versionan cambios en la BD; en desarrollo suele usarse `prisma migrate dev` (cuando exista carpeta `migrations`).

---

## 6. Estructura de directorios

```
HabitHero_v3/
├── .cursor/                 # Comandos y skills de Cursor (flujo OpenSpec, etc.)
├── backend/
│   └── prisma/
│       └── schema.prisma    # Esquema Prisma (PostgreSQL, modelos)
├── docs/                    # Documentación del proyecto (este archivo)
├── openspec/                # Config OpenSpec (spec-driven)
├── dist/                    # Salida de `vite build` (generada; no editar a mano)
├── node_modules/            # Dependencias instaladas
├── docker-compose.yml       # PostgreSQL 16 para desarrollo local
├── src/
│   ├── main.tsx             # Entrada React
│   ├── app/
│   │   ├── App.tsx          # Vista principal y estado
│   │   └── components/
│   │       ├── *.tsx        # Componentes de pantalla (hábitos, recompensas…)
│   │       ├── media_handler/       # Utilidades ligadas a diseño
│   │       └── ui/          # Biblioteca de primitivos UI
│   └── styles/
│       ├── index.css        # Orquesta imports (@import fonts, tailwind, theme)
│       ├── tailwind.css     # Directivas Tailwind v4 + @source
│       └── theme.css        # Variables CSS (tema)
├── index.html               # HTML shell; raíz #root
├── package.json
├── package-lock.json
├── pnpm-workspace.yaml
├── postcss.config.mjs       # PostCSS (vacío por defecto; Tailwind va por Vite)
├── tsconfig.json
├── vite.config.ts
├── default_shadcn_theme.css # Referencia de tema (raíz)
└── ATTRIBUTIONS.md
```

---

## 7. Principales ficheros de configuración

| Archivo | Rol |
|---------|-----|
| `package.json` | Scripts, dependencias, metadatos del paquete (`type: "module"` → ESM nativo en Node para scripts). |
| `vite.config.ts` | Plugins (`react`, `tailwindcss`), alias `@` → `./src`, `assetsInclude` para `.svg` y `.csv`. |
| `tsconfig.json` | `strict`, `jsx: react-jsx`, paths `@/*`, `moduleResolution: bundler` (pensado para Vite). |
| `postcss.config.mjs` | Placeholder; Tailwind v4 con `@tailwindcss/vite` no requiere aquí `tailwindcss` clásico. |
| `pnpm-workspace.yaml` | Declara el workspace monorepo mínimo (solo el directorio actual). |
| `openspec/config.yaml` | Esquema `spec-driven` y contexto opcional para generación de especificaciones con IA. |
| `index.html` | Punto de entrada HTML; `lang="es"`, título HabitHero. |
| `backend/prisma/schema.prisma` | Esquema Prisma: `generator client`, `datasource db` (`provider = postgresql`, `url = env("DATABASE_URL")`), modelos (`User`, `Calendar`, …). |
| `docker-compose.yml` | Servicio `postgres` (imagen `postgres:16-alpine`), variables `POSTGRES_*`, puerto mapeado y volumen `habithero2_postgres_data`. |
| `.env` (raíz, no versionar secretos) | Debe incluir al menos **`DATABASE_URL`** para Prisma y, para Docker Compose, **`POSTGRES_USER`**, **`POSTGRES_PASSWORD`**; opcionalmente **`POSTGRES_DB`** (por defecto `habithero2`), **`POSTGRES_PORT`**. |

**Ubicación del esquema Prisma:** no está en la ruta por defecto (`prisma/schema.prisma` en la raíz), sino en **`backend/prisma/schema.prisma`**. Desde la raíz del repo, la CLI de Prisma requiere **`--schema=backend/prisma/schema.prisma`** en cada comando, **o** un bloque en `package.json`:

```json
"prisma": {
  "schema": "backend/prisma/schema.prisma"
}
```

Hasta que exista ese bloque (o se unifique la ruta), los scripts `prisma:*` y `db:migrate` de la raíz pueden fallar si no pasan `--schema` (ver [§12](#12-base-de-datos-prisma-y-docker)).

---

## 8. Comandos para inicializar y trabajar con el proyecto

| Comando | Cuándo usarlo |
|---------|----------------|
| `npm install` | Primera vez o tras cambios en `package.json`; instala dependencias (equiv. `pnpm install` si usas pnpm). |
| `npm run dev` | Arranca Vite en modo desarrollo (URL en consola, suele ser `http://localhost:5173`). |
| `npm run build` | Genera producción en `dist/`. |
| `npm run build:dev` | Build en modo `development` de Vite (útil para depurar builds). |
| `npm run preview` | Sirve localmente el contenido de `dist/` tras un build. |
| `npm run lint` | Ejecuta `eslint .` — **requiere** tener ESLint instalado/configurado; hoy no figura en `devDependencies`. |
| `npm run test` / `npm run test:watch` | Ejecutan Vitest — **requieren** `vitest` en el proyecto; hoy no está declarado en `devDependencies`. |
| `npm run docker:up` / `docker:down` / `docker:logs` | Levantan / paran el stack definido en **`docker-compose.yml`** y siguen los logs del contenedor **`postgres`**. Requieren `.env` con credenciales (ver [§12](#12-base-de-datos-prisma-y-docker)). |
| `npm run prisma:init` | Plantilla `npx prisma init` (suele usarse una sola vez al crear un proyecto; aquí el esquema ya vive en `backend/prisma/`). |
| `npm run prisma:generate` | `npx prisma generate` — asegúrate de que Prisma resuelva el esquema (bloque `prisma.schema` en `package.json` o `--schema=backend/prisma/schema.prisma`). |
| `npm run db:migrate` | `prisma migrate deploy` — aplica migraciones en entornos con historial ya creado; en el primer esquema del repo puede que aún no exista carpeta `migrations` hasta que ejecutes `migrate dev`. |

No existe `npm start` en este proyecto; el equivalente habitual en desarrollo es **`npm run dev`**.

---

## 9. Diagramas C4 (Mermaid)

### 9.1 Nivel C1 — Contexto del sistema

Muestra HabitHero en relación con el usuario y el entorno de ejecución.

```mermaid
C4Context
    title Diagrama de contexto (C1) — HabitHero

    Person(usuario, "Usuario", "Gestiona hábitos y recompensas en el navegador")
    System(habithero, "HabitHero", "Aplicación web SPA (React + Vite)")
    System_Ext(browser, "Navegador web", "Ejecuta JavaScript y renderiza la UI")

    Rel(usuario, browser, "Usa")
    Rel(browser, habithero, "Carga y ejecuta")
```

> **Nota:** La sintaxis `C4Context` requiere soporte Mermaid con diagramas C4 (p. ej. Mermaid ≥ 9.4 con `c4` habilitado). Si tu visor solo soporta diagramas clásicos, usa la versión alternativa siguiente.

**Alternativa (flowchart estilo contexto):**

```mermaid
flowchart TB
    User([Usuario])
    Browser[Navegador web]
    App[HabitHero SPA]

    User -->|interactúa| Browser
    Browser -->|descarga y ejecuta| App
```

### 9.2 Nivel C2 — Contenedores

```mermaid
C4Container
    title Diagrama de contenedores (C2) — HabitHero

    Person(usuario, "Usuario", "Usuario final")

    Container_Boundary(spa, "Aplicación HabitHero") {
        Container(ui, "Interfaz React", "TypeScript, React 18", "Pantallas, estado en cliente, Tailwind")
        Container(static_assets, "Assets estáticos", "HTML, JS, CSS", "Servidos en producción")
    }

    System_Ext(vite_dev, "Vite (solo desarrollo)", "Servidor de desarrollo y HMR")
    System_Ext(hosting, "Hosting estático", "CDN / servidor web en producción")
    ContainerDb(db, "PostgreSQL (opcional local)", "Docker / hosting gestionado", "Persistencia vía Prisma cuando exista backend")

    Rel(usuario, ui, "Usa vía navegador")
    Rel(vite_dev, ui, "Sirve módulos en desarrollo")
    Rel(hosting, static_assets, "Sirve en producción")
    Rel(ui, static_assets, "Empaquetado en build")
    Rel(ui, db, "Futuro: API + PrismaClient")
```

**Alternativa (flowchart):**

```mermaid
flowchart TB
    User([Usuario])

    subgraph dev["Entorno desarrollo"]
      Vite[Vite dev server]
    end

    subgraph runtime["Ejecución en navegador"]
      ReactApp[SPA React]
    end

    subgraph prod["Entorno producción"]
      Host[Hosting estático]
      Dist[dist/ HTML+JS+CSS]
    end

    User --> ReactApp
    Vite -->|HMR y módulos ES| ReactApp
    Host --> Dist
    User -->|navega| Dist
    Dist --> ReactApp
```

---

## 10. Guía rápida para añadir funcionalidades (junior)

1. **Localiza el estado:** Casi toda la lógica está en `App.tsx`. Si la app crece, conviene extraer contexto (`React.createContext`), un store ligero o llamadas a API; en la SPA aún no hay cliente HTTP hacia un backend propio (Prisma queda listo a nivel de esquema y BD).
2. **Nuevo componente de pantalla:** Crea un archivo en `src/app/components/`, impórtalo en `App.tsx` y pasa solo las props necesarias.
3. **Reutiliza `ui/`:** Para modales y controles complejos, mira primero `src/app/components/ui/` antes de instalar otra librería.
4. **Estilos:** Prefiere utilidades Tailwind y variables de `theme.css` para mantener coherencia con el kit existente.
5. **Rutas:** `react-router` ya está en dependencias; si añades varias pantallas, configura el router en `main.tsx` o `App.tsx` y divide vistas.
6. **Persistencia:** En la SPA los datos de la sesión se pierden al recargar. El repo ya incluye **Prisma + PostgreSQL** (Docker) para cuando conectes un backend o scripts; hasta entonces puedes seguir usando `localStorage`/IndexedDB en el cliente si necesitas un prototipo rápido.
7. **Pruebas:** Antes de usar `npm run test`, añade `vitest` (y opcionalmente `@testing-library/react`) como `devDependency` y un `vitest.config.ts` si lo necesitas.
8. **OpenSpec:** Si el equipo usa el flujo de especificaciones en `.cursor/skills`, alinea cambios grandes con propuestas/tareas en `openspec/` para mantener trazabilidad.

---

## 11. Notas y advertencias

- **Peer dependencies:** `react` y `react-dom` están como `peerDependencies` con `optional: true` en `package.json`; npm los instala en la práctica (aparecen en `package-lock.json`). Verifica siempre que existan en `node_modules` tras un install limpio.
- **Override pnpm:** El bloque `pnpm.overrides` fija `vite` a **6.3.5**; con **npm** ese bloque no aplica. La versión efectiva con npm es la de `dependencies`/`devDependencies` y el lockfile (**6.4.2**).
- **`src/styles/fonts.css`:** `index.css` lo importa primero; si tu entorno de build exige que el fichero exista y no está en el repo, añade `src/styles/fonts.css` (puede estar vacío o con reglas `@font-face`).
- **Scripts que aún pueden fallar:** `lint` y `test*` dependen de tener ESLint / Vitest configurados en el proyecto. Los comandos **`prisma:*`** y **`db:migrate`** fallarán desde la raíz si Prisma no localiza el esquema: añade el bloque `prisma.schema` en `package.json` (recomendado) o usa siempre `--schema=backend/prisma/schema.prisma` en la CLI.
- **Librerías instaladas no usadas en la vista principal:** Muchas dependencias (MUI, Recharts, react-dnd, etc.) preparan el proyecto para evolucionar; no implican que todas se usen en `App.tsx` hoy.

---

## 12. Base de datos, Prisma y Docker

### 12.1 Esquema Prisma (`backend/prisma/schema.prisma`)

| Pieza | Valor |
|--------|--------|
| **Generator** | `prisma-client-js` |
| **Datasource** | `provider = "postgresql"`, URL desde `env("DATABASE_URL")` |
| **Modelo `User`** | `id` (Int, autoincrement, PK), `email` (único), `name` opcional |
| **Modelo `Calendar`** | Identificador autoincremental; campos de perfil/CV (`firstName`, `lastName`, `email` único, `phone`, `address`, resúmenes en texto, metadatos de fichero CV, `createdAt` / `updatedAt` con `@default(now())` y `@updatedAt`) |

Cualquier cambio en modelos requiere **migración** en la base real y **`npm run prisma:generate`** (o `npx prisma generate` con el esquema correcto) para actualizar el cliente TypeScript.

### 12.2 Docker Compose (PostgreSQL local)

| Variable / clave | Uso |
|------------------|-----|
| `POSTGRES_USER` | Usuario de la instancia (obligatorio en `.env` para `docker compose`) |
| `POSTGRES_PASSWORD` | Contraseña (obligatorio) |
| `POSTGRES_DB` | Nombre de la base; por defecto **`habithero2`** si no se define |
| `POSTGRES_PORT` | Puerto en el host; por defecto **5432** |
| Contenedor | Nombre sugerido: **`habithero2-postgres`** |
| Volumen | **`habithero2_postgres_data`** (persistencia de datos entre reinicios) |

**`DATABASE_URL`** en `.env` debe apuntar al mismo usuario, contraseña, host (p. ej. `localhost`), puerto y base que uses en Docker, con el formato estándar de PostgreSQL, por ejemplo:

`postgresql://USUARIO:CONTRASEÑA@localhost:PUERTO/NOMBRE_BD`

### 12.3 Comandos Prisma típicos (desde la raíz del repo)

Sustituye `…` por el resto de flags que necesites. Si **no** has añadido `prisma.schema` en `package.json`, incluye siempre **`--schema=backend/prisma/schema.prisma`**.

| Objetivo | Comando de referencia |
|----------|------------------------|
| Validar esquema | `npx prisma validate --schema=backend/prisma/schema.prisma` |
| Generar cliente | `npx prisma generate --schema=backend/prisma/schema.prisma` |
| Crear/aplicar migraciones en desarrollo | `npx prisma migrate dev --schema=backend/prisma/schema.prisma` |
| Aplicar migraciones en despliegue (CI/prod) | `npx prisma migrate deploy --schema=backend/prisma/schema.prisma` (equivalente al script `db:migrate` cuando el esquema está bien resuelto) |

Orden habitual en un entorno nuevo: definir `.env` → `docker compose up -d` → `prisma migrate dev` (primera migración) → `prisma generate`.

---

*Documento generado a partir del estado del repositorio. Actualízalo cuando cambien dependencias, aparezca backend o se añadan pipelines CI/CD.*
