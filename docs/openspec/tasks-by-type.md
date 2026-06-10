# OpenSpec — pasos obligatorios por tipo de ticket

Usar junto con [tasks-core.md](./tasks-core.md) al generar `tasks.md`. La línea **Pasos aplicables** del encabezado debe reflejar esta tabla.

## Matriz de aplicabilidad

| Tipo (campo **Tipo:** del ticket) | unit (N) | N+1 verificación | N+2 curl | N+3 E2E | N+4 docs |
|-----------------------------------|----------|------------------|----------|---------|----------|
| Infra / tooling / monorepo | si existen | sí (arranque/scripts) | N/A | N/A | sí si cambia setup |
| Backend — Dominio / Aplicación | si existen | sí | N/A* | N/A | sí si API/modelo |
| Backend — Presentación HTTP | si existen | sí | **sí** | N/A | sí (`api-spec.yml`) |
| Frontend — Arquitectura / UI | si existen | sí (dev + build) | N/A** | **sí** | sí (`frontend-standards`) |
| Frontend — Dominio puro | si existen | sí (typecheck) | N/A | N/A | según impacto |
| Full-stack (backend + frontend) | si existen | sí | **sí** | **sí** | sí |

\* curl N/A si el ticket no toca endpoints (solo dominio interno); documentar N/A en el paso N+2.
\** curl opcional como smoke (`GET /api/profile`) si hay integración existente; marcar N/A si no altera API.

## Señales en el ticket

- **curl = sí:** tipo contiene "Presentación HTTP", "Endpoint", "API", o DoD menciona `curl`/rutas `/api/`.
- **e2e = sí:** tipo contiene "Frontend", "UI", o DoD menciona navegador, layout, componentes visibles, flujos de usuario.
- **unit = sí:** existen tests Vitest en el módulo afectado o el DoD pide tests unitarios.
- **docs = sí:** casi siempre; marcar qué ficheros (`api-spec.yml`, `data-model.md`, etc.) en subtareas concretas.

## Subtareas mínimas por paso (en tasks.md)

### N — Tests unitarios (si existen)
- Revisar/actualizar tests del módulo afectado.
- Cubrir happy path y edge del DoD.

### N+1 — Verificación
- Con tests: `npm test` focalizado + suite relevante.
- Sin tests: `npm run dev:api`, `npm run dev` (o `dev:web`), comprobar compilación y UI básica según alcance del ticket.
- Informe: `templates/verification.md`.

### N+2 — curl (backend API)
- `npm run dev:api`, PostgreSQL activo.
- Probar endpoints nuevos/modificados + casos de error.
- Restaurar BD tras mutaciones.
- Informe: `templates/endpoint-testing.md`.
- Si N/A: una subtarea documentando por qué (p. ej. "ticket solo dominio, sin HTTP").

### N+3 — E2E (frontend)
- Servidor frontend activo; Playwright MCP.
- Flujo del DoD de punta a punta + errores de validación si hay formularios.
- Informe: `templates/e2e-testing.md`.

### N+4 — Documentación
- Solo ficheros impactados (ver checklist en tasks-core §N+4).

## Lectura de estándares al proponer (propose)

| Tipo | Leer |
|------|------|
| Backend | `backend-standards.md` + `api-spec.yml` si HTTP + `data-model.md` si Prisma |
| Frontend | `frontend-standards.md` |
| Infra | `development_guide.md`, `package.json` |
| Dominio | `data-model.md`, sección US en PRD si hace falta |

No cargar backend-standards y frontend-standards a la vez salvo ticket explícitamente full-stack.
