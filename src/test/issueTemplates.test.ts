import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '../..')

function readWorkspaceFile(path: string): string {
  return readFileSync(resolve(root, path), 'utf8')
}

describe('GitHub issue templates', () => {
  it('collects enough structured beta feedback to triage v0.7 trials', () => {
    const template = readWorkspaceFile('.github/ISSUE_TEMPLATE/beta_feedback.yml')

    for (const id of [
      'id: role',
      'id: browser',
      'id: time_to_draft',
      'id: trial_coverage',
      'id: workflow',
      'id: result',
      'id: export_quality',
      'id: v1_blocker',
      'id: followup_kind'
    ]) {
      expect(template).toContain(id)
    }

    for (const requiredCoverage of [
      'Browsed the public template library and selected public templates.',
      'Edited one template title, complexity, description, or code block.',
      'Added or imported one personal template under 我的.',
      'Reordered the draft with one automatic sort and one manual move.',
      'Switched at least one template between brief and detailed description.',
      'Exported Markdown.',
      'Exported PDF in compact style.',
      'Exported PDF in book style.',
      'Reopened the app after disconnecting from the network.'
    ]) {
      expect(template).toContain(requiredCoverage)
    }

    expect(template).toContain('Yes, release blocker')
    expect(template).toContain('Bug report needed')
    expect(template).toContain('Feature request needed')
  })
})
