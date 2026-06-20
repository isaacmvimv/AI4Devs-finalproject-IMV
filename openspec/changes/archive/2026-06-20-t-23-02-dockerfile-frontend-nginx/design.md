# Design — T-23-02 · Dockerfile multi-stage para el frontend (nginx)

**Ticket:** T-23-02 · **User Story:** US-23

## Context

El frontend de ConRutina es una SPA Vite + React con `root: frontend/` definido en `vite.config.ts` (raíz del monorepo). En desarrollo, Vite sirve la app en `:5173` y hace proxy de `/api` hacia `http://localhost:3001`. El script `npm run build` ejecuta `vite build` y genera el output en `frontend/dist/`.

Estado actual:
- No existe `frontend/Dockerfile` ni `frontend/nginx.conf`.
- `backend/Dockerfile` (T-23-01) ya implementado con contexto de build en la raíz del monorepo.
- Los clientes HTTP del frontend usan rutas relativas `fetch('/api/...')`, por lo que en producción nginx debe reenviar `/api` al servicio Docker `api` (hostname definido en `docker-compose.prod.yml`, T-23-03).
- `vite.config.ts` incluye un proxy especial `/api/health` → `/health`; en producción nginx debe replicar ese comportamiento si la app lo usa, o delegar todo `/api/*` al backend (Express expone `/health` sin prefijo `/api`).

Dependencias del monorepo: `package.json` raíz contiene todas las dependencias (frontend y backend mezcladas). El stage builder necesita devDependencies (Vite, TypeScript, Tailwind) para compilar.

## Goals / Non-Goals

**Goals:**
- Imagen Docker de producción que sirva el bundle Vite con nginx:alpine.
- Proxy inverso de `/api` hacia `http://api:3001` (nombre de servicio Compose).
- Soporte SPA con `try_files` para rutas del lado del cliente.
- Build reproducible desde contexto raíz: `docker build -f frontend/Dockerfile . -t ConRutina-web`.

**Non-Goals:**
- `docker-compose.prod.yml` (T-23-03).
- Pipeline CI/CD (T-23-04).
- Modificar `vite.config.ts` ni el proxy de desarrollo.
- HTTPS, compresión gzip avanzada ni CDN.
- Healthcheck de Docker (se añadirá en compose de producción).

## Decisions

### D1 — Imagen base del runner: `nginx:alpine`

**Elección:** `nginx:alpine` para el stage `runner`.
**Alternativa descartada:** Servir estáticos con Node + `vite preview` (imagen más pesada, innecesaria en producción).
**Razón:** nginx es el estándar para SPAs estáticas; la imagen alpine es mínima (~40 MB).

### D2 — Build con `npm ci && npm run build` en stage builder

**Elección:** Stage `builder` basado en `node:20-alpine`, copia `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `frontend/` y ejecuta `npm ci` + `npm run build`.
**Alternativa descartada:** Build multi-stage con solo dependencias frontend aisladas (no hay `package.json` separado en `frontend/`).
**Razón:** El monorepo usa un único `package.json` raíz; reutilizar el mismo patrón que T-23-01 simplifica el Dockerfile.

### D3 — Context de build = raíz del monorepo

**Elección:** `docker build -f frontend/Dockerfile .` con context `.`.
**Razón:** `vite.config.ts` y `tsconfig.json` están en la raíz; Vite resuelve alias `@` desde ahí.

### D4 — nginx.conf en `frontend/nginx.conf`

**Elección:** Fichero versionado en `frontend/nginx.conf`, copiado al runner en `/etc/nginx/conf.d/default.conf` (reemplazando la config por defecto).
**Contenido clave:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
location /api/ {
    proxy_pass http://api:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
**Nota:** El proxy de desarrollo reescribe `/api/health` → `/health`. Si el frontend llama a `/api/health`, añadir regla específica antes del catch-all `/api/`:
```nginx
location = /api/health {
    proxy_pass http://api:3001/health;
}
```
**Alternativa descartada:** Config inline en Dockerfile con `RUN echo ...`. Menos legible y más difícil de mantener.

### D5 — Hostname `api` en proxy_pass

**Elección:** `proxy_pass http://api:3001` (sin barra final en el upstream base).
**Razón:** Coincide con el nombre de servicio previsto en T-23-03 (`api`). Dentro del contenedor nginx solo, el hostname `api` no resuelve hasta que se despliegue en la red Compose.

### D6 — `.dockerignore` en `frontend/.dockerignore`

**Elección:** Excluir `node_modules`, `dist`, `.env`, `coverage` del contexto (patrón similar a `backend/.dockerignore` de T-23-01).
**Razón:** Reduce tamaño del contexto y evita copiar artefactos locales obsoletos.

## Risks / Trade-offs

- **[Dependencia de red Docker]** → El proxy `/api` solo funciona cuando el contenedor está en la misma red que el servicio `api`. Mitigación: verificación completa en T-23-03; en T-23-02 basta con `docker build` exitoso.
- **[Tamaño del stage builder]** → `npm ci` instala deps del backend aunque no se usen en el build frontend. Mitigación: aceptable para MVP; optimización futura con workspaces separados fuera de alcance.
- **[Ruta /api/health]** → Si nginx no replica la reescritura de Vite, las llamadas a `/api/health` fallarían en producción. Mitigación: incluir regla explícita en `nginx.conf` (D4).

## Migration Plan

1. Crear `frontend/nginx.conf`, `frontend/Dockerfile` y `frontend/.dockerignore`.
2. Verificar `docker build -f frontend/Dockerfile . -t ConRutina-web`.
3. (Opcional smoke local) Ejecutar contenedor con `--network` compartida con backend para probar proxy; validación end-to-end completa en T-23-03.
4. Documentar en `development_guide.md`.

## Open Questions

_(ninguna — el alcance está acotado al Dockerfile y nginx.conf)_
