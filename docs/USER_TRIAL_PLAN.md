# User Trial Plan

This document keeps the v0.7 public beta trial repeatable. Use it when asking 3-5 ACM/OI users to try the deployed app and report feedback.

Live app: <https://woodfishhhh.github.io/xcpc-super-template/>

Feedback entry: <https://github.com/woodfishhhh/xcpc-super-template/issues/new/choose>

## Target Users

- ACM/XCPC contestants who already maintain a team template.
- OI contestants who need a compact printed algorithm library.
- Teammates or coaches who can judge print readability and workflow clarity.

## Trial Tasks

Ask every tester to complete the same core flow:

1. Open the live app and browse the public template library.
2. Add at least 8 public templates to the current draft.
3. Edit one template title, complexity, description, or code block.
4. Add or import one personal template under the "我的" category.
5. Reorder the draft with one automatic sort and one manual move.
6. Switch at least one template between brief and detailed description.
7. Export Markdown.
8. Export PDF in both compact and book styles.
9. Reopen the app after disconnecting from the network and confirm the workbench still loads.

## What To Observe

Record issues when a tester:

- cannot find where a template or personal template should be edited;
- loses edits, imports, ordering, or description choices;
- cannot tell what will be included in the final draft;
- sees wrong TOC page numbers or unreadable PDF/code layout;
- needs more than 5 minutes to produce a usable print draft;
- cannot reopen the deployed app offline after a successful first load.

## Feedback Format

Prefer one GitHub issue per distinct problem. Use:

- `Beta feedback` for full trial summaries;
- `Bug report` for reproducible broken behavior;
- `Feature request` for workflow improvements;
- `Template contribution` for new public templates.

Each beta issue should include browser/OS, the exact workflow tried, exported format, expected behavior, actual behavior, and screenshots or generated files when useful.

## v0.7 Exit Criteria

v0.7 can close when:

- 3-5 real trial summaries are filed or converted into GitHub issues;
- high-frequency blockers are labeled and assigned to a follow-up milestone;
- no tester reports a release-blocking failure in template selection, local editing, Markdown export, PDF export, or offline reopen.
