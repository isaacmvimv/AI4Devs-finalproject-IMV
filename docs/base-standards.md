---
description: Reglas mínimas de ConRutina para todos los agentes de IA. Estándares detallados se cargan bajo demanda según el área de trabajo.
alwaysApply: true
---

# Estándares base — ConRutina

## Principios

- Pasos incrementales; un cambio acotado por tarea.
- TDD cuando el ticket lo exija; tipado estricto; nombres claros en inglés en código.
- Documentación en `docs/`: **español**. UI y errores visibles al usuario: **español**. Identificadores de código: **inglés**.

## Git y OpenSpec

- Rama base: `develop`. Trabajo: `feature/[ticket-id]-[ticket-name]`.
- **Sin commits durante** `/opsx:apply`. Commit único (viñetas breves) **solo al archivar**, tras aceptación del usuario: push de la feature + merge a `develop`.
- Un ticket del backlog = un change OpenSpec. Config: `openspec/config.yaml`.

| Fase | Comando | Skill |
|------|---------|-------|
| Especificar desde ticket | `/opsx-propose-ticket T-XX-YY` | `propose-from-ticket` |
| Especificar ad hoc | `/opsx:propose` | `openspec-propose` |
| Explorar | `/opsx:explore` | `openspec-explore` |
| Implementar | `/opsx:apply` | `openspec-apply-change` |
| Archivar | `/opsx:archive` | `openspec-archive-change` |

Índice de tickets: `docs/product-backlog-list.md`. Detalle de ticket: sección en `docs/product-backlog.md` (no cargar el archivo completo salvo necesidad).

## Documentación bajo demanda

Cargar **solo** el documento que corresponda al trabajo actual (no leer todos por defecto):

| Área | Documento |
|------|-----------|
| Backend / API | [backend-standards.md](./backend-standards.md), [api-spec.yml](./api-spec.yml) |
| Frontend / UI | [frontend-standards.md](./frontend-standards.md) |
| Modelo de dominio | [data-model.md](./data-model.md), [prd.md](./prd.md) |
| Entorno local | [development_guide.md](./development_guide.md) |
| Mantener docs | [documentation-standards.md](./documentation-standards.md) |
| Tasks OpenSpec (crear tasks.md) | [openspec/tasks-core.md](./openspec/tasks-core.md), [tasks-by-type.md](./openspec/tasks-by-type.md) |
| Ticket del backlog (propose) | `npm run openspec:extract-ticket -- --ticket T-XX-YY` |

## Skills

- Skills en `.cursor/skills/`. Si la petición encaja, leer y seguir `SKILL.md` antes de improvisar.

## Post-apply (antes de archivar)

Correcciones o alcance nuevo tras `/opsx:apply`: actualizar primero artefactos OpenSpec (`tasks.md`, `design.md`, specs), luego código. No parches solo en código sin actualizar el change.

## Symlinks multiagente

Artefactos canónicos en el repo; rutas `.cursor`/otros agentes por symlink. Verificar symlinks tras mover o renombrar ficheros.
