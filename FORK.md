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
- `CategoryInspectorContext.tsx`: which category and month the desktop
  inspector shows, and which months are on screen.
- `CategoryInspectorLayout.tsx`: wraps the desktop budget table and places the
  inspector panel beside it.
- `CategoryInspectorPanel.tsx`: the desktop panel for one category.
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
- `lib/categoryGoal.ts`: reads a category's stored template definitions and
  picks the target a month uses (stored, else projected).
- `lib/useCategoryGoal.ts`: a category's target for the month of the
  surrounding sheet. A month only stores a target once its templates are
  applied, so when none is stored this asks Actual's
  `budget/dry-run-category-template` (the target editor's preview) what the
  templates would ask for. Pills, target bars and the inspector all read
  targets through it.
- `lib/futureAssigned.ts`: which later months count towards Ready to Assign,
  the month a budget sheet belongs to, and the arithmetic (`total-budgeted`
  is negative; money held for next month is used first).
- `lib/useFutureAssigned.ts`: the total assigned in every month after a given
  one, read from each month's sheet. Uses the budget bounds query for the
  last month.
- `lib/useReadyToAssign.ts`: Ready to Assign as the banners show it:
  `to-budget` less what later months have already assigned.
- `FutureAssignedNote.tsx`: the "Assigned in future months" line under a
  Ready to Assign amount.
- `lib/inspectorMonth.ts`: the months on screen, which one the inspector
  describes and stepping between them.
- `lib/useInspectorTableSync.ts`: called by the desktop budget table; tells
  the inspector which months are on screen and makes it follow the Assigned
  cell being edited.
- `InspectorPanel.tsx`: the desktop panel frame (title, close, month,
  scroll), shared by the category and month views.
- `InspectorMonthSwitcher.tsx`: the month the inspector describes, with
  arrows through the months on screen.
- `MonthInspectorBody.tsx`, `InspectorMonthSummary.tsx`,
  `InspectorAutoAssign.tsx`: what the inspector shows with no category
  selected: the month's totals and Auto-Assign.
- `InspectorOptionList.tsx`: the rows of one-tap budget actions shared by
  Quick assign and Auto-Assign.
- `lib/underfunded.ts`: adds up how much underfunded targets still need.
- `lib/TargetShortfallProbe.ts`: a component that renders nothing and
  reports one category's shortfall, so Auto-Assign can add them up (hooks
  can't run in a loop). It has no JSX, hence `lib/` and `.ts`.
- `InspectableCategoryName.tsx`: the category name in the desktop sidebar,
  focusable so Enter or Space opens the inspector.
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

### App name

"Actual" → "Budget" where the app introduces itself:

- `packages/desktop-client/index.html`: the page title; `theme-color` is the
  indigo brand colour.
- `packages/desktop-client/public/site.webmanifest`: `name`, `short_name`,
  the two screenshot labels, `theme_color` and `background_color`.
- `components/manager/WelcomeScreen.tsx`, `components/manager/subscribe/Bootstrap.tsx`:
  the welcome headings and intro sentences.
- `components/tour/steps.tsx`, `components/tour/TourAutoOffer.ts`,
  `components/CommandBar.tsx`: the `appName` interpolation value.

About 30 other strings still say "Actual" (settings descriptions, help and
error text, links to Actual's documentation). The logo and icons are Actual's.

### Palette

- `packages/component-library/src/themes/source/palette.ts`: the `purple*`
  values are an indigo-blue ramp, `green*` is grass green and `orange*` is
  amber. Key names are unchanged, so every token in `colors.ts` and all three
  themes follow without edits. Each new step has the same relative luminance
  as the colour it replaces, so existing text/background contrast is
  unchanged. `red*` is upstream's.
- `components/reports/overview.scss`: the one hard-coded purple (`#8719e0`,
  the dashboard drag placeholder) now uses the brand token.

To retune a ramp, pick a hue and keep each step's luminance; the generator
used for these values is described in the commit that introduced them.

### Sidebar

- `packages/component-library/src/themes/source/colors.ts`:
  `sidebarBackground` is `purple900` (dark indigo) and
  `sidebarItemBackgroundHover` is `purple800`, in all three themes.
- `components/sidebar/Accounts.tsx`: the account groups read "Budget" and
  "Tracking" instead of "On budget" and "Off budget". The groups and their
  totals were already there.
- `components/sidebar/redesign/AccountsSection.tsx`: same two labels, for the
  redesigned sidebar behind the `newSidebarUI` flag.
- `components/mobile/accounts/AccountsPage.tsx`: same two labels and their
  aria-labels on the mobile accounts page.

Elsewhere (account pickers, reports, the command bar) the groups still read
"On budget" and "Off budget".

### Pills

- `components/budget/envelope/EnvelopeBudgetComponents.tsx`: the expense
  category balance renders `AvailablePill` instead of `BalanceWithCarryover`
  (one import, one tag, plus a `category` prop so the pill can project the
  category's target).
- `components/budget/tracking/TrackingBudgetComponents.tsx`: same swap.
- `components/mobile/budget/ExpenseCategoryListItem.tsx`: renders
  `MobileAvailablePill` instead of `BalanceCell`; the unused `balance` binding
  is removed.

`BalanceWithCarryover.tsx` and `BalanceCell.tsx` are untouched. Income rows and
the balance-menu sheet header still use them.

### Targets in months whose templates weren't applied

Actual stores a category's target per month, written only when that month's
templates are applied or the target is saved while viewing it. Without help,
every target would vanish on the first of the month. All fork code reads
targets through `useCategoryGoal`, which falls back to a dry run of the
category's templates when the month has none stored. The dry run is
read-only (no budget change, no undo entry) and cached per category, month,
template definition and the balance carried in.

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
  style entries). The name renders `InspectableCategoryName` instead of
  `TextOneLine`, so it can take keyboard focus.
- `components/budget/BudgetTable.tsx`: calls `useInspectorTableSync` and, in
  `onEditMonth`, its `onEditCell` (one import, one hook call, one line), so
  the inspector knows the months on screen and follows the cell being
  edited.
- `modals/modalsSlice.ts`: a `category-inspector` entry in the `Modal` union.
- `components/Modals.tsx`: a `case 'category-inspector'` that renders
  `CategoryInspectorModal`.
- `components/mobile/budget/BudgetPage.tsx`: tapping an envelope expense
  category opens the inspector sheet instead of the category menu. The sheet
  has a "Category settings" row that opens the menu. Income categories and
  tracking budgets open the menu directly, as before.

Desktop: on wide windows the inspector is always there. With no category
selected it shows the month: carried over + assigned + activity = available,
and Auto-Assign (Underfunded, Assigned last month, Average spent, Reset
assigned amounts). Underfunded runs `apply-multiple-templates` on just the
categories short of a target; the others are Actual's month actions. Each is
one undo step. YNAB's "spent last month", "average assigned" and "reset
available" for the whole month are left out: Actual has no month-wide action
for them, and setting each category separately would take one undo per
category. Below the wide breakpoint there is no month view and the category
inspector floats over the table, as before.

The inspector describes one of the months on screen: the current month when
it is shown, else the first. Arrows in the panel step through the others,
and editing an Assigned cell moves it to that category and month. Enter and
Tab move the editor between rows, so this is also the keyboard path; the
category name is focusable too (Enter or Space opens the inspector, Escape
closes it). The mobile sheet is unchanged.

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
- `components/budget/envelope/budgetsummary/ToBudget.tsx` and
  `components/modals/EnvelopeBudgetSummaryModal.tsx`: "Move to a category"
  pre-fills the adjusted Ready to Assign (see below) instead of `to-budget`
  (one import, one hook call, one prop each).

From the current month on, both banners take off what later months (up to
the budget's last month) have already assigned, as YNAB does, and say so in
an "Assigned in future months" line. Past months show `to-budget` as Actual
computes it. Money held for next month counts towards later assignments
first. Only the displayed number and the transfer pre-fill change: the
`to-budget` cell, the totals list, the cover menu and the mobile
over-assigned banner still use Actual's own `to-budget`.

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

## Deployment

Files added for deployment; none of them changes an upstream file. See
`DEPLOY.md`.

- `.github/workflows/fork-docker.yml`: builds `sync-server.Dockerfile`, pushes
  the image to GHCR and triggers the Coolify deploy.
- `docker-compose.coolify.yml`: the compose file Coolify runs. The development
  `docker-compose.yml` is untouched.
- `bin/fork-disable-upstream-workflows`: disables every upstream workflow in
  the fork through the GitHub API. Upstream's workflow files are left as they
  are, so they never conflict on a rebase; run the script again after one.
- `DEPLOY.md`

## Upstream tests

Upstream's Playwright end-to-end and visual regression suites
(`packages/desktop-client/e2e`) assert on the upstream UI. They are not
maintained in this fork and their snapshots are stale. Unit tests are kept
passing.
