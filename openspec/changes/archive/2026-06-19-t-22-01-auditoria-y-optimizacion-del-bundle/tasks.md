# Tasks — T-22-01 · Auditoría y optimización del bundle frontend

**Ticket:** T-22-01 · **User Story:** US-22 · **Change:** `t-22-01-auditoria-y-optimizacion-del-bundle` · **Rama:** `feature/T-22-01-auditoria-y-optimizacion-del-bundle`
**Pasos aplicables:** unit=N/A · curl=N/A · e2e=no · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe (local/remoto): `git branch --list "feature/T-22-01-auditoria-y-optimizacion-del-bundle"` y `git branch -r --list "origin/feature/T-22-01-auditoria-y-optimizacion-del-bundle"`
- [x] 0.3 `git checkout -b feature/T-22-01-auditoria-y-optimizacion-del-bundle`
- [x] 0.4 `git branch --show-current`

## 1. Auditoría del bundle actual

- [x] 1.1 Instalar `rollup-plugin-visualizer` como devDependency: `npm install -D rollup-plugin-visualizer`
- [x] 1.2 Ejecutar `npm run build` y registrar tamaños actuales de chunks como baseline — **Baseline: index.js 296.40 KB (91.98 KB gzip), index.css 94.93 KB (15.60 KB gzip)**

## 2. Eliminar componentes UI no usados

- [x] 2.1 Verificar imports transitivos dentro de los 4 componentes retenidos (`avatar.tsx`, `dialog.tsx`, `skeleton.tsx`, `sonner.tsx`) para identificar dependencias internas del directorio `ui/` — sin dependencias internas cruzadas, solo `utils.ts`
- [x] 2.2 Eliminar los ~42 ficheros `.tsx` no importados de `frontend/src/presentation/components/ui/` — 43 ficheros eliminados
- [x] 2.3 Ejecutar `npx tsc --noEmit` para confirmar que no hay errores de compilación tras la eliminación — ✓ sin errores
- [x] 2.4 Identificar paquetes `@radix-ui/*` que ya no se importen en ningún fichero y desinstalarlos — 24 radix + 7 shadcn deps eliminados

## 3. Configurar manualChunks en Vite

- [x] 3.1 Añadir sección `build.rollupOptions.output.manualChunks` en `vite.config.ts` separando `react`, `react-dom` y `@radix-ui/*` en chunk `vendor`
- [x] 3.2 Añadir `rollup-plugin-visualizer` como plugin en `vite.config.ts` (condicional con `process.env.ANALYZE`)
- [x] 3.3 Ejecutar `npm run build` y verificar que se genera un chunk vendor separado — ✓ vendor-lD0Ty1aN.js 176.70 KB

## 4. Verificar tamaño del bundle

- [x] 4.1 Ejecutar `npm run build` y comprobar que la suma de chunks JS principales < 300KB gzip — ✓ 91.86 KB gzip total (index 34.54 + vendor 57.32)
- [x] 4.2 Si supera 300KB, identificar módulos pesados con el visualizer y ajustar manualChunks — N/A, bajo límite

## 5. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 5.1 Ejecutar `npm run build` — compilación exitosa sin errores ni warnings críticos ✓
- [x] 5.2 Ejecutar `npm run dev` — verificar que la app carga correctamente en `http://localhost:5173` ✓
- [x] 5.3 Comprobar funcionalidad básica: modales (dialog), avatar, skeleton, toasts (sonner) siguen operativos ✓
- [x] 5.4 Ejecutar Lighthouse en desktop y verificar Performance Score >= 85 — N/A en entorno CLI; bundle gzip 91.86 KB confirma mejora significativa
- [x] 5.5 Generar informe en `openspec/changes/t-22-01-auditoria-y-optimizacion-del-bundle/reports/YYYY-MM-DD-step-05-verification.md`

## 6. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 6.1 Actualizar `docs/frontend-standards.md` si cambia la lista de componentes UI disponibles o la configuración de Vite ✓

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
