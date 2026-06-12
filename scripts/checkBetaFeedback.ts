import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface BetaIssueInput {
  number: number
  title: string
  body: string
  url?: string
  labels?: Array<{ name: string }>
}

export interface BetaIssueSummary {
  number: number
  title: string
  url?: string
  missingCoverage: string[]
}

export interface BetaFeedbackAnalysis {
  minimumRequired: number
  targetRange: string
  totalBetaLabeledIssues: number
  realTrialSummaries: number
  remainingMinimum: number
  completeTrialSummaries: number
  incompleteTrialSummaries: BetaIssueSummary[]
  releaseBlockers: BetaIssueSummary[]
  maybeBlockers: BetaIssueSummary[]
  followupsNeeded: Record<FollowupKind, BetaIssueSummary[]>
  readyForExit: boolean
}

export type FollowupKind = 'bug' | 'feature' | 'template' | 'docs'

const scriptPath = fileURLToPath(import.meta.url)
const workspaceRoot = resolve(dirname(scriptPath), '..')

export const trialCoverageLabels = [
  'Browsed the public template library and selected public templates.',
  'Edited one template title, complexity, description, or code block.',
  'Added or imported one personal template under 我的.',
  'Reordered the draft with one automatic sort and one manual move.',
  'Switched at least one template between brief and detailed description.',
  'Exported Markdown.',
  'Exported PDF in compact style.',
  'Exported PDF in book style.',
  'Reopened the app after disconnecting from the network.'
]

const followupLabels: Record<FollowupKind, string> = {
  bug: 'Bug report needed',
  feature: 'Feature request needed',
  template: 'Template contribution needed',
  docs: 'Documentation or wording improvement needed'
}

const minimumRequiredTrialSummaries = 3

export function analyzeBetaFeedbackIssues(issues: BetaIssueInput[]): BetaFeedbackAnalysis {
  const trialIssues = issues.filter(isRealTrialSummary)
  const summaries = trialIssues.map((issue) => ({
    number: issue.number,
    title: issue.title,
    url: issue.url,
    missingCoverage: missingCoverage(issue.body)
  }))
  const incompleteTrialSummaries = summaries.filter((summary) => summary.missingCoverage.length > 0)
  const releaseBlockers = summaries.filter((summary) => {
    const issue = trialIssues.find((candidate) => candidate.number === summary.number)
    return issue ? selectedDropdownValue(issue.body, 'v1.0 release blocker?') === 'Yes, release blocker' : false
  })
  const maybeBlockers = summaries.filter((summary) => {
    const issue = trialIssues.find((candidate) => candidate.number === summary.number)
    return issue ? selectedDropdownValue(issue.body, 'v1.0 release blocker?') === 'Maybe blocker' : false
  })
  const followupsNeeded = Object.fromEntries(
    Object.entries(followupLabels).map(([kind, label]) => [
      kind,
      summaries.filter((summary) => {
        const issue = trialIssues.find((candidate) => candidate.number === summary.number)
        return issue ? checkedOption(issue.body, 'Follow-up needed', label) : false
      })
    ])
  ) as Record<FollowupKind, BetaIssueSummary[]>

  const completeTrialSummaries = summaries.length - incompleteTrialSummaries.length
  const remainingMinimum = Math.max(0, minimumRequiredTrialSummaries - summaries.length)

  return {
    minimumRequired: minimumRequiredTrialSummaries,
    targetRange: '3-5',
    totalBetaLabeledIssues: issues.length,
    realTrialSummaries: summaries.length,
    remainingMinimum,
    completeTrialSummaries,
    incompleteTrialSummaries,
    releaseBlockers,
    maybeBlockers,
    followupsNeeded,
    readyForExit:
      summaries.length >= minimumRequiredTrialSummaries &&
      incompleteTrialSummaries.length === 0 &&
      releaseBlockers.length === 0
  }
}

function isRealTrialSummary(issue: BetaIssueInput): boolean {
  if (!hasLabel(issue, 'beta-feedback')) return false
  if (issue.number === 9 || /v0\.7 beta trial collection/i.test(issue.title)) return false

  return /^\[Beta\]:/i.test(issue.title) || (issue.body.includes('### Trial role') && issue.body.includes('### Trial coverage'))
}

