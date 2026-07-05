# Tasks — T-23-02 · Dockerfile multi-stage para el frontend (nginx)

**Ticket:** T-23-02 · **User Story:** US-23 · **Change:** `t-23-02-dockerfile-frontend-nginx` · **Rama:** `feature/T-23-02-dockerfile-frontend-nginx`
**Pasos aplicables:** unit=N/A · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe (local/remoto): `git branch --list "feature/T-23-02-dockerfile-frontend-nginx"` y `git branch -r --list "origin/feature/T-23-02-dockerfile-frontend-nginx"`
- [x] 0.3 `git checkout -b feature/T-23-02-dockerfile-frontend-nginx`
- [x] 0.4 `git branch --show-current`

## 1. Crear frontend/nginx.conf

- [x] 1.1 Crear `frontend/nginx.conf` con bloque `server` escuchando en puerto 80.
- [x] 1.2 Configurar `root /usr/share/nginx/html` y `location /` con `try_files $uri $uri/ /index.html` para soporte SPA.
- [x] 1.3 Configurar `location /api/` con `proxy_pass http://api:3001` y cabeceras `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`.
- [x] 1.4 Añadir regla `location = /api/health` con `proxy_pass http://api:3001/health` (paridad con proxy de desarrollo en `vite.config.ts`).

## 2. Crear frontend/Dockerfile multi-stage

- [x] 2.1 Stage `builder` (FROM `node:20-alpine`):
  - `WORKDIR /app`
  - Copiar `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json` y `frontend/` desde la raíz del monorepo.
  - `RUN npm ci && npm run build` → genera `frontend/dist/`.
- [x] 2.2 Stage `runner` (FROM `nginx:alpine`):
  - Copiar `frontend/dist/` del builder a `/usr/share/nginx/html`.
  - Copiar `frontend/nginx.conf` a `/etc/nginx/conf.d/default.conf`.
  - `EXPOSE 80`.
- [x] 2.3 Crear `frontend/.dockerignore` con `node_modules`, `dist`, `.env`, `coverage`.

## 3. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 3.1 (OBLIGATORIO) Ejecutar `docker build -f frontend/Dockerfile . -t ConRutina-web` desde la raíz del monorepo y verificar que se completa sin errores.
- [x] 3.2 (OBLIGATORIO) Verificar que la imagen resultante usa `nginx:alpine` como base del stage final (`docker inspect ConRutina-web`).
- [x] 3.3 Verificar que `frontend/dist/index.html` existe dentro de la imagen (`docker run --rm ConRutina-web ls /usr/share/nginx/html`).
- [x] 3.4 Informe en `openspec/changes/t-23-02-dockerfile-frontend-nginx/reports/YYYY-MM-DD-step-03-verification.md`.

## 4. curl → tasks-core §N+2 (N/A)

- [x] 4.1 Documentar N/A: ticket de infra Docker; el proxy `/api` se validará con stack completo en T-23-03 (`docker-compose.prod.yml`).

## 5. E2E → tasks-core §N+3 (N/A)

- [x] 5.1 Documentar N/A: no hay cambios de UI; la verificación E2E del stack en puerto 80 corresponde a T-23-03.

## 6. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 6.1 Actualizar `docs/development_guide.md` con sección "Build Docker del frontend (producción)": comando `docker build -f frontend/Dockerfile . -t ConRutina-web`, nota sobre proxy `/api` → servicio `api` y puerto 80.
- [x] 6.2 Informe en `openspec/changes/t-23-02-dockerfile-frontend-nginx/reports/YYYY-MM-DD-step-06-docs.md`.

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
