---
name: propose-from-ticket
description: >-
  Crea un change OpenSpec (proposal, specs, design, tasks) a partir de un ticket
  T-XX-YY de docs/product-backlog.md. Usar cuando el usuario pida proponer,
  especificar o crear un change para un ticket del backlog, invoque
  /opsx:propose-ticket, propose-from-ticket o indique un ID tipo T-01-01.
license: MIT
compatibility: Requires openspec CLI.
---

# Proponer change OpenSpec desde ticket del backlog

Genera un change completo del esquema **spec-driven** alimentado por el ticket, su User Story, el PRD y el código existente. Tras completar, el usuario puede ejecutar `/opsx:apply`.

## Input

- **Obligatorio:** ID del ticket en formato `T-[US]-[SEQ]` (p. ej. `T-01-01`, `T-13-01`).
- **Opcional:** nombre corto en kebab-case para el change (si no se indica, derivarlo del título del ticket).

Si falta el ticket ID, sugerir el siguiente pendiente según `docs/product-backlog-list.md`.

## Convenciones de nombres

| Concepto | Patrón | Ejemplo |
|----------|--------|---------|
| Change name | `t-[US]-[SEQ]-[short-kebab]` | `t-01-01-init-monorepo` |
| Rama Git (tasks.md Paso 0) | `feature/T-[US]-[SEQ]-[short-kebab]` | `feature/T-01-01-init-monorepo` |

`[short-kebab]`: 2–5 palabras del título del ticket, minúsculas, guiones, sin caracteres especiales.

## Paso 1 — Extraer contexto del ticket

1. Leer `openspec/config.yaml` (context + rules).
2. **Extraer ticket con el script** (no abrir `docs/product-backlog.md` completo):
   ```bash
   npm run openspec:extract-ticket -- --ticket T-[US]-[SEQ]
   ```
   Opcional `--json` para metadatos estructurados (sprint, tipo, change/rama sugeridos). Usar la salida como fuente del ticket + US + Gherkin AC.
3. Si el script falla, fallback: leer solo las secciones `#### T-...` y `### US-...` en `docs/product-backlog.md`.
4. Leer `docs/openspec/tasks-by-type.md` para determinar **Pasos aplicables** (unit/curl/e2e/docs) del futuro `tasks.md`.
5. Leer **un** estándar principal según tipo de ticket (ver matriz en `tasks-by-type.md`; no cargar backend + frontend a la vez salvo full-stack):

   | Tipo / señal | Documentos adicionales |
   |--------------|------------------------|
   | Infra, tooling | `docs/development_guide.md`, `package.json`, estructura raíz |
   | Backend, API | `docs/backend-standards.md`, `docs/api-spec.yml`, `docs/data-model.md`, `backend/` |
   | Frontend, UI | `docs/frontend-standards.md`, `frontend/` |
   | Dominio puro | `docs/data-model.md`, `docs/prd.md`, módulos `domain/` |
   | Cualquiera | `docs/prd.md` (contexto de producto) |

6. **Inspeccionar código existente** — el backlog puede decir greenfield; los artefactos deben reflejar el estado real del repo, no asumir repo vacío.

7. Si el change ya existe en `openspec/changes/`, preguntar si continuar o regenerar.

## Paso 2 — Ejecutar flujo OpenSpec (openspec-propose)

Seguir la skill **`openspec-propose`** (`.cursor/skills/openspec-propose/SKILL.md`) con estos metadatos fijados:

```text
Ticket: T-[US]-[SEQ]
User Story: US-[US]
Sprint: [N] (desde encabezado ### Sprint N en product-backlog)
Change name: t-[US]-[SEQ]-[short-kebab]
Branch: feature/T-[US]-[SEQ]-[short-kebab]
```

Comandos:

```bash
openspec new change "t-[US]-[SEQ]-[short-kebab]"
openspec status --change "t-[US]-[SEQ]-[short-kebab]" --json
```

Para cada artefacto `ready`, en orden de dependencias:

```bash
openspec instructions <artifact-id> --change "<name>" --json
```

Crear artefactos aplicando `context` y `rules` de `config.yaml` **y** el contenido extraído del ticket/US. No copiar bloques `<context>` ni `<rules>` al output.

### Contenido mínimo por artefacto

- **proposal.md:** Ticket + US + sprint; problema/valor; alcance = DoD del ticket; Non-goals; referencia a AC Gherkin de la US.
- **specs/:** Escenarios BDD derivados del DoD y AC; casos happy path y edge del ticket.
- **design.md:** Decisiones técnicas; archivos/rutas concretas; capas según backend/frontend standards; estado actual vs objetivo.
- **tasks.md:** Patrón por referencia de `docs/openspec/tasks-core.md` + matriz `tasks-by-type.md`; línea **Pasos aplicables**; Paso 0 con rama exacta; solo subtareas del DoD + referencias a §N+1..§Cierre (sin plantillas de informes inline); **sin commits** en implementación.

Re-ejecutar `openspec status --change "<name>" --json` tras cada artefacto hasta que todos los `applyRequires` estén `done`.

## Paso 3 — Verificación antes de cerrar

- [ ] Change en `openspec/changes/t-[US]-[SEQ]-[short-kebab]/`
- [ ] proposal, specs, design y tasks existen y referencian T-XX-YY / US-XX
- [ ] tasks.md: Paso 0, línea Pasos aplicables, referencias a tasks-core (no boilerplate masivo); **no** commits en implementación
- [ ] No hay scope creep respecto al ticket

```bash
openspec status --change "t-[US]-[SEQ]-[short-kebab]"
```

## Output al usuario

Resumir:

- Ticket, US, sprint, change name, rama prevista
- Artefactos creados (breve descripción cada uno)
- Mensaje: **Listo para implementar** → `/opsx:apply t-[US]-[SEQ]-[short-kebab]`

## Guardrails

- **Un ticket = un change.** No mezclar varios tickets en un solo change.
- **Orden de sprint:** si el usuario no indica ticket, sugerir el siguiente pendiente del sprint actual según backlog.
- **No implementar código** en esta skill; solo artefactos OpenSpec.
- **No crear más de un change de golpe** salvo petición explícita; procesar de uno en uno.
- Preferir decisiones razonables sobre bloquear por ambigüedades menores; preguntar solo si falta contexto crítico.

## Ejemplos de invocación

```
/opsx:propose-ticket T-01-01
```

```
/opsx:propose-ticket T-13-01 habit-domain-types
```

```
Crea el change OpenSpec para el ticket T-06-02 del Sprint 1
```
