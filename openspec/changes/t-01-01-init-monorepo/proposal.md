# T-01-01 · Inicializar repositorio Git con estructura monorepo

**Ticket:** T-01-01  
**User Story:** US-01 — Configurar repositorio, herramientas de desarrollo y estructura del proyecto  
**Sprint:** 0 — Scaffolding e Infraestructura

## Why

ConRutina necesita una base de monorepo reproducible para que cualquier desarrollador pueda clonar el proyecto, instalar dependencias y arrancar frontend y backend en minutos. Aunque el repositorio ya contiene código y configuración parcial, el ticket T-01-01 formaliza y completa los cimientos (Git, estructura de directorios, scripts raíz, documentación mínima y workspace) que el resto de tickets del Sprint 0 y US-01 asumen como punto de partida.

## What Changes

- Verificar y completar la estructura monorepo: directorios `frontend/` y `backend/` en la raíz.
- Asegurar `.gitignore` con exclusiones obligatorias: `node_modules/`, `dist/`, `.env`, `coverage/`, `*.local`.
- Configurar `package.json` raíz con scripts `dev` (arranque simultáneo frontend + backend), `build`, `test` y `lint`.
- Mantener o actualizar `README.md` con secciones: descripción, requisitos, instalación y arranque.
- Confirmar `pnpm-workspace.yaml` (o equivalente) para el workspace del monorepo.
- Conservar `LICENSE` (MIT) en la raíz.
- Alinear el script `dev` para que el happy path `git clone → npm install → npm run dev` levante ambos servicios; si un puerto está ocupado, el error debe ser explícito (edge case del ticket).

**Estado actual detectado en el repo:** existen `frontend/`, `backend/`, `LICENSE`, `README.md`, `.gitignore`, `pnpm-workspace.yaml` y `package.json`, pero `npm run dev` solo arranca Vite (frontend); falta el arranque concurrente del backend exigido por el DoD.

## Capabilities

### New Capabilities

- `monorepo-scaffold`: Estructura Git, directorios, `.gitignore`, workspace, scripts raíz y documentación mínima para desarrollo local del monorepo ConRutina.

### Modified Capabilities

- _(ninguna — no hay specs previas en `openspec/specs/`)_

## Impact

| Área | Alcance |
|------|---------|
| Raíz del repo | `package.json`, `.gitignore`, `README.md`, `pnpm-workspace.yaml`, `LICENSE` |
| Estructura | `frontend/`, `backend/` (ya presentes; validar convención) |
| Dependencias | Posible adición de `concurrently` (o equivalente) para script `dev` |
| Documentación | `README.md`, referencia cruzada con `docs/development_guide.md` |
| Fuera de alcance | TypeScript estricto (T-01-02), ESLint/Prettier (T-01-03), `.env.example` (T-01-04) |

## Criterios de aceptación (US-01 — Gherkin relevantes para este ticket)

Los escenarios BDD de US-01 que este ticket debe satisfacer o preparar:

1. **Happy path setup limpio** — `npm install` sin errores; `npm run dev` arranca frontend y backend simultáneamente.
2. **Estructura de proyecto** — existen `frontend/`, `backend/`, `package.json` con scripts `dev`, `build`, `test`, `lint`, y `.gitignore` que excluye `node_modules`, `dist`, `.env`.
3. **Edge case puertos ocupados** — fallo con mensaje claro, no silencioso.

Los escenarios de linting (escenario 3) y `.env` faltante (escenario 4) corresponden a tickets posteriores (T-01-03, T-01-04) y no forman parte del DoD de T-01-01.

## Non-goals

- Configurar TypeScript (`tsconfig.json`, paths, referencias) — ticket T-01-02.
- Instalar o configurar ESLint, Prettier o `.editorconfig` — ticket T-01-03.
- Crear `.env.example` ni validación de variables de entorno — ticket T-01-04.
- Docker Compose, Prisma, migraciones o lógica de negocio.
- Reestructurar capas internas de `frontend/` o `backend/` más allá de confirmar que existen como subproyectos del monorepo.
