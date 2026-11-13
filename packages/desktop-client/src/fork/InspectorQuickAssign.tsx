import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { InspectorOptionList } from '#fork/InspectorOptionList';
import type { InspectorOption } from '#fork/InspectorOptionList';
import { InspectorSection } from '#fork/InspectorSection';
import {
  getAverageAmount,
  getAverageMonths,
  getSpentAmount,
} from '#fork/lib/quickAssign';
import { useCategoryTarget } from '#fork/lib/targetProgress';
import { useMonthSheetValue } from '#fork/lib/useMonthSheetValue';
import { useUndo } from '#hooks/useUndo';
import { envelopeBudget } from '#spreadsheet/bindings';

type InspectorQuickAssignProps = {
  category: CategoryEntity;
  month: string;
  onBudgetAction: (month: string, action: string, args?: unknown) => void;
  isTouch?: boolean;
};

/**
 * One-tap ways to set this month's assigned amount. Three run Actual's own
 * budget actions; "spent last month" and "average assigned" have no action
 * of their own, so they read earlier months from the budget sheet and set
 * the amount through the ordinary `budget-amount` action.
 */
export function InspectorQuickAssign({
  category,
  month,
  onBudgetAction,
  isTouch = false,
}: InspectorQuickAssignProps) {
  const { t } = useTranslation();
  const { showUndoNotification } = useUndo();
  const target = useCategoryTarget(category);

  const assigned = envelopeBudget.catBudgeted(category.id);
  const activity = envelopeBudget.catSumAmount(category.id);
  const lastMonth = monthUtils.prevMonth(month);
  const [firstMonth, secondMonth, thirdMonth] = getAverageMonths(
    month,
    monthUtils.currentMonth(),
  );

  const assignedLastMonth = useMonthSheetValue(lastMonth, assigned);
  const spentLastMonth = getSpentAmount(
    useMonthSheetValue(lastMonth, activity),
  );
  const averageAssigned = getAverageAmount([
    useMonthSheetValue(firstMonth, assigned),
    useMonthSheetValue(secondMonth, assigned),
    useMonthSheetValue(thirdMonth, assigned),
  ]);

  const run = (action: string, message: string) => {
    onBudgetAction(month, action, { category: category.id });
    showUndoNotification({ message });
  };

  const assign = (amount: number | null, message: string) => {
    // Never assign a placeholder: the amount must have loaded first
    if (amount == null) {
      return;
    }
    onBudgetAction(month, 'budget-amount', { category: category.id, amount });
    showUndoNotification({ message });
  };

  const options: InspectorOption[] = [
    {
      key: 'assigned-last-month',
      label: t('Assigned last month'),
      amount: assignedLastMonth,
      onPress: () =>
        run('copy-single-last', t('Assigned what was assigned last month.')),
    },
    {
      key: 'spent-last-month',
      label: t('Spent last month'),
      amount: spentLastMonth,
      onPress: () =>
        assign(spentLastMonth, t('Assigned what was spent last month.')),
    },
    {
      key: 'average-assigned',
      label: t('Average assigned'),
      amount: averageAssigned,
      onPress: () =>
        assign(averageAssigned, t('Assigned the 3-month average assigned.')),
    },
    {
      key: 'average-spent',
      label: t('Average spent'),
      onPress: () =>
        run('set-single-3-avg', t('Assigned the 3-month average spent.')),
    },
    ...(target && !target.isFunded
      ? [
          {
            key: 'fund-target',
            label: t('Fund the target'),
            // A long goal is met by the balance, so there is no single
            // amount to show for it
            ...(!target.isLongGoal && { amount: target.goal }),
            onPress: () =>
              run('apply-single-category-template', t('Target funded.')),
          },
        ]
      : []),
  ];

  return (
    <InspectorSection title={<Trans>Quick assign</Trans>}>
      <View style={{ marginBottom: -16 }}>
        <InspectorOptionList
          options={options}
          dataAttribute="data-quick-assign"
          isTouch={isTouch}
        />
      </View>
      <Text
        style={{
          display: 'block',
          marginTop: 24,
          fontSize: 12,
          color: theme.pageTextLight,
        }}
      >
        <Trans>Averages are taken over the last 3 months.</Trans>
      </Text>
    </InspectorSection>
  );
}
