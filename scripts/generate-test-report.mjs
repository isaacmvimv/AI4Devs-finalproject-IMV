import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const testsDir = join(root, 'tests')
const executedAt = process.argv[2] ?? new Date().toISOString()

function loadJson(name) {
  return JSON.parse(readFileSync(join(testsDir, name), 'utf8'))
}

function relPath(absPath) {
  return absPath.replace(/\\/g, '/').replace(`${root.replace(/\\/g, '/')}/`, '')
}

function suiteCategory(filePath) {
  const p = relPath(filePath)
  if (p.includes('__tests__/integration/')) return 'Integración (API + PostgreSQL)'
  if (p.startsWith('backend/src/application/')) return 'Backend — Capa de aplicación'
  if (p.startsWith('backend/src/domain/')) return 'Backend — Dominio'
  if (p.startsWith('backend/src/infrastructure/')) return 'Backend — Infraestructura'
  if (p.startsWith('backend/src/presentation/')) return 'Backend — Presentación HTTP'
  if (p.startsWith('backend/src/config.test.ts')) return 'Backend — Configuración'
  if (p.startsWith('frontend/src/domain/')) return 'Frontend — Dominio'
  if (p.startsWith('frontend/src/application/')) return 'Frontend — Aplicación (hooks)'
  if (p.startsWith('frontend/src/infrastructure/')) return 'Frontend — Clientes HTTP'
  if (p.startsWith('frontend/src/presentation/')) return 'Frontend — Componentes UI'
  return 'Otros'
}

function suiteDescription(filePath) {
  const p = relPath(filePath)
  const map = {
    'backend/src/config.test.ts': 'Validación de variables de entorno y valores por defecto.',
    'backend/src/application/calculateWeekAvailableBalance.test.ts': 'Cálculo del saldo disponible de la semana.',
    'backend/src/application/calculateWeekStats.test.ts': 'Estadísticas semanales e índice del día actual.',
    'backend/src/application/computeCurrentWeekNetPoints.test.ts': 'Puntos netos de la semana en curso.',
    'backend/src/application/createHabit.test.ts': 'Creación de hábitos con validación de entrada.',
    'backend/src/application/createReward.test.ts': 'Creación de recompensas con validación de entrada.',
    'backend/src/application/deactivateHabit.test.ts': 'Baja lógica de hábitos y sincronización con semana activa.',
    'backend/src/application/getActiveHabits.test.ts': 'Consulta de hábitos activos del usuario.',
    'backend/src/application/getActiveRewards.test.ts': 'Consulta de recompensas activas y estado de canje.',
    'backend/src/application/getCurrentWeek.test.ts': 'Inicialización y sincronización de la semana actual.',
    'backend/src/application/getCurrentWeekResponse.test.ts': 'Orquestación de respuesta completa de semana actual.',
    'backend/src/application/getUserProfile.test.ts': 'Obtención del perfil de usuario.',
    'backend/src/application/getWeekByOffset.test.ts': 'Consulta de semanas históricas por offset.',
    'backend/src/application/lockWeekAndTransition.test.ts': 'Bloqueo de semanas obsoletas y transición.',
    'backend/src/application/reconcileWeekRedemption.test.ts': 'Reconciliación de canjes tras cambios de puntos.',
    'backend/src/application/redeemReward.test.ts': 'Canje de recompensas y errores de negocio.',
    'backend/src/application/softDeleteReward.test.ts': 'Eliminación lógica de recompensas.',
    'backend/src/application/updateHabit.test.ts': 'Actualización parcial de hábitos.',
    'backend/src/application/updateHabitEntry.test.ts': 'Actualización de entradas diarias de hábito.',
    'backend/src/application/validation/habit.test.ts': 'Esquema de validación para PATCH de hábitos.',
    'backend/src/application/validation/habitEntry.test.ts': 'Esquema de validación para PATCH de entradas.',
    'backend/src/domain/getWeekBoundaries.test.ts': 'Límites ISO de semana (lunes–domingo) en UTC.',
    'backend/src/infrastructure/ensureDemoUser.test.ts': 'Asegura usuario demo en arranque.',
    'backend/src/presentation/http/createApp.test.ts': 'Contratos HTTP de todos los endpoints REST (supertest).',
    'backend/src/presentation/http/middleware/errorHandler.test.ts': 'Mapeo de errores tipados a códigos HTTP.',
    'backend/src/presentation/http/middleware/validateBody.test.ts': 'Middleware de validación de body con Zod.',
    'backend/src/__tests__/integration/habitEntries.integration.test.ts': 'PATCH /api/habit-entries/:id contra PostgreSQL real.',
    'backend/src/__tests__/integration/habits.integration.test.ts': 'POST/DELETE /api/habits contra PostgreSQL real.',
    'backend/src/__tests__/integration/profile.integration.test.ts': 'GET /api/profile contra PostgreSQL real.',
    'backend/src/__tests__/integration/redemptions.integration.test.ts': 'POST /api/weeks/:weekId/redemptions contra PostgreSQL real.',
    'backend/src/__tests__/integration/weeks.integration.test.ts': 'GET /api/weeks/current y sincronización de hábitos.',
    'frontend/src/domain/habit.test.ts': 'Lógica pura de hábitos: toggle, stats, rachas y puntos.',
    'frontend/src/domain/reward.test.ts': 'Mapeo de formulario a entidad Reward.',
    'frontend/src/domain/week.test.ts': 'Construcción de datos de semana y bloqueo.',
    'frontend/src/application/useHabitDashboard.test.ts': 'Hook principal del dashboard: toggle, navegación y errores.',
    'frontend/src/application/useUserProfile.test.ts': 'Hook de carga del perfil de usuario.',
    'frontend/src/infrastructure/habitApi.test.ts': 'Cliente HTTP de hábitos.',
    'frontend/src/infrastructure/habitEntryApi.test.ts': 'Cliente HTTP de entradas diarias.',
    'frontend/src/infrastructure/rewardApi.test.ts': 'Cliente HTTP de recompensas y canjes.',
    'frontend/src/infrastructure/weekApi.test.ts': 'Cliente HTTP de semanas.',
    'frontend/src/presentation/components/AddHabitModal.test.tsx': 'Modal de alta de hábito y validaciones.',
    'frontend/src/presentation/components/AddRewardModal.test.tsx': 'Modal de alta de recompensa y validaciones.',
    'frontend/src/presentation/components/HabitRow.test.tsx': 'Fila de hábito: toggle, racha, read-only y eliminación.',
    'frontend/src/presentation/components/ProgressBar.test.tsx': 'Barra de progreso diario.',
    'frontend/src/presentation/components/RewardCard.test.tsx': 'Tarjeta de recompensa: canje, límites y eliminación.',
    'frontend/src/presentation/components/StatCard.test.tsx': 'Tarjeta de estadística con formato de signo.',
    'frontend/src/presentation/components/UserProfileCard.test.tsx': 'Tarjeta de perfil: loading, éxito y error.',
    'frontend/src/presentation/components/WeeklyCalendar.test.tsx': 'Calendario semanal y navegación entre semanas.',
  }
  return map[p] ?? `Suite de pruebas en ${p}.`
}

