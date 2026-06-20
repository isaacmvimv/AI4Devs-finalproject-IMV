# Informe Paso 6 - Pruebas E2E (Playwright)

- Fecha: 2026-06-20
- Cambio: t-23-03-docker-compose-prod
- Agente: Auto
- URL Frontend: http://localhost

## Entorno
- Stack prod: **PASS** — `docker compose -f docker-compose.prod.yml up --build -d`
- Base de datos: volumen prod vacío (sin seed)

## Escenarios ejecutados

### 6.1 — Carga de la SPA
1. Navegación Playwright → http://localhost
2. Título de página: `ConRutina` — **PASS**
3. Layout base visible (`+ Nuevo hábito`, tarjeta `Usuario desconocido`) — **PASS**

### 6.2 — Errores de red
- Assets estáticos (`/assets/*`): sin fallos — **PASS**
- `GET /api/profile` → 404 (consola del navegador; manejado en UI) — aceptable con BD vacía
- `GET /api/weeks/current` → 500 (sin usuario en BD) — no bloquea renderizado

### 6.3 — Estado vacío sin crash
- Dashboard renderiza con BD vacía — **PASS**
- Perfil muestra «Usuario desconocido» — **PASS**
- Sin crash ni pantalla en blanco — **PASS**

Captura: `e2e-prod-stack.png` (generada durante la prueba).

## Comandos ejecutados

```bash
# Playwright headless (script temporal en sesión de apply)
node scripts/e2e-prod-stack.mjs
```

## Observaciones
- Sin seed en prod, `/api/weeks/current` devuelve 500; la UI sigue usable (estado vacío). Seed manual opcional para demo completa.

## Resultado
- Estado del Paso 6: **PASS**
- Todos los escenarios pasaron: **Sí** (criterios de BD vacía según tasks.md §6.3)
- Entorno restaurado: pendiente `docker compose down` (§6.5)
- Problemas bloqueantes: ninguno
