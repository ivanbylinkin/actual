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

## Scope

Envelope budgets get everything. Tracking budgets get the pills only: they
keep upstream's Budgeted / Spent / Balance wording and have no Ready to Assign
banner. Reports keep upstream's wording.

## New files

All under `packages/desktop-client/src/fork/` unless a full path is given.

- `lib/availableState.ts`: works out a category's pill state (funded,
  underfunded, overspent, zero) and its colours.
- `AvailablePill.tsx`: desktop available-balance pill.
- `MobileAvailablePill.tsx`: mobile available-balance pill.
- `lib/readyToAssign.ts`: Ready to Assign state (positive, negative, zero),
  colours and status line.
- `ReadyToAssignBanner.tsx`: desktop Ready to Assign banner. Takes the same
  props as upstream's `ToBudgetAmount`.
- `MobileReadyToAssignBanner.tsx`: mobile Ready to Assign banner at the top of
  the budget.
- `lib/targetProgress.ts`: reads a category's target and how far it is funded.
- `TargetProgressBar.tsx`: thin progress bar for a category's target.
- `CategoryInspectorContext.tsx`: which category the desktop inspector shows.
- `CategoryInspectorLayout.tsx`: wraps the desktop budget table and places the
  inspector panel beside it.
- `CategoryInspectorPanel.tsx`: the desktop panel (header, close, scroll).
- `CategoryInspectorModal.tsx`: the mobile bottom sheet.
- `CategoryInspectorBody.tsx`: the content both share.
- `InspectorBreakdown.tsx`, `InspectorTarget.tsx`, `InspectorQuickAssign.tsx`:
  the three sections. `InspectorSection.tsx` and `InspectorAmountRow.tsx` are
  their layout pieces.
- `lib/quickAssign.ts`: which months an average covers, and the arithmetic for
  "spent last month" and "average assigned".
- `lib/useMonthSheetValue.ts`: reads a budget cell from another month's sheet.
- `MobileNavAddButton.tsx`: the round add-transaction button in the middle of
  the mobile tab bar.
- `packages/component-library/src/themes/source/fork/contrast.ts`: resolves a
  token to its hex per theme and measures WCAG contrast.
- `packages/component-library/src/themes/source/fork/contrast.web.test.ts`:
  fails if text on a fork-added surface drops below 4.5:1 in any theme.

## Modified upstream files

Paths are relative to `packages/desktop-client/src/` unless a full path is
given.

### Setup

- `hooks/useFeatureFlag.ts`: `goalTemplatesEnabled` and
  `goalTemplatesUIEnabled` default to `true`. Targets, pill states and the
  category inspector depend on goal templates. Both can still be turned off in
  Settings → Experimental.
- `packages/desktop-client/package.json`: two `imports` entries, `#fork/lib/*`
  and `#fork/*`, so fork code needs no per-file alias.

### Theme tokens

- `packages/component-library/src/themes/source/colors.ts`: one block of
  `available*` tokens (pill background and text) and one block of
  `readyToAssign*` tokens that reference them, both after `toBudgetNegative`.

### Pills

- `components/budget/envelope/EnvelopeBudgetComponents.tsx`: the expense
  category balance renders `AvailablePill` instead of `BalanceWithCarryover`
  (one import, one tag).
- `components/budget/tracking/TrackingBudgetComponents.tsx`: same swap.
- `components/mobile/budget/ExpenseCategoryListItem.tsx`: renders
  `MobileAvailablePill` instead of `BalanceCell`; the unused `balance` binding
  is removed.

`BalanceWithCarryover.tsx` and `BalanceCell.tsx` are untouched. Income rows and
the balance-menu sheet header still use them.

### Target progress bars

- `components/budget/SidebarCategory.tsx`: renders `TargetProgressBar` under
  the category name (one import, one element).
- `components/mobile/budget/ExpenseCategoryListItem.tsx`: same, under the name
  button.

### Category inspector

- `components/budget/index.tsx`: the table is wrapped in
  `CategoryInspectorLayout` (one import, one element replacing a `View`).
- `components/budget/SidebarCategory.tsx`: clicking a category name selects it
  for the inspector and highlights the row (one hook call, one `onClick`, two
  style entries).
- `modals/modalsSlice.ts`: a `category-inspector` entry in the `Modal` union.
- `components/Modals.tsx`: a `case 'category-inspector'` that renders
  `CategoryInspectorModal`.
- `components/mobile/budget/BudgetPage.tsx`: tapping an envelope expense
  category opens the inspector sheet instead of the category menu. The sheet
  has a "Category settings" row that opens the menu. Income categories and
  tracking budgets open the menu directly, as before.

Quick assign: "assigned last month", "average spent" and "fund the target"
run Actual's own `copy-single-last`, `set-single-3-avg` and
`apply-single-category-template` actions. Actual has no action for "spent last
month" or "average assigned", so those read earlier months from the budget
sheet and set the result with the ordinary `budget-amount` action. Nothing in
loot-core changed.

