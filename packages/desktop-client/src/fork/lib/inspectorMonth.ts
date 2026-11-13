import * as monthUtils from '@actual-app/core/shared/months';

type MonthBounds = { start: string; end: string };

/**
 * The months the desktop budget shows: `numMonths` from `startMonth`,
 * clipped to the budget's bounds, the same range upstream's
 * `MonthsProvider` renders.
 */
export function getVisibleMonths(
  startMonth: string,
  numMonths: number,
  bounds: MonthBounds,
): string[] {
  if (numMonths < 1) {
    return [];
  }
  const endMonth = monthUtils.addMonths(startMonth, numMonths - 1);
  const start = startMonth < bounds.start ? bounds.start : startMonth;
  const end = endMonth > bounds.end ? bounds.end : endMonth;
  return start > end ? [] : monthUtils.rangeInclusive(start, end);
}

/**
 * The month the inspector describes: the one the user picked while it is
 * on screen, else the current month when it is on screen, else the first
 * month shown. `fallback` covers the moment before the table reports its
 * months.
 */
export function getInspectedMonth(
  pickedMonth: string | null,
  visibleMonths: string[],
  currentMonth: string,
  fallback: string,
): string {
  if (pickedMonth && visibleMonths.includes(pickedMonth)) {
    return pickedMonth;
  }
  if (visibleMonths.includes(currentMonth)) {
    return currentMonth;
  }
  return visibleMonths[0] ?? fallback;
}

/**
 * The month on screen before (-1) or after (1) `month`, or null at either
 * end.
 */
export function getAdjacentVisibleMonth(
  month: string,
  visibleMonths: string[],
  direction: -1 | 1,
): string | null {
  const index = visibleMonths.indexOf(month);
  if (index === -1) {
    return null;
  }
  return visibleMonths[index + direction] ?? null;
}
