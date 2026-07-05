# Chat name generation instructions
_Exported on 6/12/2026 at 19:32:58 UTC from Cursor (3.7.27)_

---

**User**

Esta captura es el gasto de Tokens de Openspecs para el change "2026-06-12-t-10-01-patch-habit-entry".
- La sesión del date "Jun 12, 02:01 PM" corresponde al "opsx-propose-ticket".
- La del "Jun 12, 02:14 PM" corresponde al "opsx-apply".
- La del "Jun 12, 02:28 PM" corresponde al "opsx-archive".

El proceso que más tokens ha gastado es "opsx-apply" y creo que es porque ejecuta toda la suite de tests entera.
Para la ejecución de los próximos tickets quiero que no ejecutes la suite de tests entera y que ejecutes sólo las de los nuevos tests que se desarrollen en el mismo change en curso.
Quiero que planifiques los cambios para que a partir de ahora funcione así el flujo de OpenSpecs, pero que luego sea muy fácil de revertir por si quiero activarlo en algún "change" específico.

No cambies nada aún, indícame sólo que cambiarías.


---

**Cursor**

Investigando el flujo OpenSpecs y dónde se ejecuta la suite de tests en `opsx-apply`.


Tu intuición es correcta: en el change `2026-06-12-t-10-01-patch-habit-entry` el gasto extra de `opsx-apply` viene sobre todo de **ejecutar Vitest más veces de las necesarias** y volcar **toda la salida de la suite** al contexto del agente.

## Diagnóstico (qué pasa hoy)

En ese ticket concreto, `tasks.md` pedía:

| Paso | Comando | Problema |
|------|---------|----------|
| §7 (unit) | `npm test -- updateHabitEntry.test.ts` | OK — focalizado |
| §7 | `npm test -- createApp.test.ts` | OK — focalizado |
| §7.3 | tests de T-09 (`getCurrentWeek`, `lockWeekAndTransition`) | Regresión fuera del alcance del change |
| §8.1 | `npm test` **sin rutas** | **Suite completa** (~todas las suites backend + frontend) |

La obligación de suite amplia está definida en varios sitios que el agente lee en propose y apply:

- `docs/openspec/tasks-core.md` §N+1: *“tests focalizados → suite amplia”*
- `docs/openspec/tasks-by-type.md` §N+1: *“npm test focalizado + suite relevante”*
- `docs/openspec/tasks-full.md` paso 3: *“Ejecutar la suite unitaria del proyecto (npm test)”*
- `openspec/config.yaml` → `rules.tasks` remite a esos docs al generar `tasks.md`

`opsx-apply` no tiene lógica propia de tests; **obedece lo que diga `tasks.md` + esos docs**. Por eso propose y apply acaban repitiendo el patrón “focalizado + suite completa”.

---

## Plan de cambios (sin implementar aún)

### 1. Política central en `openspec/config.yaml` (fuente de verdad)

Añadir una sección explícita, por ejemplo:

```yaml
testing:
  applyScope: change-only   # change-only | full-suite
```

- **`change-only`** (nuevo default): en apply solo se ejecutan tests **nuevos o modificados en el change**.
- **`full-suite`**: comportamiento actual (reversible globalmente cambiando este valor).

Documentar en el bloque `context` del mismo archivo para que propose/apply lo vean siempre.

### 2. Override por change en `.openspec.yaml` (reversión fácil)

En cada change, permitir:

```yaml
testing:
  applyScope: full-suite   # anula el default solo en este ticket
```

**Cómo activar suite completa en un ticket concreto:** editar (o generar en propose) ese bloque en `openspec/changes/<name>/.openspec.yaml`. Sin tocar el resto del repo.

Alternativa complementaria en el encabezado de `tasks.md`:

```markdown
**Alcance tests apply:** change-only | full-suite
```

La prioridad recomendada: `.openspec.yaml` del change > encabezado `tasks.md` > `openspec/config.yaml`.

### 3. Actualizar `docs/openspec/tasks-core.md`

Cambios concretos:

- §N+1: sustituir *“focalizados → suite amplia”* por política según `applyScope`.
- Añadir subsección **§N — Alcance de tests en apply**:
  - **`change-only`:** listar archivos `*.test.ts` creados/renombrados en el change; ejecutar solo esos con `npm test -- <ruta1> <ruta2> ...`.
  - **Prohibido por defecto:** `npm test` sin argumentos.
  - **Opcional ligero (recomendado):** `npm run typecheck` en verificación (barato en tokens, detecta roturas de tipos).
  - **`full-suite`:** mantener subtarea explícita `npm test` (comportamiento legacy).
- Patrón de `tasks.md`: añadir línea `**Alcance tests apply:**` junto a `Pasos aplicables`.

### 4. Actualizar `docs/openspec/tasks-by-type.md`

- §N: solo tests del módulo **del ticket**, no “confirmar regresión de tickets anteriores”.
- §N+1:
  - `change-only`: focalizados + `typecheck` + arranque (`dev:api` / `dev`) según aplique.
  - `full-suite`: añadir subtarea `npm test` explícita y marcada como tal.