function hasLabel(issue: BetaIssueInput, label: string): boolean {
  return issue.labels?.some((candidate) => candidate.name.toLowerCase() === label.toLowerCase()) ?? false
}

function missingCoverage(body: string): string[] {
  return trialCoverageLabels.filter((label) => !checkedOption(body, 'Trial coverage', label))
}

function checkedOption(body: string, sectionHeading: string, optionLabel: string): boolean {
  const section = markdownSection(body, sectionHeading)
  return new RegExp(`[-*]\\s*\\[[xX]\\]\\s*${escapeRegExp(optionLabel)}`).test(section)
}

function selectedDropdownValue(body: string, sectionHeading: string): string {
  const section = markdownSection(body, sectionHeading)
  return section
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith('<!--')) ?? ''
}

function markdownSection(body: string, heading: string): string {
  const lines = body.split(/\r?\n/)
  const headingPattern = new RegExp(`^###\\s+${escapeRegExp(heading)}\\s*$`, 'i')
  const start = lines.findIndex((line) => headingPattern.test(line.trim()))
  if (start < 0) return ''

  const sectionLines: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (/^###\s+/.test(line.trim())) break
    sectionLines.push(line)
  }

  return sectionLines.join('\n').trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readIssuesFromGh(): BetaIssueInput[] {
  const output = execFileSync(
    'gh',
    [
      'issue',
      'list',
      '--state',
      'all',
      '--label',
      'beta-feedback',
      '--json',
      'number,title,body,url,labels',
      '--limit',
      '100'
    ],
    {
      cwd: workspaceRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }
  )

  return JSON.parse(output) as BetaIssueInput[]
}

function parseArgs(args: string[]): { fixture?: string; json?: boolean; failOnIncomplete?: boolean } {
  const fixtureFlag = args.indexOf('--fixture')
  return {
    fixture: fixtureFlag >= 0 ? args[fixtureFlag + 1] : undefined,
    json: args.includes('--json'),
    failOnIncomplete: args.includes('--fail-on-incomplete')
  }
}

function readIssues(options: { fixture?: string }): BetaIssueInput[] {
  if (!options.fixture) return readIssuesFromGh()
  return JSON.parse(readFileSync(resolve(workspaceRoot, options.fixture), 'utf8')) as BetaIssueInput[]
}

function printAnalysis(analysis: BetaFeedbackAnalysis): void {
  console.log('Beta feedback status')
  console.log(`- Real trial summaries: ${analysis.realTrialSummaries}/${analysis.targetRange}`)
  console.log(`- Complete trial summaries: ${analysis.completeTrialSummaries}`)
  console.log(`- Remaining minimum: ${analysis.remainingMinimum}`)
  console.log(`- Release blockers: ${analysis.releaseBlockers.length}`)
  console.log(`- Maybe blockers: ${analysis.maybeBlockers.length}`)
  console.log(`- Incomplete trial summaries: ${analysis.incompleteTrialSummaries.length}`)

  for (const [kind, summaries] of Object.entries(analysis.followupsNeeded)) {
    console.log(`- ${kind} follow-ups needed: ${summaries.length}`)
  }

  if (analysis.incompleteTrialSummaries.length > 0) {
    console.log('\nIncomplete coverage:')
    for (const summary of analysis.incompleteTrialSummaries) {
      console.log(`- #${summary.number} ${summary.title}: missing ${summary.missingCoverage.join('; ')}`)
    }
  }

  if (analysis.releaseBlockers.length > 0) {
    console.log('\nRelease blockers:')
    for (const summary of analysis.releaseBlockers) {
      console.log(`- #${summary.number} ${summary.title}${summary.url ? ` (${summary.url})` : ''}`)
    }
  }

  console.log(`\nReady for v0.7 exit: ${analysis.readyForExit ? 'yes' : 'no'}`)
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath === scriptPath) {
  const options = parseArgs(process.argv.slice(2))

  try {
    const analysis = analyzeBetaFeedbackIssues(readIssues(options))
    if (options.json) {
      console.log(JSON.stringify(analysis, null, 2))
    } else {
      printAnalysis(analysis)
    }

    if (options.failOnIncomplete && !analysis.readyForExit) {
      process.exitCode = 1
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
