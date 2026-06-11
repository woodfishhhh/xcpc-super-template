import { describe, expect, it } from 'vitest'
import { runReleasePreflight } from '../../scripts/releasePreflight'

describe('release preflight', () => {
  it('passes the current release-candidate preparation checks', () => {
    const result = runReleasePreflight()

    expect(result.mode).toBe('candidate')
    expect(result.failures).toBe(0)
    expect(result.ok).toBe(true)
    expect(result.warnings).toBeGreaterThan(0)
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: 'pass', message: 'docs/RELEASE_NOTES_DRAFT.md exists' }),
        expect.objectContaining({ status: 'pass', message: 'package script verify:live is defined' }),
        expect.objectContaining({ status: 'pass', message: 'package script release:preflight is defined' }),
        expect.objectContaining({ status: 'warn', message: expect.stringContaining('#9 beta feedback') })
      ])
    )
  })

  it('keeps the final tag preflight blocked until human release gates are confirmed', () => {
    const result = runReleasePreflight({ final: true })

    expect(result.mode).toBe('final')
    expect(result.ok).toBe(false)
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: 'fail',
          message: 'public beta blockers from #9 are fixed or explicitly deferred'
        }),
        expect.objectContaining({
          status: 'fail',
          message: 'GitHub CI is green on the release commit'
        }),
        expect.objectContaining({
          status: 'fail',
          message: 'live Pages deployment is reachable'
        })
      ])
    )
  })
})
