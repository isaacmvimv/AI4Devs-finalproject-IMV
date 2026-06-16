# Tasks — T-16-04 · Componente AddHabitModal con validaciones

**Ticket:** T-16-04 · **User Story:** US-16 · **Change:** `t-16-04-componente-addhabitmodal-con-validaciones` · **Rama:** `feature/T-16-04-componente-addhabitmodal-con-validaciones`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=sí · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git fetch origin develop`
- [x] 0.2 Validar que la rama no existe: `git branch --list "feature/T-16-04-componente-addhabitmodal-con-validaciones"` y `git branch -r --list "origin/feature/T-16-04-componente-addhabitmodal-con-validaciones"`
- [x] 0.3 `git checkout develop && git pull origin develop`
- [x] 0.4 `git checkout -b feature/T-16-04-componente-addhabitmodal-con-validaciones`
- [x] 0.5 `git branch --show-current` (verificar rama activa)

## 1. Actualizar prop `onAdd` a `Promise<void>`

- [x] 1.1 Actualizar la interfaz `AddHabitModalProps` en `AddHabitModal.tsx`: `onAdd: (habit: { emoji: string; name: string; pointsPerDay: number; penalty: number }) => Promise<void>`
- [x] 1.2 Verificar que `App.tsx` (o el componente padre que pasa `onAdd`) envuelve la llamada en una función async o ya devuelve `Promise<void>` compatible. Ajustar si es necesario.

## 2. Migrar overlay CSS a `Dialog` de shadcn/ui

- [x] 2.1 Importar `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` desde `@/presentation/components/ui/dialog`
- [x] 2.2 Sustituir el `div` overlay manual (`fixed inset-0 bg-black/50 …`) por `<Dialog open={isOpen} onOpenChange={onClose}>`
- [x] 2.3 Verificar que el cierre con Escape funciona (comportamiento nativo de Radix Dialog)
- [x] 2.4 Verificar que `<Toaster />` de sonner está montado en `App.tsx`; añadirlo si no existe

## 3. Añadir estado de errores y validación inline

- [x] 3.1 Añadir estado de errores: `const [errors, setErrors] = useState<{ name?: string; pointsPerDay?: string; penalty?: string }>({})`
- [x] 3.2 Implementar función `validate()` que compruebe: nombre no vacío, puntos > 0, penalización >= 0; devuelve el objeto de errores
- [x] 3.3 En `handleSubmit`, invocar `validate()` antes de llamar a `onAdd`; si hay errores, actualizar estado y abortar
- [x] 3.4 Renderizar mensaje de error inline junto a cada campo inválido (texto en rojo, `text-sm text-red-500`)

## 4. Estado de carga y manejo de error de API

- [x] 4.1 Añadir estado: `const [isSubmitting, setIsSubmitting] = useState(false)`
- [x] 4.2 En `handleSubmit`, envolver la llamada a `onAdd` en try/finally: `setIsSubmitting(true)` antes, `setIsSubmitting(false)` en finally
- [x] 4.3 Deshabilitar el botón "Añadir hábito" cuando `isSubmitting === true` y mostrar spinner (ej. `<Loader2 className="animate-spin" />` de lucide-react)
- [x] 4.4 En el catch, llamar a `toast.error(err.message ?? 'Error al añadir el hábito')` (sonner) y mantener el modal abierto
- [x] 4.5 En el bloque de éxito (tras `await onAdd(...)`), cerrar modal (`onClose()`) y resetear campos

## 5. Tests unitarios (AddHabitModal.test.tsx) (OBLIGATORIO)

- [x] 5.1 Crear `frontend/src/presentation/components/AddHabitModal.test.tsx` con directiva `// @vitest-environment jsdom`
- [x] 5.2 Escribir test: **submit con nombre vacío** → error inline visible, `onAdd` no invocado
- [x] 5.3 Escribir test: **submit con puntos = 0** → error inline visible, `onAdd` no invocado
- [x] 5.4 Escribir test: **submit válido → éxito** → `onAdd` invocado con los datos correctos; mock resuelve → modal llama a `onClose`
- [x] 5.5 Escribir test: **error de API** → mock `onAdd` rechaza → `onAdd` invocado, modal permanece abierto (no se llama a `onClose`)
- [x] 5.6 Incluir `afterEach` con `cleanup()` y `vi.unstubAllGlobals()` según estándares del proyecto

## 6. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

EL AGENTE DEBE EJECUTAR:

- [x] 6.1 `npm test -- AddHabitModal` (tests unitarios focalizados; todos deben pasar)
- [x] 6.2 `npm run build` (verificar que no hay errores de TypeScript ni de compilación)
- [x] 6.3 `npm run dev` y navegar a `http://localhost:5173`, abrir el modal "Añadir hábito", comprobar comportamiento básico
- [x] 6.4 Generar informe en `openspec/changes/t-16-04-componente-addhabitmodal-con-validaciones/reports/YYYY-MM-DD-step-06-verification.md` (plantilla → `docs/openspec/templates/verification.md`)

## 7. curl → N/A

Este ticket no toca endpoints HTTP. No se realizan pruebas curl.

## 8. E2E → tasks-core §N+3 (OBLIGATORIO)

EL AGENTE DEBE EJECUTAR con Playwright MCP:

- [x] 8.1 `npm run dev` activo en `http://localhost:5173`
- [x] 8.2 Navegar al dashboard y hacer clic en "+ Nuevo hábito" para abrir el modal
- [x] 8.3 Intentar submit con nombre vacío → verificar error inline "El nombre es obligatorio"
- [x] 8.4 Intentar submit con puntos = 0 → verificar error "Los puntos deben ser mayores que 0"
- [x] 8.5 Rellenar formulario válido y confirmar → verificar que el modal se cierra y los campos se resetean
- [x] 8.6 Capturar snapshot de cada estado relevante
- [x] 8.7 Generar informe en `openspec/changes/t-16-04-componente-addhabitmodal-con-validaciones/reports/YYYY-MM-DD-step-08-e2e.md` (plantilla → `docs/openspec/templates/e2e-testing.md`)

## 9. Documentación → tasks-core §N+4

- [x] 9.1 Actualizar `docs/frontend-standards.md` sección "Manejo de formularios" si el patrón de validación inline con estado propio no está documentado (solo si aporta novedad)
- [x] 9.2 No se requiere actualizar `api-spec.yml` ni `data-model.md` (este ticket no altera contratos de API ni modelo de datos)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [ ] Confirmar que todos los pasos de verificación y E2E tienen informe PASS
- [ ] Confirmar aceptación del usuario
- [ ] Commit único en feature (viñetas breves en español)
- [ ] `git push -u origin feature/T-16-04-componente-addhabitmodal-con-validaciones`
- [ ] Merge a `develop`
- [ ] `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-16-04-componente-addhabitmodal-con-validaciones/`
- [ ] `npm run openspec:mark-ticket -- --change t-16-04-componente-addhabitmodal-con-validaciones` (no bloqueante si falla)
