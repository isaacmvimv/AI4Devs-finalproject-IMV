# Spec — docker-compose-prod

**Ticket:** T-23-03 · **User Story:** US-23

## ADDED Requirements

### Requirement: Stack de producción con tres servicios orquestados

El repositorio SHALL incluir un fichero `docker-compose.prod.yml` en la raíz que defina los servicios `db`, `api` y `web`, compartiendo la red por defecto de Docker Compose para que el proxy nginx del servicio `web` pueda alcanzar el hostname `api`.

#### Scenario: US-23 Scenario 3 — Arranque del stack completo

- **WHEN** el desarrollador ejecuta `docker compose -f docker-compose.prod.yml up --build` desde la raíz del monorepo
- **THEN** los tres servicios `db`, `api` y `web` arrancan sin error
- **AND** `docker compose -f docker-compose.prod.yml ps` muestra los tres servicios en estado `running`
- **AND** la aplicación es accesible en `http://localhost:80`

#### Scenario: DoD T-23-03 — Fichero compose en la raíz

- **WHEN** se inspecciona el repositorio
- **THEN** existe `docker-compose.prod.yml` en la raíz del monorepo
- **AND** declara exactamente los servicios `db`, `api` y `web`

### Requirement: Servicio db con PostgreSQL 16, volumen y health check

El servicio `db` SHALL usar la imagen `postgres:16-alpine`, montar un volumen nombrado persistente para `/var/lib/postgresql/data`, leer credenciales desde variables de entorno (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) y exponer un health check basado en `pg_isready`.

#### Scenario: DoD T-23-03 — Configuración del servicio db

- **WHEN** se inspecciona la definición del servicio `db` en `docker-compose.prod.yml`
- **THEN** la imagen es `postgres:16-alpine`
- **AND** existe un volumen nombrado montado en `/var/lib/postgresql/data`
- **AND** el health check ejecuta `pg_isready -U ${POSTGRES_USER}` (o equivalente con `$$POSTGRES_USER` en compose)
- **AND** el servicio alcanza estado `healthy` antes de que `api` inicie migraciones

#### Scenario: Persistencia de datos entre reinicios

- **WHEN** el stack de producción se detiene con `docker compose -f docker-compose.prod.yml down` (sin `-v`)
- **AND** se vuelve a ejecutar `docker compose -f docker-compose.prod.yml up`
- **THEN** los datos de PostgreSQL persisten gracias al volumen nombrado

### Requirement: Servicio api con imagen ConRutina-api y dependencia healthy de db

El servicio `api` SHALL usar la imagen `conrutina-api` (construida desde `backend/Dockerfile`), recibir `DATABASE_URL` apuntando al hostname `db` dentro de la red Compose, y declarar `depends_on` con `condition: service_healthy` sobre el servicio `db`.

#### Scenario: DoD T-23-03 — Configuración del servicio api

- **WHEN** se inspecciona la definición del servicio `api`
- **THEN** la imagen se etiqueta como `conrutina-api` (minúsculas, compatible con Docker)
- **AND** el build apunta a `backend/Dockerfile` con contexto `.` (raíz del monorepo)
- **AND** `depends_on` incluye `db` con `condition: service_healthy`
- **AND** `DATABASE_URL` usa el hostname `db` como host (p. ej. `postgresql://user:pass@db:5432/conrutina`)

#### Scenario: API arranca tras migraciones cuando db está healthy

- **WHEN** el servicio `db` pasa a estado `healthy`
- **AND** el contenedor `api` inicia
- **THEN** el entrypoint ejecuta `prisma migrate deploy` antes de escuchar peticiones
- **AND** el servidor Express queda accesible en el puerto 3001 dentro de la red Compose

#### Scenario: API no arranca si db no está healthy

- **WHEN** el servicio `db` no alcanza estado `healthy` (p. ej. credenciales inválidas o arranque lento fallido)
- **THEN** Docker Compose no inicia el servicio `api` hasta que la condición `service_healthy` se cumpla o falle el arranque de `db`

### Requirement: Servicio web con imagen ConRutina-web en puerto 80

El servicio `web` SHALL usar la imagen `conrutina-web` (construida desde `frontend/Dockerfile`), publicar el puerto 80 del contenedor en el host, y declarar `depends_on: api` para que nginx arranque tras el backend.

#### Scenario: DoD T-23-03 — Configuración del servicio web

- **WHEN** se inspecciona la definición del servicio `web`
- **THEN** la imagen se etiqueta como `conrutina-web`
- **AND** el build apunta a `frontend/Dockerfile` con contexto `.`
- **AND** el mapeo de puertos es `"80:80"` (o `${WEB_PORT:-80}:80`)
- **AND** `depends_on` incluye el servicio `api`

#### Scenario: Proxy /api funcional en el stack integrado

- **WHEN** el stack está en ejecución
- **AND** se realiza `GET http://localhost/api/health` desde el host
- **THEN** nginx reenvía la petición al servicio `api` y responde con estado HTTP 200
- **AND** el cuerpo incluye `{ "status": "ok" }` o equivalente del endpoint `/health`

#### Scenario: SPA accesible en puerto 80

- **WHEN** el stack está en ejecución
- **AND** se realiza `GET http://localhost/` desde el host
- **THEN** nginx sirve `index.html` del bundle Vite
- **AND** la SPA de ConRutina carga en el navegador sin errores de red para assets estáticos

### Requirement: Variables de entorno de producción para el servicio api

El servicio `api` SHALL recibir al menos `DATABASE_URL`, `API_PORT`, `NODE_ENV=production` y `CORS_ORIGIN` acorde al origen del frontend en producción (`http://localhost` cuando se accede vía puerto 80 del host).

#### Scenario: Configuración mínima de entorno en compose

- **WHEN** se inspecciona el bloque `environment` del servicio `api`
- **THEN** `NODE_ENV` es `production`
- **AND** `API_PORT` es `3001`
- **AND** `DATABASE_URL` no usa `localhost` como host de base de datos (usa `db`)
- **AND** las credenciales de `DATABASE_URL` son coherentes con `POSTGRES_*` del servicio `db`
