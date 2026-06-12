import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '../..')

function readWorkspaceFile(path: string): string {
  return readFileSync(resolve(root, path), 'utf8')
}

const requiredTrialTasks = [
  'Open the live app and browse the public template library.',
  'Add at least 8 public templates to the current draft.',
  'Edit one template title, complexity, description, or code block.',
  'Add or import one personal template under the "\u6211\u7684" category.',
  'Reorder the draft with one automatic sort and one manual move.',
  'Switch at least one template between brief and detailed description.',
  'Export Markdown.',
  'Export PDF in both compact and book styles.',
  'Reopen the app after disconnecting from the network and confirm the workbench still loads.'
]

describe('Beta trial packet', () => {
  it('exists and mirrors the v0.7 trial tasks plus feedback entry plus v1.0 blocker callout', () => {
    const packet = readWorkspaceFile('docs/BETA_TRIAL_PACKET.md')

    expect(packet).toContain('# XCPC Super Template Beta Trial Packet')

    for (const task of requiredTrialTasks) {
      expect(packet).toContain(task)
    }

    expect(packet).toContain('https://github.com/woodfishhhh/xcpc-super-template/issues/new/choose')
    expect(packet).toContain('Beta feedback')
    expect(packet).toContain('Yes, release blocker')
    expect(packet).toContain('Maintainer Triage Steps')
    expect(packet).toContain('issues/9')
  })

  it('is wired into the README project docs list', () => {
    const readme = readWorkspaceFile('README.md')
    expect(readme).toContain('docs/BETA_TRIAL_PACKET.md')
  })
})
