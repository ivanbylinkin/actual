# Fork notes

This is a fork of [Actual Budget](https://github.com/actualbudget/actual). It
reworks the web client's budget UI and leaves the data model, budget
calculations, sync and the sync server untouched.

The app is named "Budget". It keeps Actual's logo and PWA icons.

## Rules for changes in this fork

- UI only. Nothing under `packages/loot-core/src/server`, `packages/crdt` or
  `packages/sync-server` is modified.
- New behaviour goes in new files under a `fork/` directory next to the code it
  extends. Upstream files get the smallest edit that wires the new component in.
- Every modified upstream file is listed below with the reason, so a rebase
  conflict can be resolved by re-applying a known, small change.

## Deviations from DESIGN.md

`DESIGN.md` is left as upstream wrote it. This fork departs from it in these
ways:

- The brand accent is indigo, not purple. The `purple*` palette keys keep their
  names and carry indigo values, so no call site changes.
- Category balances are filled, fully rounded pills rather than coloured text.

## New files

| Path | Purpose |
| ---- | ------- |

## Modified upstream files

| Path                                                  | Change                                                                | Why                                                                                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `packages/desktop-client/src/hooks/useFeatureFlag.ts` | `goalTemplatesEnabled` and `goalTemplatesUIEnabled` default to `true` | Targets, pill states and the category inspector depend on goal templates. Both can still be turned off in Settings → Experimental. |

## Upstream tests

Upstream's Playwright end-to-end and visual regression suites
(`packages/desktop-client/e2e`) assert on the upstream UI. They are not
maintained in this fork and their snapshots are stale. Unit tests are kept
passing.
