# OpenSpec Tasks — redirección

> **Fase B:** la documentación se dividió para reducir tokens. **No uses este archivo como fuente principal.**

| Necesidad | Documento |
|-----------|-----------|
| Crear/actualizar `tasks.md`, apply, archive | [docs/openspec/tasks-core.md](./openspec/tasks-core.md) |
| Qué pasos aplican (curl/e2e/unit) | [docs/openspec/tasks-by-type.md](./openspec/tasks-by-type.md) |
| Plantillas de informes (solo al reportar) | [docs/openspec/templates/](./openspec/templates/) |
| Referencia histórica completa | [docs/openspec/tasks-full.md](./openspec/tasks-full.md) |

Extraer contexto de un ticket sin leer el backlog completo:

```bash
npm run openspec:extract-ticket -- --ticket T-XX-YY
```
