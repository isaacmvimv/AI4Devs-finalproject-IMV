# Crear comandos de Claude a partir de los comandos de Cursor

## Prompt del usuario

> Quiero que analices los comandos de Cursor que tengo definidos en .cursor/commands y me crees los comandos equivalentes para Claude.
> Los comandos de Claude simplemente deben de referenciar a los de cursor. No se debe de reescribir la lógica, sólo referenciar.

## Análisis previo

Se inspeccionó el directorio `.cursor/commands` del proyecto **ConRutina**, que contiene los siguientes comandos:

- `generate-prd.md` — Genera un PRD completo en español (Lean Canvas, casos de uso, modelo de datos, diseño, C4). Requiere bloque `Context` obligatorio. Referencia la skill `.cursor/skills/generate-prd/SKILL.md`.
- `generate-product-backlog.md` — Genera `docs/ConRutina-Product-Backlog.md` desde el PRD y el código (US, MoSCoW, BDD, roadmap, tickets). Referencia la skill `.cursor/skills/generate-product-backlog/SKILL.md`.
- `opsx-apply.md` — Implementa tareas de un change OpenSpec. Referencia `.cursor/skills/openspec-apply-change/SKILL.md`.
- `opsx-archive.md` — Archiva un change OpenSpec completado. Referencia `.cursor/skills/openspec-archive-change/SKILL.md`.
- `opsx-explore.md` — Modo exploración (pensar requisitos y opciones sin implementar código). Referencia `.cursor/skills/openspec-explore/SKILL.md`.
- `opsx-propose-ticket.md` — Crea un change OpenSpec completo a partir de un ticket `T-XX-YY` del backlog. Referencia `.cursor/skills/propose-from-ticket/SKILL.md`.
- `opsx-propose.md` — Propone un change OpenSpec y genera todos los artefactos en un paso. Referencia `.cursor/skills/openspec-propose/SKILL.md`.

Se comprobó que `.claude/commands` no existía aún en el proyecto.

## Solución implementada

Se crearon 7 ficheros en `ConRutina/.claude/commands/`, uno por cada comando de Cursor, con el mismo nombre de archivo. Cada fichero:

- Mantiene un frontmatter mínimo con el campo `description` tomado del comando original de Cursor.
- En el cuerpo, remite directamente al fichero del comando de Cursor correspondiente (y a la skill que este referencia), indicando que deben seguirse íntegramente sus instrucciones, sin duplicar la lógica.
- Incluye `$ARGUMENTS` para pasar los argumentos/inputs que el usuario aporte al invocar el slash command en Claude Code.

### Ficheros creados

1. `.claude/commands/generate-prd.md`
2. `.claude/commands/generate-product-backlog.md`
3. `.claude/commands/opsx-apply.md`
4. `.claude/commands/opsx-archive.md`
5. `.claude/commands/opsx-explore.md`
6. `.claude/commands/opsx-propose-ticket.md`
7. `.claude/commands/opsx-propose.md`

### Ejemplo de contenido (generate-prd.md)

```markdown
---
description: Genera un PRD completo en español (Lean Canvas, casos de uso, modelo de datos, diseño, C4). Requiere bloque Context obligatorio.
---

Sigue íntegramente las instrucciones definidas en [`.cursor/commands/generate-prd.md`](../../.cursor/commands/generate-prd.md), incluyendo la skill que referencia (`.cursor/skills/generate-prd/SKILL.md`).

Argumentos / Context aportado por el usuario:

$ARGUMENTS
```

El resto de comandos siguen el mismo patrón, ajustando la descripción, la ruta al comando de Cursor y a su skill asociada, y el texto descriptivo de los argumentos esperados (Context, nombre de change, ID de ticket, etc.).

## Resultado

Ahora pueden invocarse en Claude Code los comandos equivalentes:

- `/generate-prd`
- `/generate-product-backlog`
- `/opsx-apply`
- `/opsx-archive`
- `/opsx-explore`
- `/opsx-propose-ticket`
- `/opsx-propose`

Cada uno delega completamente en el comando y la skill correspondientes de Cursor, evitando cualquier duplicación de lógica entre ambos asistentes.
