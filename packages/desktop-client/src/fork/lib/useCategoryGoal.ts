import { useState } from 'react';

import { send } from '@actual-app/core/platform/client/connection';
import type { CategoryEntity } from '@actual-app/core/types/models';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useEnvelopeSheetValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import {
  acceptsTargets,
  parseGoalDef,
  resolveCategoryGoal,
} from '#fork/lib/categoryGoal';
import type { CategoryGoal } from '#fork/lib/categoryGoal';
import { monthFromSheetName } from '#fork/lib/futureAssigned';
import { useSheetName } from '#hooks/useSheetName';
import { useSheetValue } from '#hooks/useSheetValue';
import { useSyncedPref } from '#hooks/useSyncedPref';
import type { Binding } from '#spreadsheet';
import { envelopeBudget } from '#spreadsheet/bindings';

type BudgetSheet = 'envelope-budget' | 'tracking-budget';

export type CategoryGoalBindings = {
  goal: Binding<BudgetSheet, 'goal'>;
  longGoal: Binding<BudgetSheet, 'long-goal'>;
};

/**
 * A category's target for the month of the surrounding sheet.
 *
 * Actual stores a target per month, and only once that month's templates
 * are applied, so on the first of the month every target would vanish. When
 * the month has none stored, this asks Actual what the category's templates
 * would ask for (the same dry run the target editor shows) without changing
 * the budget.
 */
export function useCategoryGoal(
  category: Pick<CategoryEntity, 'id' | 'is_income' | 'goal_def'>,
  bindings: CategoryGoalBindings,
): CategoryGoal {
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const { sheetName, fullSheetName } = useSheetName(bindings.goal);
  const month = monthFromSheetName(sheetName);

  // useSheetValue gives null both while loading and for an empty cell; the
  // change callback tells them apart, so nothing is projected for a month
  // whose stored target simply hasn't arrived yet
  const [loadedCell, setLoadedCell] = useState<string | null>(null);
  const storedGoal = useSheetValue(bindings.goal, () =>
    setLoadedCell(fullSheetName),
  );
  const storedLongGoal = useSheetValue(bindings.longGoal);
  const isStoredGoalLoaded = loadedCell === fullSheetName;

  // "Refill up to" and similar targets depend on what last month left over.
  // A month's balance is carried over + assigned + activity, so what came
  // in from last month is what the other two don't account for. The cell
  // names are the same in both budget types.
  const balance =
    useEnvelopeSheetValue(envelopeBudget.catBalance(category.id)) ?? 0;
  const assigned =
    useEnvelopeSheetValue(envelopeBudget.catBudgeted(category.id)) ?? 0;
  const activity =
    useEnvelopeSheetValue(envelopeBudget.catSumAmount(category.id)) ?? 0;
  const carriedOver = balance - assigned - activity;

  const templates = parseGoalDef(category.goal_def);
  const shouldProject =
    month != null &&
    isStoredGoalLoaded &&
    storedGoal == null &&
    templates.length > 0 &&
    acceptsTargets(category, budgetType);

  const { data: projected } = useQuery({
    queryKey: [
      'fork',
      'projected-goal',
      category.id,
      month,
      category.goal_def,
      carriedOver,
    ],
    queryFn: async (): Promise<CategoryGoal | null> => {
      if (!month) {
        return null;
      }
      const result = await send('budget/dry-run-category-template', {
        month,
        categoryId: category.id,
        templates,
      });
      if (result.errors.length > 0) {
        return null;
      }
      return { goal: result.goal, longGoal: result.longGoal ? 1 : null };
    },
    enabled: shouldProject,
    staleTime: 30_000,
    // Keep showing the last projection while an edit works out the next one,
    // so pills and bars don't flicker
    placeholderData: keepPreviousData,
  });

  return resolveCategoryGoal(
    { goal: storedGoal, longGoal: storedLongGoal === 1 ? 1 : null },
    shouldProject ? projected : null,
  );
}
