# Informe Paso 3 - Verificación

- Fecha: 2026-06-20
- Cambio: t-23-02-dockerfile-frontend-nginx
- Agente: Auto

## Tipo de verificación
- [ ] Tests unitarios (N/A — ticket de infra Docker)
- [x] Verificación manual / Docker build

## Alcance tests
- **Alcance tests:** change-only
- **Archivos ejecutados:** N/A (sin tests unitarios en este change)
- **Suite completa:** N/A

## Pasos de verificación realizados

### Build Docker (3.1)
- `docker build -f frontend/Dockerfile . -t conrutina-web` desde raíz del monorepo: **PASS**
- Nota: el tag `ConRutina-web` del ticket es rechazado por Docker (`repository name must be lowercase`); se usó `conrutina-web` (paridad con `conrutina-api`).

### Imagen base nginx:alpine (3.2)
- Stage `runner` definido como `FROM nginx:alpine` en `frontend/Dockerfile`: **PASS**
- `docker image inspect conrutina-web`: expone puerto 80, env `NGINX_VERSION=1.31.2`: **PASS**

### Contenido estático (3.3)
- `docker run --rm conrutina-web ls /usr/share/nginx/html`: **PASS**
- Salida: `50x.html`, `assets/`, `index.html`

### curl (4.1)
- **N/A:** ticket de infra Docker; el proxy `/api` se validará con stack completo en T-23-03 (`docker-compose.prod.yml`).

### E2E (5.1)
- **N/A:** no hay cambios de UI; la verificación E2E del stack en puerto 80 corresponde a T-23-03.

## Comandos ejecutados

```bash
docker build -f frontend/Dockerfile . -t conrutina-web
docker image inspect conrutina-web --format "{{.Config.ExposedPorts}}"
docker run --rm conrutina-web ls /usr/share/nginx/html
```

## Observaciones
- Docker Desktop no estaba en marcha al inicio; se inició y el build completó en ~2 min.
- Warnings `EBADENGINE` en `npm ci` (concurrently, rollup-plugin-visualizer requieren Node ≥22); no bloquean el build con Node 20.
- El hostname `api` en `nginx.conf` solo resuelve dentro de la red Docker Compose (T-23-03).

## Resultado
- Estado del Paso 3: **PASS**
- Problemas bloqueantes: ninguno
