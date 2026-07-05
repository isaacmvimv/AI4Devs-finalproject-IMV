# Design — T-23-03 · docker-compose.prod.yml para stack completo de producción

**Ticket:** T-23-03 · **User Story:** US-23 · **Sprint:** 5

## Context

Estado actual del repositorio:

- `docker-compose.yml` (desarrollo): solo servicio `db` (PostgreSQL 16 Alpine) con volumen `ConRutina_postgres_data`, health check y variables desde `.env`.
- `backend/Dockerfile` (T-23-01): imagen `conrutina-api`, entrypoint con `prisma migrate deploy` + `node backend/dist/main.js`, expone 3001.
- `frontend/Dockerfile` + `frontend/nginx.conf` (T-23-02): imagen `conrutina-web`, nginx en puerto 80, `proxy_pass` de `/api/` hacia `http://api:3001`.
- No existe `docker-compose.prod.yml`.

El hostname `api` en `nginx.conf` solo resuelve dentro de una red Docker donde exista un servicio con ese nombre. Este ticket crea esa red y el orden de arranque correcto.

## Goals / Non-Goals

**Goals:**

- Fichero `docker-compose.prod.yml` con servicios `db`, `api`, `web` funcionales con un solo comando.
- `api` espera a `db` healthy antes de ejecutar migraciones.
- `web` publica puerto 80 y proxy `/api` operativo hacia `api`.
- Stack verificable con `curl` y navegador en `http://localhost`.

**Non-Goals:**

- Pipeline CI/CD (T-23-04).
- Modificar Dockerfiles existentes.
- HTTPS, Traefik, Kubernetes ni despliegue en cloud.
- Seed de datos de demo en producción.
- Scripts npm adicionales (opcional futuro; no requerido por DoD).

## Decisions

### D1 — Fichero separado `docker-compose.prod.yml` (no extender el de desarrollo)

**Elección:** Nuevo fichero en la raíz, independiente de `docker-compose.yml`.
**Alternativa descartada:** Añadir perfiles (`profiles: [prod]`) al compose de desarrollo.
**Razón:** El compose de desarrollo solo levanta `db`; mezclar prod añadiría complejidad y riesgo de confusión. El ticket pide explícitamente `docker compose -f docker-compose.prod.yml up`.

### D2 — Volumen de producción separado del de desarrollo

**Elección:** Volumen nombrado `ConRutina_postgres_prod_data` (distinto de `ConRutina_postgres_data`).
**Alternativa descartada:** Reutilizar el mismo volumen de desarrollo.
**Razón:** Evita mezclar datos de dev/test con el stack de prod local; `docker compose down` del dev no afecta al stack prod.

### D3 — Build + image en servicios `api` y `web`

**Elección:** Cada servicio declara `build` (Dockerfile + context `.`) e `image` (`conrutina-api` / `conrutina-web`).
**Alternativa descartada:** Solo `image:` sin build, exigiendo build manual previo.
**Razón:** `docker compose up --build` cumple el DoD en un solo paso; las etiquetas coinciden con T-23-01/T-23-02 (minúsculas por restricción Docker).

```yaml
api:
  build:
    context: .
    dockerfile: backend/Dockerfile
  image: conrutina-api
```

### D4 — DATABASE_URL con hostname `db` vía interpolación Compose

**Elección:** En el servicio `api`, definir:
```yaml
DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```
**Alternativa descartada:** Copiar literal de `.env` con `localhost`.
**Razón:** Dentro del contenedor `api`, PostgreSQL no está en `localhost` sino en el servicio `db`. La interpolación mantiene coherencia con `POSTGRES_*` del `.env`.

### D5 — depends_on con condition service_healthy solo en api → db

**Elección:**
```yaml
api:
  depends_on:
    db:
      condition: service_healthy
web:
  depends_on:
    - api
```
**Alternativa descartada:** `condition: service_healthy` también en `web → api` (requeriría healthcheck en api).
**Razón:** El DoD del ticket exige explícitamente `service_healthy` para `api → db`. Para `web → api`, basta `depends_on: api` (orden de creación); el entrypoint de api ya bloquea hasta migraciones completas. Healthcheck de api queda fuera de alcance (mencionado como futuro en T-23-01).

### D6 — Sin exposición de puertos db ni api al host

**Elección:** Solo `web` publica `80:80`. `db` y `api` son accesibles solo en la red interna Compose.
**Alternativa descartada:** Exponer `3001:3001` para debug.
**Razón:** En producción el acceso es vía nginx; reduce superficie de ataque y refleja el despliegue real. Debug puede hacerse con `docker compose exec`.

### D7 — Variables de entorno del servicio api

**Elección:**
| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}` |
| `API_PORT` | `3001` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `http://localhost` |

**Razón:** `CORS_ORIGIN` debe coincidir con el origen del navegador al acceder por puerto 80. `NODE_ENV=production` activa comportamiento de producción en error handler (sin stack traces).

### D8 — Health check de db (réplica del compose de desarrollo)

**Elección:** Mismo patrón que `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]
  interval: 5s
  timeout: 5s
  retries: 5
```
**Razón:** Patrón probado en T-02-01; `$$` escapa la variable para el shell del contenedor.

### D9 — restart policy

**Elección:** `restart: unless-stopped` en los tres servicios.
**Razón:** Comportamiento esperado en despliegue local de producción; coherente con el servicio `db` de desarrollo.

## Risks / Trade-offs

- **[Arranque en frío lento]** → Primera ejecución construye dos imágenes multi-stage (~3–5 min). Mitigación: documentar `--build` solo cuando cambie código; reutilizar imágenes cacheadas.
- **[Sin seed en prod]** → Dashboard vacío tras primer arranque (solo migraciones). Mitigación: aceptable para MVP; el usuario puede ejecutar seed manualmente o usar datos vía API.
- **[Puerto 80 ocupado]** → `docker compose up` falla si otro proceso usa :80. Mitigación: documentar en troubleshooting; variable opcional `WEB_PORT` para mapeo alternativo.
- **[CORS en despliegue real]** → `http://localhost` solo válido para prueba local. Mitigación: en hosting real se ajustará `CORS_ORIGIN` (fuera de alcance; T-23-04 o despliegue manual).

## Migration Plan

1. Crear `docker-compose.prod.yml` con servicios, volúmenes y variables según decisiones D1–D9.
2. Verificar: `docker compose -f docker-compose.prod.yml up --build -d`.
3. Smoke: `curl http://localhost/api/health`, `curl http://localhost/api/profile` (404 sin seed es válido; 200 si hay seed previo en volumen).
4. E2E: navegador en `http://localhost` — SPA carga, sin errores de red en consola.
5. Documentar en `development_guide.md`.
6. Detener: `docker compose -f docker-compose.prod.yml down` (conservar volumen prod).

## Open Questions

_(ninguna — dependencias T-23-01 y T-23-02 ya implementadas)_