### 5. Actualizar `docs/openspec/tasks-full.md`

- Paso 3, punto “Ejecutar la suite unitaria más amplia”: condicionarlo a `applyScope: full-suite`.
- Ejemplo de `tasks.md` (§9.3): mismo criterio.
- Nota al inicio: *referencia histórica; la política activa está en `tasks-core.md` + `config.yaml`*.

### 6. Actualizar `openspec/config.yaml` → `rules.tasks`

Instrucciones para que **propose** genere `tasks.md` acorde al scope:

- Leer `testing.applyScope` (default + override del change si ya existe).
- Sección de tests unitarios: **comandos con rutas concretas** a archivos nuevos/modificados.
- **No generar** subtareas tipo “Confirmar suite T-09 sin regresión” salvo `full-suite`.
- Sección verificación:
  - `change-only`: sin `npm test` global; sí `typecheck` + smoke de arranque.
  - `full-suite`: incluir `npm test` como subtarea nombrada.

### 7. Actualizar `.cursor/skills/openspec-apply-change/SKILL.md`

Añadir guardrail explícito (apply es donde más tokens se queman):

- Al iniciar apply: leer `testing.applyScope` de `.openspec.yaml` o default de `config.yaml`.
- **Nunca** ejecutar `npm test` sin paths si `applyScope: change-only`.
- Ejecutar **solo** los comandos listados en las secciones de tests de `tasks.md`.
- En informes (`templates/verification.md`): documentar scope usado y archivos ejecutados.

### 8. Actualizar `.cursor/skills/propose-from-ticket/SKILL.md`

- Tras crear el change, fijar `.openspec.yaml` con `testing.applyScope: change-only` (heredado del config).
- Verificación en Paso 3: comprobar que `tasks.md` no contiene `npm test` sin rutas salvo override `full-suite`.

### 9. Actualizar `docs/openspec/templates/verification.md`

- Campo **Alcance tests:** `change-only | full-suite`.
- Sección **Tests ejecutados** (lista de archivos/comandos).
- Sección **Suite completa:** `N/A (change-only)` o resultado si aplica.

### 10. (Opcional) Script npm para claridad

En `package.json`, algo como:

```json
"test:change": "vitest run"
```

Uso documentado: `npm run test:change -- path/to/new.test.ts`. No es imprescindible (`npm test --` ya sirve), pero hace el contrato más explícito y reversible.

---

## Qué **no** tocaría (coste distinto, valor distinto)

| Paso | Mantener | Motivo |
|------|----------|--------|
| curl (§N+2) | Sí | Valida el endpoint real; poco output vs. Vitest |
| E2E Playwright (§N+3) | Sí | Solo cuando aplique al ticket |
| `npm run dev:api` / `dev` | Sí | Smoke barato |
| Archive (`opsx-archive`) | Sin cambio de tests | Ya asume informes PASS del apply |

Si en el futuro quieres suite completa **antes de merge**, encaja mejor en **CI sobre `develop`** que en cada apply.

---

## Ejemplo: cómo quedaría T-10-01 con la nueva política

**Antes (§7–§8):** 4 ejecuciones de test (2 focalizadas + 2 suites ajenas + suite completa).

**Después (`change-only`):**

```markdown
## 7. Tests unitarios del change (OBLIGATORIO)
- [ ] 7.1 npm test -- backend/src/application/validation/habitEntry.test.ts
- [ ] 7.2 npm test -- backend/src/application/updateHabitEntry.test.ts
- [ ] 7.3 npm test -- backend/src/presentation/http/createApp.test.ts
- [ ] 7.4 Informe step-07-unit.md

## 8. Verificación (OBLIGATORIO)
- [ ] 8.1 npm run typecheck
- [ ] 8.2 npm run dev:api — arranque OK
- [ ] 8.3 Informe step-08-verification.md (alcance: change-only; suite completa: N/A)
```

**Para revertir solo ese ticket:** en `.openspec.yaml` del change, `applyScope: full-suite`, y propose/apply añaden de nuevo `- [ ] 8.x npm test`.

---

## Resumen de archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `openspec/config.yaml` | Política `testing.applyScope` + reglas en `context`/`rules.tasks` |
| `docs/openspec/tasks-core.md` | Política §N / §N+1 |
| `docs/openspec/tasks-by-type.md` | Matriz de tests por scope |
| `docs/openspec/tasks-full.md` | Alinear ejemplo y paso 3 |
| `docs/openspec/templates/verification.md` | Campo alcance + lista de tests |
| `.cursor/skills/openspec-apply-change/SKILL.md` | Guardrails de ejecución |
| `.cursor/skills/propose-from-ticket/SKILL.md` | Generación acorde al scope |
| `package.json` (opcional) | `test:change` |

**No hace falta** tocar changes archivados ni el CLI de OpenSpec.

---

## Impacto esperado en tokens

- Eliminar `npm test` global en cada apply: **ahorro grande** (salida de decenas de tests acumulada en el contexto).
- Eliminar regresiones de tickets anteriores (p. ej. §7.3): **ahorro medio**.
- Mantener curl + informes: coste similar al actual en esos pasos.

