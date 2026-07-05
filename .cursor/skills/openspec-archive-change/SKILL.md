---
name: openspec-archive-change
description: Archive a completed change in the experimental workflow. Use when the user wants to finalize and archive a change after implementation is complete.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---

Archive a completed change in the experimental workflow.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show only active changes (not already archived).
   Include the schema used for each change if available.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run `openspec status --change "<name>" --json` to check artifact completion.

   Parse the JSON to understand:
   - `schemaName`: The workflow being used
   - `artifacts`: List of artifacts with their status (`done` or other)

   **If any artifacts are not `done`:**
   - Display warning listing incomplete artifacts
   - Use **AskUserQuestion tool** to confirm user wants to proceed
   - Proceed if user confirms

3. **Check task completion status**

   Read the tasks file (typically `tasks.md`) to check for incomplete tasks.

   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Use **AskUserQuestion tool** to confirm user wants to proceed
   - Proceed if user confirms

   **If no tasks file exists:** Proceed without task-related warning.

4. **Assess delta spec sync state**

   Check for delta specs at `openspec/changes/<name>/specs/`. If none exist, proceed without sync prompt.

   **If delta specs exist:**
   - Compare each delta spec with its corresponding main spec at `openspec/specs/<capability>/spec.md`
   - Determine what changes would be applied (adds, modifications, removals, renames)
   - Show a combined summary before prompting

   **Prompt options:**
   - If changes needed: "Sync now (recommended)", "Archive without syncing"
   - If already synced: "Archive now", "Sync anyway", "Cancel"

   If user chooses sync, copy/update files from `openspec/changes/<name>/specs/` into `openspec/specs/` now (filesystem only — no commit yet). Proceed to next step regardless of choice.

5. **Perform the archive (filesystem only — no commit yet)**

   Create the archive directory if it doesn't exist:
   ```bash
   mkdir -p openspec/changes/archive
   ```

   Generate target name using current date: `YYYY-MM-DD-<change-name>`

   **Check if target already exists:**
   - If yes: Fail with error, suggest renaming existing archive or using different date
   - If no: Move the change directory to archive

   ```bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   ```

6. **Marcar ticket como Implementado en el product backlog (antes del commit — no bloqueante)**

   Intentar actualizar `docs/product-backlog.md` para el ticket vinculado al change.

   **Resolver el Ticket ID** (en este orden):
   1. Campo `**Ticket:** T-XX-YY` en `proposal.md` del change (ya archivado en `openspec/changes/archive/YYYY-MM-DD-<name>/`).
   2. Si falta, derivar del nombre del change: `t-01-02-foo` → `T-01-02`.

   **Actualizar el backlog** (ejecutar el script del repo; no omitir el intento):
   ```bash
   npm run openspec:mark-ticket -- --change <name>
   ```
   Equivalente: `node scripts/openspec-mark-ticket-implemented.mjs --change <name>`

   El script sustituye en la sección del ticket (apartado **4. Tickets de Desarrollo**), justo antes de **Descripción**, la línea:
   - `**Estado en código:** ❌ Pendiente` (o `🟡 Parcial`) → `**Estado en código:** ✅ Implementado`

   Si el ticket ya está en ✅ Implementado, el script termina sin error (idempotente).

   **Si el script falla (exit code ≠ 0):**
   - **No bloquear** el commit ni revertir el `mv` a `archive/`.
   - Registrar el error en el resumen (salida del script + ticket ID si se conoció).
   - Indicar al usuario que corrija manualmente `docs/product-backlog.md` o vuelva a ejecutar `npm run openspec:mark-ticket -- --change <name>` cuando convenga.

7. **Git closure: commit único + push feature + merge develop**

   **Solo cuando el change modificó código de aplicación** (no cambios solo de specs):

   - Confirmar que el usuario acepta los cambios implementados
   - Confirmar que los pasos de verificación y E2E tienen informe PASS
   - En la feature branch: `git add` de **todos** los ficheros relevantes en un solo staging:
     - Código de aplicación modificado
     - Tests añadidos o modificados
     - Specs sincronizadas en `openspec/specs/` (si se sincronizaron en paso 4)
     - El change ya en su ruta de archive: `openspec/changes/archive/YYYY-MM-DD-<name>/`
     - `docs/product-backlog.md` si el script del paso 6 tuvo éxito
   - Crear **un único commit** con mensaje en viñetas breves resumiendo todos los cambios
   - **Push de la feature branch al remoto**: `git push -u origin feature/[ticket-id]-[ticket-name]`
   - Merge de la feature branch a `develop`: `git checkout develop` → `git pull origin develop` → `git merge feature/[ticket-id]-[ticket-name]`
   - Opcionalmente push de `develop` si el flujo del equipo lo requiere

   **Do NOT commit during apply** — este es el único punto de commit en el workflow OpenSpec.

8. **Display summary**

   Show archive completion summary including:
   - Change name
   - Schema that was used
   - Archive location
   - Estado del backlog: ✅ actualizado / ⚠️ falló (detalle)
   - Whether specs were synced (if applicable)
   - Note about any warnings (incomplete artifacts/tasks, fallo de backlog)

**Output On Success**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Backlog:** ✓ Ticket T-XX-YY marcado como ✅ Implementado en docs/product-backlog.md
**Specs:** ✓ Synced to main specs (or "No delta specs" or "Sync skipped")

All artifacts complete. All tasks complete.
```

**Output On Success (Backlog update failed — archive still complete)**

```
## Archive Complete (with warnings)

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Backlog:** ⚠ No se pudo marcar T-XX-YY en docs/product-backlog.md (<error summary>)
**Specs:** ✓ Synced to main specs (or "No delta specs" or "Sync skipped")

The OpenSpec change is archived and considered complete. Fix the backlog manually or re-run:
`npm run openspec:mark-ticket -- --change <name>`
```

**Guardrails**
- Always prompt for change selection if not provided
- Use artifact graph (openspec status --json) for completion checking
- Don't block archive on warnings - just inform and confirm
- Preserve .openspec.yaml when moving to archive (it moves with the directory)
- Show clear summary of what happened
- If sync is requested, copy files directly from delta specs to `openspec/specs/` (no subagent needed for simple copies)
- If delta specs exist, always run the sync assessment and show the combined summary before prompting
- **Order is critical**: sync specs (step 4) → mv to archive (step 5) → mark ticket (step 6) → ONE commit including everything (step 7). The commit is always last so it captures the final state of the repo including the archived location of the change.
- **Step 6 runs before the commit** — always attempt `npm run openspec:mark-ticket`; a failure there is a **warning only**, not a reason to skip the commit or withhold "Archive Complete"
- **Never commit during apply** — step 7 is the only commit point in the OpenSpec workflow
