# v1.0.0 Release Notes Draft

Status: draft. Publish only after #9 beta feedback is triaged and release blockers are fixed or explicitly deferred.

Live app: <https://woodfishhhh.github.io/xcpc-super-template/>

## Summary

XCPC Super Template v1.0.0 is the first stable release of the offline-first ACM/XCPC template print generator. It focuses on a practical contest workflow: select public and personal templates, edit local copies, compose a print draft, export Markdown or PDF, and reopen the workbench offline after the first successful load.

## Highlights

- Public template library organized as `板子/<category>/<template>/meta.json + code.md`.
- Personal template library stored locally in the browser, with JSON import/export and conflict-safe imports.
- Public template overrides and standalone personal-template copies.
- Draft composition with learning-order, alphabetical, category, manual, keyboard, bulk, and chapter-level ordering.
- Preset packs for common contest preparation flows.
- Brief, detailed, or hidden descriptions per selected template.
- Markdown export for editable drafts.
- Browser-side PDF export with compact and book layouts, TOC page numbers, page chrome, and layout warnings.
- PWA offline caching for reopening the app after first load.
- GitHub issue templates for bug reports, feature requests, template contributions, and beta feedback.

## Stability contracts

v1.0.0 freezes the candidate contracts documented in [`docs/RELEASE_CONTRACTS.md`](RELEASE_CONTRACTS.md):

- public template metadata schema;
- personal library JSON schema version `1`;
- print configuration values;
- Markdown export structure;
- PDF export expectations and release-blocking layout checks.

Breaking changes after v1.0.0 require either a migration path or an explicit schema/export version bump.

## Verification

Run these gates on the release commit before publishing:

```bash
npm run validate:templates
npm test
npm run build
npm run test:e2e
npm run qa:pdf
npm run verify:live
npm audit --audit-level=high
npm run release:preflight:final -- --confirm-beta-triaged --confirm-ci-green --confirm-pages-live
```

Expected release evidence:

- GitHub CI is green on the release commit.
- GitHub Pages deploy succeeds on the release commit.
- The live app opens from the public URL.
- The app reopens offline after first successful load.
- PDF QA produces no release-blocking layout errors.
- #9 beta feedback is triaged.

## Known limitations

- #9 beta trials must finish before this draft becomes final release notes.
- The Monaco editor dependency chain currently reports moderate DOMPurify advisories through `npm audit`; high severity audit remains the release gate.
- Large editor and PDF chunks may still trigger Vite size warnings, but they are expected for Monaco and PDF rendering unless split in a future performance pass.

## Release checklist

- Move the `CHANGELOG.md` `Unreleased` content into a dated `## v1.0.0 - YYYY-MM-DD` entry.
- Confirm #9 has 3-5 real user trials or explicit release-blocker triage.
- Run the final preflight command.
- Tag `v1.0.0`.
- Create the GitHub release using these notes, replacing this draft status with final release status.
