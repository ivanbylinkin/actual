import type { CategoryEntity } from '@actual-app/core/types/models';
import type { Template } from '@actual-app/core/types/models/templates';

/**
 * A category's target definitions, as stored in its `goal_def`. Anything
 * unreadable counts as no targets.
 */
export function parseGoalDef(goalDef: string | null | undefined): Template[] {
  if (!goalDef) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(goalDef);
    return Array.isArray(parsed) ? (parsed as Template[]) : [];
  } catch {
    return [];
  }
}

/** Income categories only take targets in tracking budgets, as in Actual. */
export function acceptsTargets(
  category: Pick<CategoryEntity, 'is_income'>,
  budgetType: string,
) {
  return budgetType === 'tracking' || !category.is_income;
}

export type CategoryGoal = {
  goal: number | null;
  /** 1 for a long goal (save up a balance), else null, as in the sheet */
  longGoal: 1 | null;
};

/**
 * The target that applies to a month. A month only stores a target once its
 * templates are applied (or the target is saved while viewing it), so a new
 * month has none; the projected target fills that gap until then.
 */
export function resolveCategoryGoal(
  stored: CategoryGoal,
  projected: CategoryGoal | null | undefined,
): CategoryGoal {
  if (stored.goal != null) {
    return stored;
  }
  return projected ?? stored;
}