function statusLabel(status) {
  if (status === 'passed') return 'PASS'
  if (status === 'failed') return 'FAIL'
  if (status === 'skipped' || status === 'pending') return 'SKIP'
  return status.toUpperCase()
}

function buildSection(title, command, json, extraMeta = '') {
  const files = [...json.testResults].sort((a, b) => a.name.localeCompare(b.name))
  const passed = json.numPassedTests
  const failed = json.numFailedTests
  const total = json.numTotalTests

  let md = `## ${title}\n\n`
  md += `- **Comando:** \`${command}\`\n`
  md += `- **Ejecutado:** ${executedAt}\n`
  md += `- **Resultado global:** ${failed === 0 ? '**PASS**' : '**FAIL**'} (${passed}/${total} tests)\n`
  if (extraMeta) md += extraMeta
  md += '\n'

  const byCategory = new Map()
  for (const file of files) {
    const cat = suiteCategory(file.name)
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat).push(file)
  }

  for (const [category, suites] of [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    md += `### ${category}\n\n`
    for (const suite of suites) {
      const file = relPath(suite.name)
      md += `#### \`${file}\`\n\n`
      md += `${suiteDescription(suite.name)}\n\n`
      md += `| Test | Descripción | Resultado | Duración (ms) |\n`
      md += `| --- | --- | :---: | ---: |\n`
      for (const test of suite.assertionResults) {
        const desc = test.fullName.replace(/^[^ ]+ /, '').trim()
        md += `| \`${test.title}\` | ${desc.replace(/\|/g, '\\|')} | **${statusLabel(test.status)}** | ${Math.round(test.duration)} |\n`
      }
      md += '\n'
    }
  }

  return md
}

