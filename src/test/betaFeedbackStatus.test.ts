import { describe, expect, it } from 'vitest'
import { analyzeBetaFeedbackIssues, trialCoverageLabels, type BetaIssueInput } from '../../scripts/checkBetaFeedback'

const betaLabel = [{ name: 'beta-feedback' }]

function trialBody(options: {
  coverage?: string[]
  blocker?: 'No blocker' | 'Maybe blocker' | 'Yes, release blocker'
  followups?: string[]
} = {}): string {
  const coverage = options.coverage ?? trialCoverageLabels
  const followups = options.followups ?? []

  return [
    '### Trial role',
    'ACM/XCPC contestant',
    '',
    '### Trial coverage',
    ...trialCoverageLabels.map((label) => `- [${coverage.includes(label) ? 'x' : ' '}] ${label}`),
    '',
    '### v1.0 release blocker?',
    options.blocker ?? 'No blocker',
    '',
    '### Follow-up needed',
    ...[
      'Bug report needed',
      'Feature request needed',
      'Template contribution needed',
      'Documentation or wording improvement needed'
    ].map((label) => `- [${followups.includes(label) ? 'x' : ' '}] ${label}`)
  ].join('\n')
}

function betaIssue(number: number, body = trialBody()): BetaIssueInput {
  return {
    number,
    title: `[Beta]: tester ${number}`,
    body,
    url: `https://github.com/woodfishhhh/xcpc-super-template/issues/${number}`,
    labels: betaLabel
  }
}

describe('beta feedback status', () => {
  it('does not count the tracking issue as a real user trial', () => {
    const result = analyzeBetaFeedbackIssues([
      {
        number: 9,
        title: 'v0.7 beta trial collection',
        body: '## Tester Slots\n- [ ] Tester 1',
        labels: betaLabel
      }
    ])

    expect(result.realTrialSummaries).toBe(0)
    expect(result.remainingMinimum).toBe(3)
    expect(result.readyForExit).toBe(false)
  })

  it('reports blockers and split-worthy follow-ups from real beta summaries', () => {
    const result = analyzeBetaFeedbackIssues([
      betaIssue(21),
      betaIssue(22, trialBody({ blocker: 'Yes, release blocker', followups: ['Bug report needed'] })),
      betaIssue(23, trialBody({ blocker: 'Maybe blocker', followups: ['Feature request needed'] }))
    ])

    expect(result.realTrialSummaries).toBe(3)
    expect(result.completeTrialSummaries).toBe(3)
    expect(result.releaseBlockers).toHaveLength(1)
    expect(result.releaseBlockers[0].number).toBe(22)
    expect(result.maybeBlockers).toHaveLength(1)
    expect(result.followupsNeeded.bug.map((issue) => issue.number)).toEqual([22])
    expect(result.followupsNeeded.feature.map((issue) => issue.number)).toEqual([23])
    expect(result.readyForExit).toBe(false)
  })

  it('requires every trial summary to cover the full v0.7 flow before exit', () => {
    const missingOffline = trialCoverageLabels.filter(
      (label) => label !== 'Reopened the app after disconnecting from the network.'
    )

    const result = analyzeBetaFeedbackIssues([
      betaIssue(31),
      betaIssue(32),
      betaIssue(33, trialBody({ coverage: missingOffline }))
    ])

    expect(result.realTrialSummaries).toBe(3)
    expect(result.incompleteTrialSummaries).toHaveLength(1)
    expect(result.incompleteTrialSummaries[0].missingCoverage).toEqual([
      'Reopened the app after disconnecting from the network.'
    ])
    expect(result.readyForExit).toBe(false)
  })

  it('marks v0.7 beta exit ready only after enough complete non-blocking trial summaries', () => {
    const result = analyzeBetaFeedbackIssues([betaIssue(41), betaIssue(42), betaIssue(43)])

    expect(result.realTrialSummaries).toBe(3)
    expect(result.remainingMinimum).toBe(0)
    expect(result.releaseBlockers).toHaveLength(0)
    expect(result.incompleteTrialSummaries).toHaveLength(0)
    expect(result.readyForExit).toBe(true)
  })
})
