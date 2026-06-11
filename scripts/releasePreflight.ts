import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type CheckStatus = 'pass' | 'warn' | 'fail'

export interface ReleasePreflightOptions {
  final?: boolean
  confirmBetaTriaged?: boolean
  confirmCiGreen?: boolean
  confirmPagesLive?: boolean
}

export interface ReleasePreflightCheck {
  status: CheckStatus
  message: string
  detail?: string
}

export interface ReleasePreflightResult {
  mode: 'candidate' | 'final'
  ok: boolean
  checks: ReleasePreflightCheck[]
  failures: number
  warnings: number
}

const scriptPath = fileURLToPath(import.meta.url)
const workspaceRoot = resolve(dirname(scriptPath), '..')

const requiredTemplateFields = [
  'id',
  'title',
  'category',
  'learningOrder',
  'tags',
  'timeComplexity',
  'spaceComplexity',
  'brief',
  'detail',
  'codeLanguage',
  'source',
  'updatedAt'
]

const requiredPackageScripts = [
  'validate:templates',
  'test',
  'build',
  'test:e2e',
  'qa:pdf',
  'verify:live',
  'release:preflight',
  'release:preflight:final'
]

export function runReleasePreflight(options: ReleasePreflightOptions = {}): ReleasePreflightResult {
  const checks: ReleasePreflightCheck[] = []
  const final = options.final === true

  const add = (status: CheckStatus, message: string, detail?: string) => {
    checks.push({ status, message, detail })
  }

  const hasFile = (path: string): boolean => {
    const exists = existsSync(resolve(workspaceRoot, path))
    add(exists ? 'pass' : 'fail', `${path} exists`)
    return exists
  }

  const readText = (path: string): string => {
    return readFileSync(resolve(workspaceRoot, path), 'utf8')
  }

  const releaseContracts = hasFile('docs/RELEASE_CONTRACTS.md')
    ? readText('docs/RELEASE_CONTRACTS.md')
    : ''
  const releaseNotes = hasFile('docs/RELEASE_NOTES_DRAFT.md')
    ? readText('docs/RELEASE_NOTES_DRAFT.md')
    : ''
  const changelog = hasFile('CHANGELOG.md') ? readText('CHANGELOG.md') : ''
  const packageJson = hasFile('package.json')
    ? (JSON.parse(readText('package.json')) as { version?: string; license?: string; scripts?: Record<string, string> })
    : { scripts: {} }
  const schema = hasFile('板子/meta.schema.json')
    ? (JSON.parse(readText('板子/meta.schema.json')) as { required?: string[] })
    : { required: [] }

  for (const path of ['docs/ROADMAP.md', 'docs/USER_TRIAL_PLAN.md', '板子/TAXONOMY.md']) {
    hasFile(path)
  }

  add(
    packageJson.license === 'GPL-3.0-only' ? 'pass' : 'fail',
    'package license is GPL-3.0-only',
    packageJson.license ? `found ${packageJson.license}` : 'missing license'
  )

  for (const script of requiredPackageScripts) {
    add(
      packageJson.scripts?.[script] ? 'pass' : 'fail',
      `package script ${script} is defined`,
      packageJson.scripts?.[script]
    )
  }

  for (const field of requiredTemplateFields) {
    const schemaHasField = schema.required?.includes(field) ?? false
    const docsMentionField = releaseContracts.includes(`\`${field}\``)
    add(schemaHasField ? 'pass' : 'fail', `template schema requires ${field}`)
    add(docsMentionField ? 'pass' : 'fail', `release contracts document ${field}`)
  }

  for (const needle of [
    'Personal Library JSON',
    'Print Config Contract',
    'Markdown Export Contract',
    'PDF Export Contract',
    'Release Freeze Checklist',
    'npm run qa:pdf',
    'npm run verify:live',
    '#9'
  ]) {
    add(releaseContracts.includes(needle) ? 'pass' : 'fail', `release contracts mention ${needle}`)
  }

  for (const needle of [
    '# v1.0.0 Release Notes Draft',
    'Live app',
    'Highlights',
    'Stability contracts',
    'Verification',
    'Known limitations',
    'Release checklist'
  ]) {
    add(releaseNotes.includes(needle) ? 'pass' : 'fail', `release notes draft mention ${needle}`)
  }

  add(changelog.includes('## Unreleased') ? 'pass' : 'fail', 'CHANGELOG.md has Unreleased section')
  add(changelog.includes('Known Release Gates') ? 'pass' : 'fail', 'CHANGELOG.md lists release gates')

  if (final) {
    add(packageJson.version === '1.0.0' ? 'pass' : 'fail', 'package version is 1.0.0 before final tag')
    add(
      /## v1\.0\.0 - \d{4}-\d{2}-\d{2}/.test(changelog) ? 'pass' : 'fail',
      'CHANGELOG.md has a dated v1.0.0 entry'
    )
    add(
      !/TBD|TODO|Replace this section/i.test(changelog) ? 'pass' : 'fail',
      'CHANGELOG.md has no release placeholders'
    )
    add(
      options.confirmBetaTriaged ? 'pass' : 'fail',
      'public beta blockers from #9 are fixed or explicitly deferred',
      'pass --confirm-beta-triaged only after reviewing #9'
    )
    add(
      options.confirmCiGreen ? 'pass' : 'fail',
      'GitHub CI is green on the release commit',
      'pass --confirm-ci-green after checking the release commit'
    )
    add(
      options.confirmPagesLive ? 'pass' : 'fail',
      'live Pages deployment is reachable',
      'pass --confirm-pages-live after checking the deployed app'
    )
  } else {
    add('warn', 'final v1.0.0 tag is still blocked on #9 beta feedback triage')
    add('warn', 'final changelog entry is intentionally not dated yet')
    add('warn', 'run npm run release:preflight:final before tagging v1.0.0')
  }

  const failures = checks.filter((check) => check.status === 'fail').length
  const warnings = checks.filter((check) => check.status === 'warn').length

  return {
    mode: final ? 'final' : 'candidate',
    ok: failures === 0,
    checks,
    failures,
    warnings
  }
}

function parseArgs(args: string[]): ReleasePreflightOptions {
  return {
    final: args.includes('--final'),
    confirmBetaTriaged: args.includes('--confirm-beta-triaged'),
    confirmCiGreen: args.includes('--confirm-ci-green'),
    confirmPagesLive: args.includes('--confirm-pages-live')
  }
}

function printResult(result: ReleasePreflightResult): void {
  console.log(`Release preflight: ${result.mode}`)
  for (const check of result.checks) {
    const prefix = check.status.toUpperCase().padEnd(4)
    console.log(`${prefix} ${check.message}${check.detail ? ` (${check.detail})` : ''}`)
  }
  console.log(`Summary: ${result.failures} failure(s), ${result.warnings} warning(s).`)
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath === scriptPath) {
  const result = runReleasePreflight(parseArgs(process.argv.slice(2)))
  printResult(result)
  if (!result.ok) process.exitCode = 1
}
