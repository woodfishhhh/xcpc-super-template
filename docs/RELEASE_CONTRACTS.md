# v1.0 Release Contracts

Status: release-candidate contracts. These contracts become frozen for `v1.0.0` after the v0.7 beta trial blockers are resolved.

The goal of this file is to make compatibility visible before the first stable tag. A future change is breaking when existing public templates, personal-library JSON files, or exported print drafts stop working without a migration path.

## Public Template Schema

Public templates live at:

```text
板子/<top-level-category>/<template-folder>/meta.json
板子/<top-level-category>/<template-folder>/code.md
```

`meta.json` follows [`板子/meta.schema.json`](../板子/meta.schema.json). The v1.0 required metadata fields are:

- `id`
- `title`
- `category`
- `learningOrder`
- `tags`
- `timeComplexity`
- `spaceComplexity`
- `brief`
- `detail`
- `codeLanguage`
- `source`
- `updatedAt`

Compatibility rules:

- `id` is a stable lowercase identifier matching `^[a-z0-9]+(?:[.-][a-z0-9]+)*$`.
- `category` must match the folder path below `板子/`.
- The first `category` item must be one of the public taxonomy top-level categories.
- `learningOrder` must stay inside the range defined by [`板子/TAXONOMY.md`](../板子/TAXONOMY.md).
- `source.license` must be `GPL-3.0-only` for public templates.
- `updatedAt` uses `YYYY-MM-DD`.
- `code.md` must be non-empty.
- If `code.md` uses a Markdown code fence, its fence language must match `codeLanguage`.
- Adding optional metadata fields after v1.0 requires either schema compatibility or a documented migration.
- Removing or renaming any required field requires a schema version bump and migration plan.

## Personal Library JSON

The import/export contract for local personal templates uses `schemaVersion: 1`.

Library export:

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-06-11T00:00:00.000Z",
  "templates": []
}
```

Single-template export:

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-06-11T00:00:00.000Z",
  "template": {}
}
```

Compatibility rules:

- The app must keep importing `schemaVersion: 1` library and single-template payloads.
- Imported template code is normalized by removing one surrounding Markdown code fence.
- Imported personal templates are stored with `source: "personal"`.
- ID conflicts are resolved by renaming the imported template instead of overwriting existing templates.
- Invalid JSON or unsupported shapes must fail without mutating the existing personal library.

## Print Config Contract

The printable draft is controlled by:

- `title`
- `includeToc`
- `tocDepth`: `1` or `2`
- `layout`: `compact` or `book`
- `output`: `markdown`, `pdf`, or `both`
- `sortMode`: `learning`, `alphabetical`, `category`, or `manual`

The selected template contract is:

- `templateId`
- `detailLevel`: `none`, `brief`, or `detail`

## Markdown Export Contract

Markdown export is UTF-8 plain Markdown.

Required structure:

- Document title as `# <title>`.
- Optional `## 目录` section when `includeToc` is enabled.
- Top-level public categories rendered as `## <category>`.
- Templates rendered as `### <template title>`.
- Time and space complexity rendered before the description and code.
- `brief` text included only when `detailLevel` is `brief`.
- `detail` text included only when `detailLevel` is `detail`.
- No description text included when `detailLevel` is `none`.
- Code rendered as one fenced block using `codeLanguage`.

## PDF Export Contract

PDF export is generated in the browser from the same selected draft data.

Required behavior:

- A4 portrait pages.
- Cover page with title, template count, and layout label.
- Optional TOC when `includeToc` is enabled.
- TOC depth `1` lists categories; TOC depth `2` also lists templates.
- TOC page numbers must match the first page containing the corresponding template heading.
- Page footer must include the visible page number.
- `compact` layout may place multiple templates on a page.
- `book` layout starts each template on a new page.
- Code blocks must avoid horizontal overflow by wrapping long lines.
- Export must stop when the PDF layout report contains an error-level warning.

## Release Freeze Checklist

Before tagging `v1.0.0`:

- `npm run validate:templates` passes.
- `npm test` passes.
- `npm run build` passes.
- `npm run test:e2e` passes.
- `npm run qa:pdf` produces no release-blocking layout errors.
- `npm run verify:live` proves the deployed app opens online and reopens offline.
- GitHub CI runs both `npm run release:preflight` and `npm run qa:pdf`.
- `npm run release:preflight:final -- --confirm-beta-triaged --confirm-ci-green --confirm-pages-live` passes.
- GitHub CI is green on the release commit.
- Public beta release blockers from #9 are fixed or explicitly deferred.
- `CHANGELOG.md` contains the final `v1.0.0` entry.
- GitHub release notes mention schema, export contracts, known limitations, and the live URL.
