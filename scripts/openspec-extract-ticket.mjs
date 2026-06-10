#!/usr/bin/env node
/**
 * Extrae del backlog la sección de un ticket T-XX-YY y su User Story US-XX.
 * Evita cargar docs/product-backlog.md completo en el contexto del agente.
 *
 * Uso:
 *   node scripts/openspec-extract-ticket.mjs --ticket T-06-01
 *   node scripts/openspec-extract-ticket.mjs --ticket T-06-01 --json
 *   npm run openspec:extract-ticket -- --ticket T-06-01
 *
 * Exit 0: éxito. Exit 1: ticket o US no encontrados.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BACKLOG_PATH = join(ROOT, 'docs', 'product-backlog.md')

function parseArgs(argv) {
  let ticketId = null
  let asJson = false
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--ticket' && argv[i + 1]) {
      ticketId = argv[++i].toUpperCase()
    } else if (argv[i] === '--json') {
      asJson = true
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      printHelp()
      process.exit(0)
    }
  }
  return { ticketId, asJson }
}

function printHelp() {
  console.log(`Uso:
  node scripts/openspec-extract-ticket.mjs --ticket T-XX-YY [--json]
  npm run openspec:extract-ticket -- --ticket T-06-01`)
}

function deriveUsId(ticketId) {
  const m = ticketId.match(/^T-(\d{2})-\d{2}$/i)
  return m ? `US-${m[1]}` : null
}

function extractBlock(content, startMarker, endMarkerRegex) {
  const start = content.indexOf(startMarker)
  if (start === -1) return null
  const afterStart = start + startMarker.length
  const rest = content.slice(afterStart)
  const endMatch = rest.match(endMarkerRegex)
  const end = endMatch ? afterStart + endMatch.index : content.length
  return content.slice(start, end).trim()
}

function findSprintAt(content, position) {
  const before = content.slice(0, position)
  const matches = [...before.matchAll(/^### Sprint (\d+) · (.+)$/gm)]
  if (matches.length === 0) return null
  const last = matches[matches.length - 1]
  return { number: Number(last[1]), title: last[2].trim() }
}

function parseTicketMeta(ticketBlock) {
  const usMatch = ticketBlock.match(/\*\*User Story:\*\*\s*(US-\d{2})/i)
  const typeMatch = ticketBlock.match(/\*\*Tipo:\*\*\s*(.+)/)
  const titleMatch = ticketBlock.match(/^####\s+T-\d{2}-\d{2}\s*·\s*(.+)$/m)
  const estadoMatch = ticketBlock.match(/\*\*Estado en código:\*\*\s*(.+)/)
  return {
    userStory: usMatch?.[1]?.toUpperCase() ?? null,
    tipo: typeMatch?.[1]?.trim() ?? null,
    titulo: titleMatch?.[1]?.trim() ?? null,
    estadoEnCodigo: estadoMatch?.[1]?.trim() ?? null,
  }
}

function toKebabSlug(text, maxWords = 5) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join('-')
}

function suggestChangeName(ticketId, titulo) {
  const m = ticketId.match(/^T-(\d{2})-(\d{2})$/i)
  if (!m) return null
  if (!titulo) return `t-${m[1]}-${m[2]}`
  let source = titulo
  const colonIdx = source.indexOf(':')
  if (colonIdx !== -1) source = source.slice(colonIdx + 1).trim()
  const slug = toKebabSlug(source, 5)
  return slug ? `t-${m[1]}-${m[2]}-${slug}` : `t-${m[1]}-${m[2]}`
}

function main() {
  const { ticketId, asJson } = parseArgs(process.argv)
  if (!ticketId) {
    console.error('Error: indica --ticket T-XX-YY')
    printHelp()
    process.exit(1)
  }

  if (!/^T-\d{2}-\d{2}$/i.test(ticketId)) {
    console.error(`Error: formato de ticket inválido "${ticketId}" (esperado T-XX-YY)`)
    process.exit(1)
  }

  if (!existsSync(BACKLOG_PATH)) {
    console.error(`Error: no existe ${BACKLOG_PATH}`)
    process.exit(1)
  }

  const content = readFileSync(BACKLOG_PATH, 'utf8')
  const usId = deriveUsId(ticketId)
  if (!usId) {
    console.error(`Error: no se pudo derivar US desde ${ticketId}`)
    process.exit(1)
  }

  const ticketMarker = `#### ${ticketId} ·`
  const ticketBlock = extractBlock(content, ticketMarker, /\n#### T-\d{2}-\d{2} ·/)
  if (!ticketBlock) {
    console.error(`Error: no se encontró el ticket ${ticketId} en ${BACKLOG_PATH}`)
    process.exit(1)
  }

  const usMarker = `### ${usId} ·`
  const usBlock = extractBlock(content, usMarker, /\n### US-\d{2} ·/)
  if (!usBlock) {
    console.error(`Error: no se encontró ${usId} en ${BACKLOG_PATH}`)
    process.exit(1)
  }

  const ticketStart = content.indexOf(ticketMarker)
  const sprint = findSprintAt(content, ticketStart)
  const meta = parseTicketMeta(ticketBlock)
  const changeName = suggestChangeName(ticketId, meta.titulo)
  const slug = changeName?.replace(/^t-\d{2}-\d{2}-/i, '') ?? ''
  const branchName = slug ? `feature/${ticketId}-${slug}` : `feature/${ticketId}`

  const result = {
    ticketId,
    userStory: meta.userStory ?? usId,
    sprint,
    meta,
    changeName,
    branchName,
    ticket: ticketBlock,
    userStoryBlock: usBlock,
  }

  if (asJson) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  const sprintLine = sprint
    ? `Sprint ${sprint.number} · ${sprint.title}`
    : 'Sprint: (no detectado)'

  console.log(`# Extract: ${ticketId} / ${result.userStory}`)
  console.log()
  console.log(`- **Sprint:** ${sprintLine}`)
  console.log(`- **Tipo:** ${meta.tipo ?? '—'}`)
  console.log(`- **Estado en código:** ${meta.estadoEnCodigo ?? '—'}`)
  console.log(`- **Change sugerido:** ${changeName ?? '—'}`)
  console.log(`- **Rama sugerida:** ${branchName}`)
  console.log()
  console.log('---')
  console.log()
  console.log('## User Story')
  console.log()
  console.log(usBlock)
  console.log()
  console.log('---')
  console.log()
  console.log('## Ticket')
  console.log()
  console.log(ticketBlock)
}

main()
