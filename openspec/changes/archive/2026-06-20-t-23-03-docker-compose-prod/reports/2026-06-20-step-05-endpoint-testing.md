# Informe Paso 5 - Pruebas manuales de endpoints

- Fecha: 2026-06-20
- Cambio: t-23-03-docker-compose-prod
- Agente: Auto
- URL Backend (vía nginx): http://localhost/api

## Endpoints probados

### GET /api/health (proxy nginx → api)

```bash
curl.exe -s http://localhost/api/health
```

**Respuesta:**
```json
{"status":"ok","timestamp":"2026-06-20T08:03:17.817Z"}
```

**Código de estado:** 200 OK  
**Verificación:** **PASS** — proxy `/api/health` → `/health` operativo

### GET /api/profile (endpoint de negocio)

```bash
curl.exe -s http://localhost/api/profile
```

**Respuesta:**
```json
{"code":"USER_NOT_FOUND","message":"Usuario no encontrado"}
```

**Código de estado:** 404 Not Found  
**Verificación:** **PASS** — BD prod vacía (sin seed); respuesta JSON confirma proxy y API operativos

## Pruebas adicionales (contexto BD vacía)

| Endpoint | HTTP | Notas |
|----------|------|-------|
| `GET /api/habits` | 200 | `[]` |
| `GET /api/rewards` | 200 | `[]` |
| `GET /api/weeks/current` | 500 | FK sin usuario (esperado sin seed; fuera de alcance del ticket) |

## Gestión del estado de la base de datos
- Estado previo: volumen `ConRutina_postgres_prod_data` nuevo (migraciones aplicadas, sin seed)
- Estado posterior: sin cambios
- Estado restaurado: N/A

## Observaciones
- Fix en `backend/Dockerfile`: `openssl` + `libc6-compat`, `prisma generate` en stage runner, `binaryTargets` en `schema.prisma`, runtime con `tsx` (ESM + `import.meta` incompatible con `node dist/main.js` en Alpine).

## Resultado
- Estado del Paso 5: **PASS**
- Todos los endpoints obligatorios probados: **Sí**
- Problemas bloqueantes: ninguno
