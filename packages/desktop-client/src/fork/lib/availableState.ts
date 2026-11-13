import { theme } from '@actual-app/components/theme';
import type { CategoryEntity } from '@actual-app/core/types/models';
import type { TFunction } from 'i18next';

import { getGoalDifference } from '#components/budget/util';
import { useCategoryGoal } from '#fork/lib/useCategoryGoal';
import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useFormat } from '#hooks/useFormat';
import { useSheetValue } from '#hooks/useSheetValue';
import type { Binding } from '#spreadsheet';

type BudgetSheet = 'envelope-budget' | 'tracking-budget';

export type AvailableState = 'overspent' | 'underfunded' | 'zero' | 'funded';

export type AvailableBindings = {
  balance: Binding<BudgetSheet, 'leftover'>;
  carryover: Binding<BudgetSheet, 'carryover'>;
  goal: Binding<BudgetSheet, 'goal'>;
  budgeted: Binding<BudgetSheet, 'budget'>;
  longGoal: Binding<BudgetSheet, 'long-goal'>;
};

/**
 * Which pill a category's available balance gets. Amounts compare as they
 * are displayed, so a balance that rounds to zero counts as zero.
 *
 * Overspending wins over everything, then an unmet target, then an empty
 * balance; anything left has money in it and no unmet target.
 */
export function getAvailableState(
  balance: number | null | undefined,
  goal: number | null | undefined,
  have: number | null | undefined,
  decimalPlaces = 2,
): AvailableState {
  const displayedBalance = getGoalDifference(balance, 0, decimalPlaces);

  if (displayedBalance < 0) {
    return 'overspent';
  }
  if (goal != null && getGoalDifference(have, goal, decimalPlaces) < 0) {
    return 'underfunded';
  }
  if (displayedBalance === 0) {
    return 'zero';
  }
  return 'funded';
}

type PillColors = { backgroundColor: string; color: string };

const pillColors: Record<AvailableState, PillColors> = {
  funded: {
    backgroundColor: theme.availableFundedBackground,
    color: theme.availableFundedText,
  },
  underfunded: {
    backgroundColor: theme.availableUnderfundedBackground,
    color: theme.availableUnderfundedText,
  },
  overspent: {
    backgroundColor: theme.availableOverspentBackground,
    color: theme.availableOverspentText,
  },
  zero: {
    backgroundColor: theme.availableZeroBackground,
    color: theme.availableZeroText,
  },
};

export function getAvailablePillColors(state: AvailableState): PillColors {
  return pillColors[state];
}

/** The state in words, for assistive technology and tooltips. */
export function getAvailableStateLabel(state: AvailableState, t: TFunction) {
  switch (state) {
    case 'overspent':
      return t('Overspent');
    case 'underfunded':
      return t('Target underfunded');
    case 'zero':
      return t('Nothing available');
    default:
      return t('Funded');
  }
}

/**
 * Reads a category's balance and target from the budget sheet and works out
 * its pill state. Targets only count while goal templates are enabled; a
 * month with no stored target uses the one its templates project.
 */
export function useAvailableState(
  category: Pick<CategoryEntity, 'id' | 'is_income' | 'goal_def'>,
  { balance, carryover, goal, budgeted, longGoal }: AvailableBindings,
) {
  const balanceValue = useSheetValue(balance) ?? 0;
  const hasCarryover = !!useSheetValue(carryover);
  const { goal: goalValue, longGoal: longGoalValue } = useCategoryGoal(
    category,
    { goal, longGoal },
  );
  const budgetedValue = useSheetValue(budgeted) ?? 0;
  const isGoalTemplatesEnabled = useFeatureFlag('goalTemplatesEnabled');
  const { decimalPlaces } = useFormat().currency;

  // Long goals count the balance towards the target, others the amount assigned
  const have = longGoalValue === 1 ? balanceValue : budgetedValue;
  const target = isGoalTemplatesEnabled ? goalValue : null;

  return {
    state: getAvailableState(balanceValue, target, have, decimalPlaces),
    balanceValue,
    hasCarryover,
  };
}
