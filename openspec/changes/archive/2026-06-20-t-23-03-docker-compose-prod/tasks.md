# Tasks — T-23-03 · docker-compose.prod.yml para stack completo de producción

**Ticket:** T-23-03 · **User Story:** US-23 · **Change:** `t-23-03-docker-compose-prod` · **Rama:** `feature/T-23-03-docker-compose-prod`
**Pasos aplicables:** unit=N/A · curl=sí · e2e=sí · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe (local/remoto): `git branch --list "feature/T-23-03-docker-compose-prod"` y `git branch -r --list "origin/feature/T-23-03-docker-compose-prod"`
- [x] 0.3 `git checkout -b feature/T-23-03-docker-compose-prod`
- [x] 0.4 `git branch --show-current`

## 1. Crear docker-compose.prod.yml — servicio db

- [x] 1.1 Crear `docker-compose.prod.yml` en la raíz del monorepo.
- [x] 1.2 Definir servicio `db`: imagen `postgres:16-alpine`, variables `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` desde `.env`.
- [x] 1.3 Montar volumen nombrado `ConRutina_postgres_prod_data` en `/var/lib/postgresql/data`.
- [x] 1.4 Configurar health check `pg_isready -U $$POSTGRES_USER` (interval 5s, timeout 5s, retries 5).
- [x] 1.5 Añadir `restart: unless-stopped`. No exponer puerto `db` al host.

## 2. Crear docker-compose.prod.yml — servicio api

- [x] 2.1 Definir servicio `api` con `build: { context: ., dockerfile: backend/Dockerfile }` e `image: conrutina-api`.
- [x] 2.2 Configurar `depends_on: { db: { condition: service_healthy } }`.
- [x] 2.3 Variables de entorno: `DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`, `API_PORT=3001`, `NODE_ENV=production`, `CORS_ORIGIN=http://localhost`.
- [x] 2.4 Añadir `restart: unless-stopped`. No publicar puerto 3001 al host (acceso vía nginx).

## 3. Crear docker-compose.prod.yml — servicio web

- [x] 3.1 Definir servicio `web` con `build: { context: ., dockerfile: frontend/Dockerfile }` e `image: conrutina-web`.
- [x] 3.2 Configurar `depends_on: [api]`.
- [x] 3.3 Mapear puertos `"80:80"` (o `"${WEB_PORT:-80}:80"` si se documenta variable opcional).
- [x] 3.4 Añadir `restart: unless-stopped`.

## 4. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 4.1 (OBLIGATORIO) Ejecutar `docker compose -f docker-compose.prod.yml up --build -d` desde la raíz y verificar que los tres servicios arrancan.
- [x] 4.2 (OBLIGATORIO) Comprobar `docker compose -f docker-compose.prod.yml ps`: `db` en estado `healthy`, `api` y `web` en `running`.
- [x] 4.3 (OBLIGATORIO) Verificar que `api` no inicia migraciones hasta que `db` está `healthy` (revisar logs: `docker compose -f docker-compose.prod.yml logs api`).
- [x] 4.4 (OBLIGATORIO) Verificar acceso a la SPA: `curl -s -o /dev/null -w "%{http_code}" http://localhost/` devuelve `200`.
- [x] 4.5 Informe en `openspec/changes/t-23-03-docker-compose-prod/reports/YYYY-MM-DD-step-04-verification.md`.

## 5. curl → tasks-core §N+2 + templates/endpoint-testing.md (OBLIGATORIO)

- [x] 5.1 (OBLIGATORIO) Con el stack en marcha, probar proxy nginx → API: `curl -s http://localhost/api/health` → HTTP 200 con `{ "status": "ok" }`.
- [x] 5.2 (OBLIGATORIO) Probar endpoint de negocio vía proxy: `curl -s http://localhost/api/profile` (200 si hay seed en volumen prod; 404 `USER_NOT_FOUND` si BD vacía — ambos confirman proxy operativo).
- [x] 5.3 Informe en `openspec/changes/t-23-03-docker-compose-prod/reports/YYYY-MM-DD-step-05-endpoint-testing.md`.

## 6. E2E → tasks-core §N+3 + templates/e2e-testing.md (OBLIGATORIO)

- [x] 6.1 (OBLIGATORIO) Navegar a `http://localhost` con Playwright MCP; verificar que la SPA ConRutina carga (título, layout base visible).
- [x] 6.2 (OBLIGATORIO) Verificar que no hay errores de red en consola para assets estáticos ni para `GET /api/*` iniciales.
- [x] 6.3 (OBLIGATORIO) Si hay datos (seed previo o creados en prueba), verificar que el dashboard muestra contenido; si BD vacía, verificar estados vacíos sin crash.
- [x] 6.4 Informe en `openspec/changes/t-23-03-docker-compose-prod/reports/YYYY-MM-DD-step-06-e2e-testing.md`.
- [x] 6.5 Detener stack tras pruebas: `docker compose -f docker-compose.prod.yml down` (sin `-v` para conservar volumen prod).

## 7. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 7.1 Actualizar `docs/development_guide.md` con sección "Stack de producción (Docker Compose)": comandos `docker compose -f docker-compose.prod.yml up --build`, `down`, notas sobre volumen `ConRutina_postgres_prod_data`, puerto 80 y variables `POSTGRES_*` / `CORS_ORIGIN`.
- [x] 7.2 Informe en `openspec/changes/t-23-03-docker-compose-prod/reports/YYYY-MM-DD-step-07-docs.md`.

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
