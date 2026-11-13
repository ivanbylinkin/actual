import type { CategoryEntity } from '@actual-app/core/types/models';

import { getGoalDifference, getGoalProgress } from '#components/budget/util';
import { acceptsTargets } from '#fork/lib/categoryGoal';
import { useCategoryGoal } from '#fork/lib/useCategoryGoal';
import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useFormat } from '#hooks/useFormat';
import { useSheetValue } from '#hooks/useSheetValue';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { envelopeBudget, trackingBudget } from '#spreadsheet/bindings';

type BudgetSheet = 'envelope-budget' | 'tracking-budget';

export type CategoryTarget = {
  /** The target amount */
  goal: number;
  /** What counts towards it: the balance for a long goal, else the amount assigned */
  have: number;
  /** Whole percentage funded, 100 only once the target is met */
  progress: number;
  isFunded: boolean;
  /** How much is still missing, 0 once funded */
  shortfall: number;
  /** A long goal saves up a balance; other targets are met by assigning */
  isLongGoal: boolean;
};

/**
 * Sums up a target from the sheet values. Amounts compare as displayed, the
 * same way the pills and upstream's goal status do.
 */
export function getCategoryTarget(
  goal: number,
  have: number,
  isLongGoal: boolean,
  decimalPlaces = 2,
): CategoryTarget {
  const difference = getGoalDifference(have, goal, decimalPlaces);
  return {
    goal,
    have,
    progress: getGoalProgress(have, goal, decimalPlaces),
    isFunded: difference >= 0,
    shortfall: difference < 0 ? -difference : 0,
    isLongGoal,
  };
}

/**
 * A category's target for the month of the surrounding sheet, or null when
 * it has none: no goal template, goal templates turned off, or an income
 * category in an envelope budget. A month whose templates haven't been
 * applied yet shows the target they project.
 */
export function useCategoryTarget(
  category: Pick<CategoryEntity, 'id' | 'is_income' | 'goal_def'>,
): CategoryTarget | null {
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const bindings = budgetType === 'tracking' ? trackingBudget : envelopeBudget;
  const isGoalTemplatesEnabled = useFeatureFlag('goalTemplatesEnabled');
  const { decimalPlaces } = useFormat().currency;

  const { goal, longGoal } = useCategoryGoal(category, {
    goal: bindings.catGoal(category.id),
    longGoal: bindings.catLongGoal(category.id),
  });
  const budgeted =
    useSheetValue<BudgetSheet, 'budget'>(bindings.catBudgeted(category.id)) ??
    0;
  const balance =
    useSheetValue<BudgetSheet, 'leftover'>(bindings.catBalance(category.id)) ??
    0;

  const hasTarget =
    isGoalTemplatesEnabled &&
    goal != null &&
    acceptsTargets(category, budgetType);
  if (!hasTarget) {
    return null;
  }

  const isLongGoal = longGoal === 1;
  return getCategoryTarget(
    goal,
    isLongGoal ? balance : budgeted,
    isLongGoal,
    decimalPlaces,
  );
}
