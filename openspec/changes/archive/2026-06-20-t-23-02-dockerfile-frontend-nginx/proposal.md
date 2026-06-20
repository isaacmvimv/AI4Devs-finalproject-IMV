# Proposal — T-23-02 · Dockerfile multi-stage para el frontend (nginx)

**Ticket:** T-23-02 · **User Story:** US-23 · **Sprint:** 5

## Why

ConRutina ya dispone de un Dockerfile de producción para el backend (T-23-01). Para completar el stack de despliegue reproducible descrito en US-23, falta empaquetar el frontend Vite/React como imagen Docker que sirva los estáticos de producción y reenvíe las peticiones `/api` al servicio backend. Sin este artefacto no es posible orquestar el servicio `web` en `docker-compose.prod.yml` (T-23-03) ni validar el build frontend en el pipeline CI/CD (T-23-04).

## What Changes

- Crear `frontend/Dockerfile` multi-stage: stage `builder` (instala deps y ejecuta `npm run build`) y stage `runner` (`nginx:alpine` sirve `frontend/dist/`).
- Crear `frontend/nginx.conf` con `try_files` para rutas SPA y `proxy_pass` de `/api` hacia `http://api:3001`.
- Añadir `frontend/.dockerignore` para excluir artefactos locales innecesarios del contexto de build.
- Documentar el comando de build en `docs/development_guide.md`.

## Capabilities

### New Capabilities

- `docker-frontend-build`: Dockerfile multi-stage y configuración nginx para servir el bundle Vite y hacer proxy de la API en producción.

### Modified Capabilities

_(ninguna)_

## Non-goals

- No se crea ni modifica `docker-compose.prod.yml` (T-23-03).
- No se configura el pipeline de GitHub Actions (T-23-04).
- No se modifica el `docker-compose.yml` de desarrollo ni el proxy de Vite en `vite.config.ts`.
- No se implementa HTTPS/TLS ni certificados en nginx.
- No se cambia la lógica de la SPA ni los clientes HTTP del frontend.

## Impact

- **Archivos nuevos:** `frontend/Dockerfile`, `frontend/nginx.conf`, `frontend/.dockerignore`.
- **Dependencias:** ninguna npm nueva; imagen base `nginx:alpine` en el stage runner.
- **Documentación:** sección de build Docker del frontend en `docs/development_guide.md`.
- **Dependencia previa:** T-23-01 (backend Dockerfile) ya implementado; el hostname `api` en `proxy_pass` asume la red de Docker Compose de producción (T-23-03).

## Acceptance Criteria (referencia)

Derivados del Gherkin de US-23, Scenario 2:

```gherkin
Given existe "frontend/Dockerfile" multi-stage
When se construye la imagen
Then el stage builder genera el bundle con "vite build"
And el stage runner sirve los archivos estáticos con nginx:alpine
And el nginx tiene configurado proxy_pass /api → servicio api
```
