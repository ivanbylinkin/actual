# Fork notes

This is a fork of [Actual Budget](https://github.com/actualbudget/actual). It
reworks the web client's budget UI and leaves the data model, budget
calculations, sync and the sync server untouched.

The app is named "Budget". It keeps Actual's logo and PWA icons.

## Rules for changes in this fork

- UI only. Nothing under `packages/loot-core/src/server`, `packages/crdt` or
  `packages/sync-server` is modified.
- New web-client code lives in `packages/desktop-client/src/fork/`. Components
  go at the top level (`.tsx`) and are imported as `#fork/Name`. Modules
  without JSX go in `fork/lib/` (`.ts`) and are imported as `#fork/lib/name`.
  The lint rules forbid `../` imports and JSX-less `.tsx` files, which is why
  there are two aliases.
- New theme code lives in `packages/component-library/src/themes/source/fork/`.
- Upstream files get the smallest edit that wires the new code in.
- Every modified upstream file is listed below with the reason, so a rebase
  conflict can be resolved by re-applying a known, small change.

## Deviations from DESIGN.md

`DESIGN.md` is left as upstream wrote it. This fork departs from it in these
ways:

- The brand accent is indigo, not purple. The `purple*` palette keys keep their
  names and carry indigo values, so no call site changes.
- Category balances are filled, fully rounded pills rather than coloured text.

## New files

| Path                                                                     | Purpose                                                                                  |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `packages/desktop-client/src/fork/lib/availableState.ts`                 | Works out a category's pill state (funded, underfunded, overspent, zero) and its colours |
| `packages/desktop-client/src/fork/AvailablePill.tsx`                     | Desktop available-balance pill                                                           |
| `packages/desktop-client/src/fork/MobileAvailablePill.tsx`               | Mobile available-balance pill                                                            |
| `packages/component-library/src/themes/source/fork/contrast.ts`          | Resolves a token to its hex per theme and measures WCAG contrast                         |
| `packages/component-library/src/themes/source/fork/contrast.web.test.ts` | Fails if text on a fork-added surface drops below 4.5:1 in any theme                     |

## Modified upstream files

| Path                                                                                  | Change                                                                                                   | Why                                                                                                                                |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `packages/desktop-client/src/hooks/useFeatureFlag.ts`                                 | `goalTemplatesEnabled` and `goalTemplatesUIEnabled` default to `true`                                    | Targets, pill states and the category inspector depend on goal templates. Both can still be turned off in Settings → Experimental. |
| `packages/desktop-client/package.json`                                                | Two `imports` entries: `#fork/lib/*` and `#fork/*`                                                       | Lets fork code be imported without a per-file alias                                                                                |
| `packages/component-library/src/themes/source/colors.ts`                              | One block of `available*` tokens after `toBudgetNegative`                                                | Pill background and text colours for all three themes                                                                              |
| `packages/desktop-client/src/components/budget/envelope/EnvelopeBudgetComponents.tsx` | Expense category balance renders `AvailablePill` instead of `BalanceWithCarryover` (one import, one tag) | Pills on desktop                                                                                                                   |
| `packages/desktop-client/src/components/budget/tracking/TrackingBudgetComponents.tsx` | Same swap for the tracking budget's balance                                                              | Pills on desktop                                                                                                                   |
| `packages/desktop-client/src/components/mobile/budget/ExpenseCategoryListItem.tsx`    | Renders `MobileAvailablePill` instead of `BalanceCell`; drops the unused `balance` binding               | Pills on mobile                                                                                                                    |

`BalanceWithCarryover.tsx`, `BalanceCell.tsx` and `util.ts` are untouched.
Income rows and the balance-menu sheet header still use them.

### Tests

| Path                                                                                       | Change                                                                         | Why                                     |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------- |
| `packages/desktop-client/src/components/budget/BalanceWithCarryover.test.tsx`              | Sets `flags.goalTemplatesEnabled` explicitly instead of relying on the default | The default is now `true`               |
| `packages/desktop-client/src/components/modals/EnvelopeBalanceMenuModal.test.tsx`          | Same                                                                           | Same                                    |
| `packages/desktop-client/src/components/budget/tracking/TrackingBudgetComponents.test.tsx` | One test asserts the pill's underfunded state instead of the goal ring         | The balance is a pill                   |
| `packages/desktop-client/src/components/mobile/budget/ExpenseCategoryListItem.test.tsx`    | Button name matched by prefix                                                  | The pill appends its state to the label |

## Upstream tests

Upstream's Playwright end-to-end and visual regression suites
(`packages/desktop-client/e2e`) assert on the upstream UI. They are not
maintained in this fork and their snapshots are stale. Unit tests are kept
passing.
