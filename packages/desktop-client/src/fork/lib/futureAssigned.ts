import * as monthUtils from '@actual-app/core/shared/months';

/**
 * The month a budget sheet belongs to (`budget202611` → `2026-11`), or null
 * for any other sheet.
 */
export function monthFromSheetName(sheetName: string): string | null {
  const match = /^budget(\d{4})(\d{2})$/.exec(sheetName);
  return match ? `${match[1]}-${match[2]}` : null;
}

/**
 * The later months whose assignments come out of this month's Ready to
 * Assign: every month after it up to the last month the budget has. Past
 * months are left as Actual computes them, so they get none.
 */
export function getFutureMonths(
  month: string,
  currentMonth: string,
  lastBudgetMonth: string,
): string[] {
  if (month < currentMonth || month >= lastBudgetMonth) {
    return [];
  }
  return monthUtils.rangeInclusive(
    monthUtils.addMonths(month, 1),
    lastBudgetMonth,
  );
}

/**
 * The total assigned across the given months, as a positive amount.
 *
 * The envelope sheet's `total-budgeted` cell is the negated sum of the
 * categories' assigned amounts (it is added to `to-budget`), so assigning
 * $500 makes it −500.
 */
export function sumAssigned(totalBudgetedCells: number[]): number {
  return totalBudgetedCells.reduce((total, cell) => total - cell, 0);
}

/**
 * How much the money assigned in later months takes off this month's Ready
 * to Assign.
 *
 * Money held for next month already left this month's `to-budget` and is
 * carried forward, so later assignments draw on it first and are only taken
 * off again beyond it. A net unassignment in later months stays with those
 * months (Actual hands it to them, not to this month), so the result is
 * never negative.
 */
export function getFutureAssignedDeduction(
  futureAssigned: number,
  heldForNextMonth: number,
): number {
  return Math.max(0, futureAssigned - Math.max(0, heldForNextMonth));
}
