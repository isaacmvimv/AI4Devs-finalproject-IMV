# Diseño técnico — T-01-01 · Inicializar repositorio Git con estructura monorepo

**Ticket:** T-01-01 · **US:** US-01 · **Sprint:** 0

## Context

ConRutina ya es un repositorio Git con código funcional parcial: existen `frontend/` (React + Vite), `backend/` (Express + Prisma), `LICENSE`, `README.md`, `.gitignore`, `pnpm-workspace.yaml` y un `package.json` raíz con scripts `build`, `test`, `lint` y `dev:api`. El backlog describe un escenario greenfield, pero la implementación debe **completar y alinear** lo existente con el DoD de T-01-01, no reescribir el proyecto desde cero.

**Brecha principal:** `npm run dev` ejecuta solo `vite` (frontend). El ticket exige arranque concurrente frontend + backend. La guía de desarrollo actual (`docs/development_guide.md`) documenta dos terminales (`dev:api` + `dev`), lo que contradice el happy path del ticket.

**Restricciones:**
- Monorepo npm/pnpm en raíz única (no workspaces separados con `package.json` por paquete en esta fase).
- Identificadores de código en inglés; documentación en español.
- Rama de trabajo: `feature/T-01-01-init-monorepo` desde `develop`.

## Goals / Non-Goals

**Goals:**

- Cumplir el DoD de T-01-01 verificando o ajustando artefactos de raíz.
- Unificar el happy path en `npm run dev` → frontend (5173) + backend (3001).
- Mantener scripts `build`, `test`, `lint` operativos desde la raíz.
- Documentar el flujo de un solo comando en `README.md`.

**Non-Goals:**

- TypeScript estricto y paths (`T-01-02`).
- ESLint/Prettier/`.editorconfig` (`T-01-03`).
- `.env.example` y validación de variables (`T-01-04`).
- Cambios en capas de dominio, API o UI.
- Migración a workspaces npm/pnpm con `package.json` independientes por paquete.

## Decisions

### 1. Arranque concurrente con `concurrently`

**Decisión:** Añadir `concurrently` como `devDependency` y definir:

```json
"dev": "concurrently -n web,api -c blue,green \"vite\" \"tsx watch backend/src/main.ts\""
```

**Alternativas consideradas:**

| Opción | Pros | Contras |
|--------|------|---------|
| `concurrently` | Estándar en monorepos npm; prefijos de log por proceso; usado en el backlog | Dependencia adicional |
| `npm-run-all --parallel` | Sin binario extra si ya está instalado | No está en el proyecto; menos legible en logs |
| Script Node custom | Sin dependencias | Más código de mantenimiento; fuera de alcance infra mínima |

**Rationale:** El ticket y el backlog mencionan explícitamente `concurrently`. Reutilizar el script existente `dev:api` como subcomando mantiene compatibilidad con quien prefiera una sola terminal por servicio.

### 2. Conservar `dev:api` como script auxiliar

**Decisión:** Mantener `dev:api` sin cambios para depuración aislada del backend.

**Rationale:** No rompe flujos documentados ni depuración; `dev` se convierte en el comando canónico del happy path.

### 3. Workspace pnpm mínimo

**Decisión:** Mantener `pnpm-workspace.yaml` actual:

```yaml
packages:
  - '.'
```

**Rationale:** Cumple el DoD; el monorepo usa un único `package.json` raíz. No introducir paquetes `frontend`/`backend` separados hasta que un ticket lo requiera.

### 4. `.gitignore` — validar, no reescribir

**Decisión:** Auditar que `.gitignore` cubra los patrones del DoD. El fichero actual ya incluye `node_modules/`, `dist/`, `.env`, `coverage/`, `*.local`. Solo añadir entradas si falta algún patrón obligatorio.

### 5. `build` en la raíz

**Decisión:** Mantener `build` como `vite build` (artefacto frontend). No añadir compilación TypeScript del backend en este ticket.

**Rationale:** El DoD exige que el script exista y sea ejecutable, no un pipeline de build multi-paquete. La compilación del backend se abordará en tickets de infra posteriores si aplica.

### 6. README y development_guide

**Decisión:** Actualizar `README.md` para reflejar `npm run dev` unificado. Ajustar `docs/development_guide.md` en el paso de documentación obligatorio para eliminar la contradicción de dos terminales como flujo principal.

## Estado actual vs objetivo

| Elemento | Estado actual | Objetivo T-01-01 |
|----------|---------------|------------------|
| `frontend/`, `backend/` | Presentes | Validar |
| `LICENSE` (MIT) | Presente | Validar |
| `.gitignore` | Completo según DoD | Validar |
| `pnpm-workspace.yaml` | Presente | Validar |
| `package.json` scripts | `dev` solo Vite | `dev` concurrente |
| `README.md` | Secciones OK; `dev` parcial | Documentar arranque unificado |
| Git | Repo inicializado | No requerir `git init` de nuevo |

## Archivos afectados

| Ruta | Acción |
|------|--------|
| `package.json` | Añadir `concurrently`; actualizar script `dev` |
| `README.md` | Sección uso/arranque con un solo comando |
| `docs/development_guide.md` | Alinear sección 7 con `npm run dev` |
| `.gitignore` | Revisión (cambio mínimo o ninguno) |
| `pnpm-workspace.yaml` | Sin cambio esperado |
| `LICENSE` | Sin cambio esperado |

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| `npm run dev` falla si falta `.env` o PostgreSQL | Documentar prerequisitos; validación de `.env` queda en T-01-04; para verificación manual usar `.env` local y Docker si aplica |
| Logs mezclados de Vite y API | Prefijos `-n web,api` y colores en `concurrently` |
| Puerto 5173 o 3001 ocupado | Vite y Express emiten error estándar; verificar en pruebas manuales el edge case |
| `concurrently` añade dependencia | Solo devDependency; alineado con backlog |

## Migration Plan

1. Crear rama `feature/T-01-01-init-monorepo` desde `develop`.
2. Instalar `concurrently` y actualizar script `dev`.
3. Actualizar documentación.
4. Verificar: `npm install` → `npm run dev` → comprobar puertos 5173 y 3001.
5. Al archivar (usuario acepta): commit único + merge a `develop`.

**Rollback:** Descartar cambios en working tree o revertir merge en `develop` si ya se integró.

## Open Questions

- Ninguna bloqueante. El gestor de paquetes puede seguir siendo npm (existe `package-lock.json`) aunque exista `pnpm-workspace.yaml`; no es alcance de este ticket imponer pnpm.
