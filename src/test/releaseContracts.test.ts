import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '../..')

function readWorkspaceFile(path: string): string {
  return readFileSync(resolve(root, path), 'utf8')
}

describe('v1.0 release contracts', () => {
  it('documents every required public template schema field', () => {
    const contracts = readWorkspaceFile('docs/RELEASE_CONTRACTS.md')
    const schema = JSON.parse(readWorkspaceFile('板子/meta.schema.json')) as {
      required: string[]
    }

    for (const field of schema.required) {
      expect(contracts).toContain(`\`${field}\``)
    }
  })

  it('documents stable export formats and release gates', () => {
    const contracts = readWorkspaceFile('docs/RELEASE_CONTRACTS.md')

    expect(contracts).toContain('schemaVersion: 1')
    expect(contracts).toContain('Markdown Export Contract')
    expect(contracts).toContain('PDF Export Contract')
    expect(contracts).toContain('tocDepth')
    expect(contracts).toContain('detailLevel')
    expect(contracts).toContain('npm run qa:pdf')
  })

  it('keeps a changelog entry ready for the first stable release', () => {
    const changelog = readWorkspaceFile('CHANGELOG.md')

    expect(changelog).toContain('## Unreleased')
    expect(changelog).toContain('v1.0')
    expect(changelog).toContain('docs/RELEASE_CONTRACTS.md')
  })
})
