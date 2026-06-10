---
description: Pasos obligatorios OpenSpec (núcleo) para crear tasks.md, apply y archive
globs:
  - "openspec/**"
  - "docs/openspec/**"
  - ".cursor/commands/opsx-*.md"
  - ".cursor/skills/openspec-*/SKILL.md"
  - ".cursor/skills/propose-from-ticket/SKILL.md"
alwaysApply: false
---

# OpenSpec — tasks-core (núcleo)

Leer `openspec/config.yaml` antes de crear o actualizar `tasks.md`. Detalle por tipo de ticket: [tasks-by-type.md](./tasks-by-type.md). Plantillas de informes: [templates/](./templates/) (solo al generar reports en apply).

## §0 — Rama feature (PRIMER paso, OBLIGATORIO)

- Rama base: `develop`. Rama de trabajo: `feature/[ticket-id]-[ticket-name]` (p. ej. `feature/T-06-01-get-profile`).
- Crear al iniciar `/opsx:apply`, antes del primer cambio de código.
- Validar que no existe (local ni remoto):
  ```bash
  git fetch origin develop
  git branch --list "feature/[ticket-id]-[ticket-name]"
  git branch -r --list "origin/feature/[ticket-id]-[ticket-name]"
  ```
- Acción: `git checkout develop` → `git pull origin develop` → `git checkout -b feature/...` → `git branch --show-current`.
- Todo el código del change **solo** en la rama feature, nunca en `develop`.

## Política de commits

- **Apply:** sin `git commit`. Cambios en working tree para revisión del usuario.
- **Archive:** tras aceptación del usuario y pruebas PASS → commit único (viñetas breves) → push feature → merge a `develop`.

## Secuencia obligatoria (tras tareas de implementación)

| Paso | Contenido | Referencia |
|------|-----------|------------|
| N | Tests unitarios existentes (si hay tests) | [tasks-by-type.md](./tasks-by-type.md) |
| N+1 | Tests unitarios o verificación manual app | [templates/verification.md](./templates/verification.md) |
| N+2 | curl endpoints (backend API) | [templates/endpoint-testing.md](./templates/endpoint-testing.md) |
| N+3 | E2E Playwright MCP (frontend UI) | [templates/e2e-testing.md](./templates/e2e-testing.md) |
| N+4 | Actualizar documentación técnica | `docs/documentation-standards.md` |
| Final | Cierre Git + archive OpenSpec | §Cierre abajo |

**CRÍTICO:** el agente ejecuta todas las pruebas; nunca delegar al usuario. Marcar `[x]` solo tras PASS y crear el informe en `openspec/changes/<change-name>/reports/YYYY-MM-DD-step-NN-<tipo>.md`.

### §N+1 — Verificación (resumen)

- Con Vitest: tests focalizados → suite amplia → informe verification.
- Sin Vitest (estado actual): `npm run dev:api`, `npm run dev`, comprobar `http://localhost:5173`, funcionalidad básica, persistencia si aplica.

### §N+2 — curl (resumen)

- Backend en `http://localhost:3001`. Probar GET/POST/PUT/PATCH/DELETE según aplique.
- Restaurar BD tras CREATE/UPDATE/DELETE. Documentar cada curl en el informe.

### §N+3 — E2E (resumen)

- Playwright MCP: `browser_navigate`, interacciones, snapshots, errores, persistencia, limpieza.

### §N+4 — Documentación

- Actualizar solo lo afectado: `api-spec.yml`, `data-model.md`, standards, `development_guide.md`, `README.md`.

## §Cierre — Git y archivado (solo en `/opsx:archive`)

1. Confirmar `tasks.md` completo e informes PASS.
2. Confirmar aceptación del usuario.
3. Commit único en feature (viñetas).
4. `git push -u origin feature/[ticket-id]-[ticket-name]`
5. Merge a `develop`.
6. `mv` change → `openspec/changes/archive/YYYY-MM-DD-<name>/`
7. `npm run openspec:mark-ticket -- --change <name>` (no bloqueante si falla)

## Estructura de `tasks.md` (patrón por referencia)

No copiar plantillas de informes ni párrafos largos de este doc. Formato:

```markdown
# Tasks — T-XX-YY · <título>

**Ticket:** T-XX-YY · **User Story:** US-XX · **Change:** `t-xx-yy-name` · **Rama:** `feature/T-XX-YY-name`
**Pasos aplicables:** unit=<sí|no|N/A> · curl=<sí|no|N/A> · e2e=<sí|no|N/A> · docs=<sí>

## 0. Setup → tasks-core §0 (OBLIGATORIO)
- [ ] 0.1 git checkout develop && git pull origin develop
- [ ] 0.2 Validar rama no existe (local/remoto)
- [ ] 0.3 git checkout -b feature/T-XX-YY-name
- [ ] 0.4 git branch --show-current

## 1–N. Implementación (solo subtareas del DoD del ticket)
...

## N+1. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)
- [ ] Ejecutar según tasks-by-type; informe en `openspec/changes/<name>/reports/YYYY-MM-DD-step-NN-verification.md`

## N+2. curl → tasks-core §N+2 (OBLIGATORIO si curl=sí; N/A documentado si no)
## N+3. E2E → tasks-core §N+3 (OBLIGATORIO si e2e=sí)
## N+4. Documentación → tasks-core §N+4 (OBLIGATORIO)
## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
```

**Formato:** una línea en blanco entre secciones, no entre cada checkbox.

## Checklist antes de cerrar `tasks.md`

- [ ] Paso 0 primero, con rama `feature/[ticket-id]-[ticket-name]`
- [ ] Línea **Pasos aplicables** presente
- [ ] Pasos obligatorios referencian tasks-core (no plantillas inline)
- [ ] Sin commits intermedios en tareas de implementación
- [ ] Pasos de prueba marcan "(OBLIGATORIO)" y "EL AGENTE DEBE EJECUTAR" cuando aplique
- [ ] Rutas de informes bajo `openspec/changes/<change-name>/reports/`

## Cuándo aplica

- Crear/actualizar `tasks.md` (propose, propose-ticket, continue, ff).
- Implementar con `/opsx:apply` (rama, pruebas, sin commits).
- Archivar con `/opsx:archive` (cierre Git + backlog).

Referencia histórica completa: [tasks-full.md](./tasks-full.md).
