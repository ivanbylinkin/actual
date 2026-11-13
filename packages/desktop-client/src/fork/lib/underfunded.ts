import type { CategoryEntity } from '@actual-app/core/types/models';

import type { CategoryTarget } from '#fork/lib/targetProgress';

/** What each category's target still needs this month, by category id */
export type Shortfalls = Record<CategoryEntity['id'], number>;

/**
 * What filling a target by assigning would add. A long goal saves up a
 * balance and assigning its templates doesn't aim at it, so it adds nothing.
 */
export function getAssignableShortfall(target: CategoryTarget | null) {
  if (!target || target.isLongGoal) {
    return 0;
  }
  return target.shortfall;
}

/** The categories still short of their target, and how much they need. */
export function summarizeShortfalls(shortfalls: Shortfalls) {
  const categoryIds = Object.keys(shortfalls).filter(id => shortfalls[id] > 0);
  const total = categoryIds.reduce((sum, id) => sum + shortfalls[id], 0);
  return { categoryIds, total };
}

/** The shortfalls with one category's updated, or the same object. */
export function withShortfall(
  shortfalls: Shortfalls,
  categoryId: CategoryEntity['id'],
  shortfall: number | null,
): Shortfalls {
  if (shortfall == null || shortfall <= 0) {
    if (!(categoryId in shortfalls)) {
      return shortfalls;
    }
    const { [categoryId]: _removed, ...rest } = shortfalls;
    return rest;
  }
  if (shortfalls[categoryId] === shortfall) {
    return shortfalls;
  }
  return { ...shortfalls, [categoryId]: shortfall };
}
