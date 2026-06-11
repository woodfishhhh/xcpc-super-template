# XCPC Super Template

An offline-first ACM/XCPC template print generator.

超级板子是一个静态 Web 工作台，用来从公共板子库和本地个人板子库中勾选模板，调整顺序，配置目录/版式/介绍详细度，并导出 Markdown 或 PDF。

## Prototype

- Vue 3 + TypeScript + Vite + Tailwind CSS + shadcn-style local components.
- Public templates live in `板子/` as `meta.json + code.md`.
- Personal templates are stored in browser IndexedDB.
- Personal library supports JSON import/export.
- Sorting supports learning order, alphabetical order, manual drag-and-drop, and keyboard move buttons.
- PDF export uses browser-side pagination and direct download.
- PWA build supports reopening the app offline after first load.

## Development

```bash
npm install
npm run dev
```

Production preview:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Verification:

```bash
npm test
npm run build
npm audit --audit-level=high
```

## License

This project is licensed under GPL-3.0.

See [docs/PRD.md](docs/PRD.md).
