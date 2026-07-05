# E2E Testing Report — T-18-02

**Date:** 2026-06-18

## Entorno

- Frontend: `npm run dev` → http://localhost:5174
- Backend: `npm run dev:api` → http://localhost:3001
- Browser: Playwright (Chromium)

## Escenarios verificados

### 8.2 Navegar a semana anterior
- Click en "‹" desde semana actual (15-21 jun)
- Datos históricos cargados: semana 8-14 jun 2026
- Badge "Semana bloqueada 🔒" visible
- Hábitos mostrados en modo lectura (sin toggles interactivos)
- **Resultado:** PASS

### 8.3 Navegar hasta que no haya más semanas
- Click en "‹" desde semana 8-14 jun → API devuelve 404
- Botón "‹" se deshabilita correctamente
- Calendario mantiene la última semana válida (8-14 jun)
- No se muestra toast de error
- **Resultado:** PASS

### 8.4 Volver a semana actual
- Click en "›" desde semana anterior → vuelve a 15-21 jun 2026
- Celdas interactivas (botones de toggle habilitados)
- Badge "Semana bloqueada" desaparece
- Botón "›" deshabilitado (ya en semana actual)
- Botón "‹" habilitado de nuevo
- **Resultado:** PASS

## Resultado global

PASS — Todos los escenarios E2E verificados correctamente.
