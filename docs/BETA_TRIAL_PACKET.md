# XCPC Super Template Beta Trial Packet

Status: shareable recruitment packet for the v0.7 public beta.
This page is the one-stop handoff for anyone running a real ACM/XCPC/OI template-print trial on the deployed app.

- Live app: <https://woodfishhhh.github.io/xcpc-super-template/>
- Open feedback entry: <https://github.com/woodfishhhh/xcpc-super-template/issues/new/choose>
- Detailed trial plan: [`docs/USER_TRIAL_PLAN.md`](USER_TRIAL_PLAN.md)

## Tester Quick Start (zh, 5 lines)

你好，请用 5-10 分钟试一下线上 XCPC Super Template：

1. 打开 <https://woodfishhhh.github.io/xcpc-super-template/>。
2. 至少加 8 个公共模板到当前打印稿，再切换一次简略/详细介绍。
3. 手动拖一次顺序、再用一次自动排序。
4. 在「我的」下导入或新增 1 个个人模板。
5. 断网后刷新页面，导出 Markdown + 紧凑/书式 PDF，把感受发到反馈入口。

完整步骤见下方「Trial Tasks」。

## Trial Tasks

The same nine tasks are also tracked in `docs/USER_TRIAL_PLAN.md` and in the Beta feedback issue form. Do them in order, and report what breaks, what feels slow, and what is unclear.

1. Open the live app and browse the public template library.
2. Add at least 8 public templates to the current draft.
3. Edit one template title, complexity, description, or code block.
4. Add or import one personal template under the "我的" category.
5. Reorder the draft with one automatic sort and one manual move.
6. Switch at least one template between brief and detailed description.
7. Export Markdown.
8. Export PDF in both compact and book styles.
9. Reopen the app after disconnecting from the network and confirm the workbench still loads.

## Time To Usable Draft

Record the wall clock time it takes to reach a draft that you would actually print in a contest.

- `less than 5 min`
- `5 to 10 min`
- `more than 10 min`

## Feedback Entry

Open the Beta feedback issue form via the repository feedback chooser:

- Direct chooser: <https://github.com/woodfishhhh/xcpc-super-template/issues/new/choose>
- Form name: `Beta feedback`
- The form already mirrors the 9 trial tasks above; please complete every required field.

For one-off reproducible bugs, file a `Bug report`. For workflow improvements, file a `Feature request`. For new shared templates, file a `Template contribution`.

## V1.0 Release Blocker

The form asks: would this finding stop you from using the printed output in a contest?

- `No blocker`
- `Maybe blocker`
- `Yes, release blocker`

A `Yes, release blocker` answer routes the issue to the v0.7 / v1.0 release triage milestone.

## Maintainer Triage Steps

Maintainers reviewing a beta issue should follow this order:

1. Read the `Trial coverage` and `Export quality` fields first to know which flows were tested.
2. If the issue mixes multiple findings, split them into separate `Bug report` / `Feature request` / `Template contribution` issues, and link them back to the original beta issue.
3. For any finding marked `Yes, release blocker`, label it `v1-blocker` and assign it to the v0.7 milestone so it lands in [`docs/RELEASE_NOTES_DRAFT.md`](RELEASE_NOTES_DRAFT.md) triage.
4. For a `Bug report` that needs reproduction, capture the browser/OS, the exact exported file (Markdown or PDF), and the smallest set of clicks that triggers it.
5. For a `Feature request`, confirm it cannot already be done via the existing print config, draft composition, or sort controls before opening a follow-up.
6. For a `Template contribution`, link the beta issue to the follow-up PR so the triager can credit the original tester.

## Related Links

- Detailed trial plan: [`docs/USER_TRIAL_PLAN.md`](USER_TRIAL_PLAN.md)
- v0.7 tracking issue: <https://github.com/woodfishhhh/xcpc-super-template/issues/7>
- Beta trial collection issue: <https://github.com/woodfishhhh/xcpc-super-template/issues/9>
- v1.0 release notes draft: [`docs/RELEASE_NOTES_DRAFT.md`](RELEASE_NOTES_DRAFT.md)
- Stability contracts: [`docs/RELEASE_CONTRACTS.md`](RELEASE_CONTRACTS.md)