### Mobile navigation

- `components/mobile/MobileNavTabs.tsx`: the first row is Budget, Accounts,
  the add button, Transactions, Reports (`COLUMN_COUNT` 3 → 5, the tab list
  reordered, `MobileNavAddButton` spliced in, an `end` prop so Accounts is not
  highlighted on the Transactions tab, tighter label padding). Schedules and
  Settings are on the second row, reached by swiping the bar up as before.
- `components/FinancesApp.tsx`: one route so the tab bar shows on
  `/accounts/all`, which is the Transactions tab.
- `components/mobile/accounts/AccountPage.tsx`: no Back button on
  `/accounts/all`, since it is now a top-level tab.

Transaction entry was already amount-first upstream (the amount is the first
field and takes focus on a new transaction), so nothing changed there.

### 44px tap targets (mobile layout)

- `packages/component-library/src/styles.ts`: `MOBILE_MIN_HEIGHT` 40 → 44.
  Every mobile form field, sheet row and large button uses it.
- `components/mobile/budget/BudgetTable.tsx`: `PILL_STYLE` gets transparent
  10px top and bottom borders with `background-clip: padding-box`, a matching
  vertical radius and `minWidth: 44`. The Assigned, Activity and Available
  pills look the same and are 45px tall to the touch. Column header buttons
  get `minHeight: 44`; the header's vertical padding drops from 10 to 4 to
  absorb it.
- `components/mobile/budget/ExpenseCategoryListItem.tsx`,
  `IncomeCategoryListItem.tsx`, `ExpenseGroupListItem.tsx`, `IncomeGroup.tsx`:
  `minHeight: 44` on the name buttons (and the group collapse button).
- `components/mobile/budget/BudgetPage.tsx`: `minHeight`/`minWidth: 44` on the
  header's menu, month and arrow buttons.
- `components/mobile/transactions/AddTransactionButton.tsx`,
  `components/mobile/MobileBackButton.tsx`,
  `components/mobile/accounts/AccountsPage.tsx` (Add account),
  `components/mobile/accounts/AccountPage.tsx` (title button): `minHeight: 44`
  and, for the icon buttons, `minWidth: 44` with a smaller margin so the header
  keeps its size.

Still under 44px, all upstream and left alone: the group collapse chevron
(18px wide, 44px tall, with the 44px group name beside it), and inside the
new-transaction form the "Request Location" button (24px tall), the "Add tag"
button (19px) and the search field's inner input.

### Ready to Assign banner

- `components/budget/envelope/budgetsummary/ToBudget.tsx`: renders
  `ReadyToAssignBanner` instead of `ToBudgetAmount` (one import, one tag, one
  prop). `ToBudgetAmount.tsx` is untouched and now unused.
- `components/modals/EnvelopeBudgetSummaryModal.tsx`: same swap.
- `components/mobile/budget/BudgetPage.tsx`: renders
  `MobileReadyToAssignBanner` above the banners list.
- `components/mobile/budget/BudgetTable.tsx`: the header's `ToBudget` cell and
  its component are removed, since the banner replaces them.

### Wording

One-line string changes: Budgeted → Assigned, Spent → Activity, Balance →
Available, To Budget → Ready to Assign, overbudgeted → over-assigned.

- `components/budget/envelope/EnvelopeBudgetComponents.tsx`: column titles.
- `components/mobile/budget/BudgetTable.tsx`: column titles (envelope only).
- `components/budget/envelope/budgetsummary/TotalsList.tsx`
- `components/budget/envelope/BalanceMenu.tsx`
- `components/budget/util.ts`: the category-picker group name.
- `components/mobile/budget/BudgetMenuSheet.tsx`
- `components/mobile/budget/BudgetPage.tsx`
- `components/modals/EnvelopeBudgetSummaryModal.tsx`
- `components/tour/steps.tsx`

### Tests

- `components/budget/BalanceWithCarryover.test.tsx` and
  `components/modals/EnvelopeBalanceMenuModal.test.tsx`: set
  `flags.goalTemplatesEnabled` explicitly instead of relying on the default,
  which is now `true`.
- `components/budget/tracking/TrackingBudgetComponents.test.tsx`: one test
  asserts the pill's underfunded state instead of the goal ring.
- `components/budget/SidebarCategory.test.tsx`: mocks `useSheetValue`, because
  the row now reads the category's target from the budget sheet.
- `components/mobile/budget/ExpenseCategoryListItem.test.tsx`: button name
  matched by prefix, because the pill appends its state to the label.
- `components/modals/EnvelopeBalanceMenuModal.test.tsx` and
  `components/budget/envelope/BalanceMovementMenu.test.tsx`: menu item text
  updated to "Fund target from Ready to Assign".

## Upstream tests

Upstream's Playwright end-to-end and visual regression suites
(`packages/desktop-client/e2e`) assert on the upstream UI. They are not
maintained in this fork and their snapshots are stale. Unit tests are kept
passing.