El apply seguirá siendo el paso más caro (implementación + curl + lectura de código), pero debería acercarse más a propose/archive en magnitud.

Si te encaja este plan, el siguiente paso sería implementarlo empezando por `openspec/config.yaml` y `tasks-core.md`, que son los que gobiernan propose y apply.

---

**User**

¿No hay ninguna alternativa para obtener los mismos resultados pero focalizando los cambios en menos ficheros?
Quiero algo que pueda revertir de la forma más rápida y sencilla posible si cambio de opinión en futuras ejecuciones de OpenSpecs.

---

**Cursor**

Sí. Para lo que buscas (mismo resultado, mínimo diff, revertir en segundos), la opción más simple es **un solo punto de control** en el sitio donde realmente se queman tokens: **`opsx-apply`**.

## Alternativa mínima (recomendada): 1 archivo

**Cambiar solo** `.cursor/skills/openspec-apply-change/SKILL.md`

Al inicio, un bloque tipo toggle:

```markdown
## Política de tests en apply (TOGGLE)
applyTestScope: change-only   # cambiar a full-suite para revertir
```

Y 5–10 líneas de guardrails:

| `change-only` (default) | `full-suite` (revertir) |
|-------------------------|-------------------------|
| Ejecutar solo `npm test -- <ruta>` de tests **nuevos/modificados** en el change | Seguir `tasks.md` al pie de la letra |
| **Ignorar** subtareas con `npm test` sin rutas | Ejecutar suite completa |
| **Ignorar** regresiones de tickets anteriores (p. ej. “confirmar T-09”) | Ejecutar también esas regresiones |
| En informes: anotar `Suite completa: N/A (change-only)` | Comportamiento actual |

**Revertir:** abrir ese archivo y cambiar `change-only` → `full-suite`. Una línea, un archivo.

**Por qué basta:** el gasto extra está en **apply**, no en propose ni archive. Propose puede seguir generando `tasks.md` con `npm test` global; apply, con el toggle, **no lo ejecuta** en modo `change-only`.

---

## Comparación con el plan anterior

| Enfoque | Archivos | Revertir | Efecto en tokens |
|---------|----------|----------|------------------|
| Plan anterior (config + tasks-core + tasks-by-type + propose + template…) | ~7–8 | Varios docs / reglas | Máximo |
| **Solo apply skill** | **1** | **1 línea** | **Casi el mismo** (apply deja de correr suite completa) |
| config.yaml + apply skill | 2 | 1 línea en config *o* en skill | Igual + propose un poco más alineado |

Para tu criterio (“revertir lo más rápido posible”), **1 archivo gana**.

---

## Override por ticket concreto (opcional, sin tocar el global)

Si quieres suite completa **solo en un change** sin cambiar el default global:

En `openspec/changes/<nombre>/.openspec.yaml`:

```yaml
testing:
  applyScope: full-suite
```

La skill de apply leería: override del change > toggle global del skill.

- Default global: `change-only` (1 línea en la skill).
- Excepción puntual: 2 líneas en `.openspec.yaml` de ese ticket.
- Revertir excepción: borrar esas 2 líneas del change.

Sigue siendo poco invasivo; el toggle global sigue en un solo sitio.

---

## Qué **no** haría en la versión mínima

- No tocar `tasks-full.md`, `tasks-by-type.md`, `verification.md`, `propose-from-ticket`, etc.
- No añadir scripts npm.
- No reescribir changes archivados.

Son mejoras de **consistencia** (tasks.md ya no pediría suite completa), no necesarias para el ahorro de tokens.

---

## Resumen

**Misma meta, menos ficheros:** un toggle en `openspec-apply-change/SKILL.md`.

**Revertir en futuras ejecuciones:** cambiar una palabra (`change-only` ↔ `full-suite`).

**Opcional:** override por change en `.openspec.yaml` para excepciones sin tocar el default.

Si quieres, el siguiente paso sería implementar **solo esa skill** (y, si lo pides, el override en `.openspec.yaml`).

---

**User**

Ok, aplica los cambios en la Skill sin tocar openspec.yaml.

---

**Cursor**

Añadiendo el toggle de tests y los guardrails en la skill de apply.


Hecho. Solo se modificó `.cursor/skills/openspec-apply-change/SKILL.md`.

### Qué se añadió

1. **Toggle** al inicio del documento:
   ```
   applyTestScope: change-only
   ```

2. **Reglas para `change-only`:**
   - Ejecutar solo `npm test -- <ruta>` de tests nuevos/modificados en el change
   - No ejecutar `npm test` sin rutas ni regresiones de tickets anteriores
   - Sustituir suite amplia por `npm run typecheck` cuando aplique
   - Documentar en informes: alcance `change-only`, suite completa `N/A`

3. **Reglas para `full-suite`:** comportamiento anterior (seguir `tasks.md` tal cual)

4. **Referencia en el paso 6** y en **Guardrails** para que apply respete el toggle aunque `tasks.md` pida suite completa.

### Cómo revertir

Abre la skill y cambia una línea:

```
applyTestScope: full-suite
```

Sin tocar ningún otro archivo.

