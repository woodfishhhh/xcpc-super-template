# Changelog

All notable changes to XCPC Super Template are tracked here.

## Unreleased

### Added

- Offline-first Vue workbench for selecting public and personal ACM/XCPC templates.
- Public template library under `板子/` with `meta.json` and `code.md` packages.
- Template validation for metadata, category paths, code fences, license fields, and taxonomy coverage.
- Personal template editing, local storage, import/export, public-template overrides, and conflict-safe import.
- Draft composition with learning, alphabetical, category, manual, keyboard, and chapter-level ordering.
- Bulk draft controls, description-level controls, draft preset packs, and generate-before checks.
- Markdown export and browser-side PDF export with compact and book layouts.
- PDF layout reporting and QA sample rendering for TOC page numbers, page chrome, and layout warnings.
- PWA offline caching and GitHub Pages deployment.
- GitHub issue templates for bugs, features, template contributions, and beta feedback.
- v1.0 release notes draft and release preflight scripts.

### Release Candidates

- v1.0 schema and export compatibility contracts are documented in [`docs/RELEASE_CONTRACTS.md`](docs/RELEASE_CONTRACTS.md).

### Known Release Gates

- Collect 3-5 real beta user trials through #9.
- Fix or explicitly defer public beta release blockers before tagging `v1.0.0`.
- Replace this section with a final `## v1.0.0 - YYYY-MM-DD` entry before release.
