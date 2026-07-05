import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const testsDir = join(root, 'tests')
const url = 'http://localhost:5173'
const executedAt = new Date().toISOString()

const steps = []
let overallResult = 'PASS'
let errorMessage = null

function record(id, action, result, detail = '') {
  steps.push({ id, action, result, detail })
  if (result === 'FAIL') overallResult = 'FAIL'
}

try {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  record(1, `Navegar a ${url}`, 'PASS')

  await page.screenshot({ path: join(testsDir, 'e2e-01-dashboard-inicial.png'), fullPage: true })
  record(2, 'Captura del dashboard inicial (full page)', 'PASS')

  const title = await page.title()
  const hasConRutina = title.toLowerCase().includes('conrutina') || (await page.content()).includes('ConRutina')
  record(3, 'Verificar que la aplicación carga (título o marca ConRutina)', hasConRutina ? 'PASS' : 'FAIL')

  const profileVisible = await page.getByText(/usuario|perfil|demo/i).first().isVisible({ timeout: 10000 }).catch(() => false)
  record(4, 'Verificar tarjeta de perfil o datos de usuario visibles', profileVisible ? 'PASS' : 'FAIL')

  const addHabitBtn = page.getByRole('button', { name: /añadir|agregar|nuevo.*hábito|habito/i }).first()
  const addHabitVisible = await addHabitBtn.isVisible({ timeout: 5000 }).catch(() => false)
  record(5, 'Verificar botón de añadir hábito presente', addHabitVisible ? 'PASS' : 'FAIL')

  if (addHabitVisible) {
    await addHabitBtn.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: join(testsDir, 'e2e-02-modal-habito.png'), fullPage: true })
    record(6, 'Abrir modal de nuevo hábito y capturar pantalla', 'PASS')

    const modalTitle = await page.getByRole('dialog').isVisible({ timeout: 3000 }).catch(() => false)
    record(7, 'Verificar modal de hábito abierto', modalTitle ? 'PASS' : 'FAIL')

    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  }

  const statCards = await page.locator('[class*="StatCard"], .grid').count()
  record(8, `Verificar contenido del dashboard (elementos renderizados: ${statCards})`, statCards > 0 ? 'PASS' : 'FAIL')

  await page.screenshot({ path: join(testsDir, 'e2e-03-dashboard-final.png'), fullPage: true })
  record(9, 'Captura final del dashboard tras interacción', 'PASS')

  await browser.close()
} catch (err) {
  overallResult = 'FAIL'
  errorMessage = err instanceof Error ? err.message : String(err)
  record(steps.length + 1, 'Error durante ejecución E2E', 'FAIL', errorMessage)
}

const e2eResults = {
  tool: 'Playwright (CLI fallback — MCP user-Playwright no disponible en sesión)',
  command: 'node scripts/run-e2e-playwright.mjs',
  executedAt,
  url,
  scenario: 'Dashboard ConRutina — carga, perfil y modal de hábito',
  description:
    'Test E2E manual que valida la carga del dashboard en localhost:5173, la presencia de elementos clave y la apertura del modal de nuevo hábito, con capturas en cada paso relevante.',
  result: overallResult,
  error: errorMessage,
  steps,
  screenshots: [
    { title: 'Dashboard inicial', path: 'e2e-01-dashboard-inicial.png' },
    { title: 'Modal de nuevo hábito', path: 'e2e-02-modal-habito.png' },
    { title: 'Dashboard final', path: 'e2e-03-dashboard-final.png' },
  ],
}

writeFileSync(join(testsDir, 'e2e-results.json'), JSON.stringify(e2eResults, null, 2), 'utf8')
console.log(`E2E ${overallResult} — results in tests/e2e-results.json`)
process.exit(overallResult === 'PASS' ? 0 : 1)