const unit = loadJson('unit-results.json')
const integration = loadJson('integration-results.json')

let e2eSection = ''
try {
  const e2e = JSON.parse(readFileSync(join(testsDir, 'e2e-results.json'), 'utf8'))
  e2eSection = `\n## E2E — Playwright\n\n`
  e2eSection += `- **Herramienta:** ${e2e.tool}\n`
  e2eSection += `- **Comando:** \`${e2e.command}\`\n`
  e2eSection += `- **Ejecutado:** ${e2e.executedAt}\n`
  e2eSection += `- **URL:** ${e2e.url}\n`
  e2eSection += `- **Resultado global:** **${e2e.result}**\n\n`
  e2eSection += `### Escenario: ${e2e.scenario}\n\n`
  e2eSection += `${e2e.description}\n\n`
  e2eSection += `| Paso | Acción | Resultado |\n| --- | --- | :---: |\n`
  for (const step of e2e.steps) {
    e2eSection += `| ${step.id} | ${step.action} | **${step.result}** |\n`
  }
  e2eSection += '\n### Capturas de pantalla\n\n'
  for (const shot of e2e.screenshots) {
    e2eSection += `- **${shot.title}:** ![${shot.title}](${shot.path})\n`
  }
  e2eSection += '\n'
} catch {
  e2eSection = ''
}

const totalPassed = unit.numPassedTests + integration.numPassedTests
const totalFailed = unit.numFailedTests + integration.numFailedTests
const totalTests = unit.numTotalTests + integration.numTotalTests

let report = `# Informe de tests — ConRutina\n\n`
report += `> Generado automáticamente el ${executedAt}\n\n`
report += `## Resumen ejecutivo\n\n`
report += `| Suite | Comando | Tests | PASS | FAIL | Resultado |\n`
report += `| --- | --- | ---: | ---: | ---: | :---: |\n`
report += `| Unitarios (Vitest) | \`npm test\` | ${unit.numTotalTests} | ${unit.numPassedTests} | ${unit.numFailedTests} | **${unit.numFailedTests === 0 ? 'PASS' : 'FAIL'}** |\n`
report += `| Integración (Vitest) | \`npm run test:integration\` | ${integration.numTotalTests} | ${integration.numPassedTests} | ${integration.numFailedTests} | **${integration.numFailedTests === 0 ? 'PASS' : 'FAIL'}** |\n`
if (e2eSection) {
  const e2e = JSON.parse(readFileSync(join(testsDir, 'e2e-results.json'), 'utf8'))
  report += `| E2E (Playwright) | \`${e2e.command}\` | ${e2e.steps.length} pasos | — | — | **${e2e.result}** |\n`
}
report += `| **Total automatizado** | — | **${totalTests}** | **${totalPassed}** | **${totalFailed}** | **${totalFailed === 0 ? 'PASS' : 'FAIL'}** |\n\n`
report += `### Stack de testing\n\n`
report += `- **Runner:** Vitest 4.x con entorno \`node\` (unitarios) y PostgreSQL real (integración).\n`
report += `- **Frontend UI:** Testing Library + jsdom.\n`
report += `- **API HTTP:** supertest sobre Express.\n`
report += `- **E2E:** Playwright contra \`http://localhost:5173\` (MCP no conectado; ver nota al final).\n\n`
report += `---\n\n`
report += buildSection('Suite unitaria (Vitest)', 'npm test', unit)
report += `---\n\n`
report += buildSection(
  'Suite de integración (Vitest + PostgreSQL)',
  'npm run test:integration',
  integration,
  integration.numFailedTests > 0
    ? `- **Nota:** Requiere PostgreSQL en \`localhost:5432\` con base \`conrutina_test\` (ver \`.env.test\`).\n`
    : '',
)
if (e2eSection) {
  report += `---\n\n${e2eSection}`
}

report += `## Artefactos generados\n\n`
report += `- \`tests/unit-results.json\` — salida JSON de Vitest (unitarios)\n`
report += `- \`tests/integration-results.json\` — salida JSON de Vitest (integración)\n`
if (e2eSection) {
  report += `- \`tests/e2e-results.json\` — metadatos del test E2E\n`
  report += `- \`tests/e2e-*.png\` — capturas de pantalla E2E\n`
}

writeFileSync(join(testsDir, 'test-report.md'), report, 'utf8')
console.log(`Report written to tests/test-report.md (${totalTests} tests documented)`)
