# Proposal — T-23-03 · docker-compose.prod.yml para stack completo de producción

**Ticket:** T-23-03 · **User Story:** US-23 · **Sprint:** 5 — Calidad, NFR y Lanzamiento

## Why

ConRutina ya dispone de Dockerfiles de producción para backend (T-23-01) y frontend con nginx (T-23-02). Sin un `docker-compose.prod.yml` que orqueste `db`, `api` y `web` en una red compartida, no es posible levantar el stack completo de forma reproducible, validar el proxy `/api` de nginx hacia el servicio `api`, ni comprobar que la aplicación es accesible en el puerto 80 (requisito de US-23 Scenario 3). Este ticket cierra el gap entre imágenes aisladas y despliegue integrado previo al pipeline CI/CD (T-23-04).

## What Changes

- Crear `docker-compose.prod.yml` en la raíz del monorepo con tres servicios: `db`, `api`, `web`.
- Servicio `db`: PostgreSQL 16 Alpine, volumen persistente dedicado a producción, health check con `pg_isready`.
- Servicio `api`: imagen `conrutina-api` (build desde `backend/Dockerfile`), variables de entorno de producción (`DATABASE_URL` apuntando al hostname `db`, `NODE_ENV=production`), `depends_on` con `condition: service_healthy` sobre `db`.
- Servicio `web`: imagen `conrutina-web` (build desde `frontend/Dockerfile`), mapeo `80:80`, `depends_on: api`.
- Red Docker Compose por defecto para que el hostname `api` resuelva desde nginx (ya configurado en `frontend/nginx.conf`).
- Documentar en `docs/development_guide.md` el flujo de build + arranque del stack de producción.

## Capabilities

### New Capabilities

- `docker-compose-prod`: Orquestación del stack completo de producción (PostgreSQL + API Express + nginx) con health checks, dependencias ordenadas y acceso en puerto 80.

### Modified Capabilities

_(ninguna)_

## Non-goals

- No se crea ni modifica el pipeline de GitHub Actions (T-23-04).
- No se modifican `backend/Dockerfile`, `frontend/Dockerfile` ni `frontend/nginx.conf` (ya implementados en T-23-01 y T-23-02).
- No se altera `docker-compose.yml` de desarrollo ni los scripts `db:up` / `db:down`.
- No se implementa HTTPS/TLS, reverse proxy externo ni certificados.
- No se añade seed automático de datos en producción (las migraciones Prisma sí se ejecutan vía entrypoint del contenedor `api`).
- No se exponen puertos de `db` ni `api` al host salvo el 80 de `web` (el acceso a la API es vía proxy nginx).

## Impact

- **Archivo nuevo:** `docker-compose.prod.yml`.
- **Dependencias previas:** T-23-01 (`backend/Dockerfile`, imagen `conrutina-api`), T-23-02 (`frontend/Dockerfile`, `frontend/nginx.conf`, imagen `conrutina-web`).
- **Variables de entorno:** reutiliza `POSTGRES_*` desde `.env`; `DATABASE_URL` del servicio `api` se construye con hostname `db` (no `localhost`).
- **Documentación:** nueva sección en `docs/development_guide.md` con comandos `docker compose -f docker-compose.prod.yml up --build`.

## Acceptance Criteria (referencia)

Derivados del Gherkin de US-23, Scenario 3:

```gherkin
Given existe "docker-compose.prod.yml"
When se ejecuta "docker compose -f docker-compose.prod.yml up"
Then los tres servicios arrancan: db (PostgreSQL), api (Express), web (nginx)
And "api" espera a que "db" esté healthy antes de arrancar
And la aplicación es accesible en el puerto 80
```
