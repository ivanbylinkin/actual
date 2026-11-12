import * as monthUtils from '@actual-app/core/shared/months';

/** How many months the quick-assign averages look back over */
export const AVERAGE_MONTHS = 3;

/**
 * The months an average is taken over, newest first. They end at the month
 * before `month`, or before the current month when `month` is in the future,
 * which is the same window Actual's own "set to average" action starts from.
 */
export function getAverageMonths(
  month: string,
  currentMonth: string,
  count = AVERAGE_MONTHS,
): string[] {
  const previous = monthUtils.prevMonth(month);
  const newest =
    previous >= currentMonth ? monthUtils.prevMonth(currentMonth) : previous;

  return Array.from({ length: count }, (_, index) =>
    monthUtils.subMonths(newest, index),
  );
}

/**
 * The mean of the amounts, rounded to a whole minor unit, or null while any
 * of them is still loading.
 */
export function getAverageAmount(amounts: Array<number | null>) {
  if (amounts.some(amount => amount == null)) {
    return null;
  }
  if (amounts.length === 0) {
    return 0;
  }
  const total = amounts.reduce<number>((sum, amount) => sum + (amount ?? 0), 0);
  return Math.round(total / amounts.length);
}

/**
 * What to assign to cover a month's spending again, or null while the
 * activity is still loading. Activity is negative for spending; a month that
 * netted out as a refund needs nothing.
 */
export function getSpentAmount(activity: number | null) {
  return activity == null ? null : Math.max(0, -activity);
}
