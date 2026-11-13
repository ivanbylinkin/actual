import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { InspectorOptionList } from '#fork/InspectorOptionList';
import type { InspectorOption } from '#fork/InspectorOptionList';
import { InspectorSection } from '#fork/InspectorSection';
import { TargetShortfallProbe } from '#fork/lib/TargetShortfallProbe';
import { summarizeShortfalls, withShortfall } from '#fork/lib/underfunded';
import type { Shortfalls } from '#fork/lib/underfunded';
import { useMonthSheetValue } from '#fork/lib/useMonthSheetValue';
import { useCategories } from '#hooks/useCategories';
import { useUndo } from '#hooks/useUndo';
import { envelopeBudget } from '#spreadsheet/bindings';

type InspectorAutoAssignProps = {
  month: string;
  onBudgetAction: (month: string, action: string, args?: unknown) => void;
};

/**
 * YNAB's Auto-Assign for the whole month. Each option is one of Actual's
 * own budget actions, so each is a single step to undo:
 *
 * - Underfunded: applies the templates of just the categories short of
 *   their target.
 * - Assigned last month, Average spent, Reset: Actual's month actions,
 *   which set every category.
 *
 * YNAB's "spent last month", "average assigned" and "reset available" are
 * left out: Actual has no month-wide action for them, and setting each
 * category one by one would take one undo per category.
 */
export function InspectorAutoAssign({
  month,
  onBudgetAction,
}: InspectorAutoAssignProps) {
  const { t } = useTranslation();
  const { showUndoNotification } = useUndo();
  const { data: { grouped: groups = [] } = {} } = useCategories();
  const [shortfalls, setShortfalls] = useState<Shortfalls>({});

  // Hidden categories are skipped, as Actual's templates skip them
  const categories = groups
    .filter(group => !group.is_income && !group.hidden)
    .flatMap(group => group.categories ?? [])
    .filter(category => !category.hidden);

  const onShortfallChange = (
    categoryId: CategoryEntity['id'],
    shortfall: number | null,
  ) => setShortfalls(current => withShortfall(current, categoryId, shortfall));

  const underfunded = summarizeShortfalls(shortfalls);
  // Assigned is stored negated (it is added to Ready to Assign)
  const lastMonthTotal = useMonthSheetValue(
    monthUtils.prevMonth(month),
    envelopeBudget.totalBudgeted,
  );
  const assignedLastMonth = lastMonthTotal == null ? null : -lastMonthTotal;

  const run = (action: string, message: string, args?: unknown) => {
    onBudgetAction(month, action, args);
    showUndoNotification({ message });
  };

  const options: InspectorOption[] = [
    {
      key: 'underfunded',
      label: t('Underfunded'),
      amount: underfunded.total,
      isDisabled: underfunded.categoryIds.length === 0,
      onPress: () =>
        run(
          'apply-multiple-templates',
          t('Funded the targets of {{count}} categories.', {
            count: underfunded.categoryIds.length,
          }),
          { categories: underfunded.categoryIds },
        ),
    },
    {
      key: 'assigned-last-month',
      label: t('Assigned last month'),
      amount: assignedLastMonth,
      onPress: () =>
        run('copy-last', t('Assigned what was assigned last month.')),
    },
    {
      key: 'average-spent',
      label: t('Average spent'),
      onPress: () => run('set-3-avg', t('Assigned the 3-month average spent.')),
    },
    {
      key: 'reset-assigned',
      label: t('Reset assigned amounts'),
      onPress: () => run('set-zero', t('Reset all assigned amounts to zero.')),
    },
  ];

  return (
    <InspectorSection title={<Trans>Auto-Assign</Trans>}>
      {categories.map(category => (
        <TargetShortfallProbe
          key={category.id}
          category={category}
          onChange={onShortfallChange}
        />
      ))}
      <View style={{ marginBottom: -16 }}>
        <InspectorOptionList
          options={options}
          dataAttribute="data-auto-assign"
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
        <Trans>
          Underfunded tops up only the categories short of their target. The
          others replace the assigned amount of every category.
        </Trans>
      </Text>
    </InspectorSection>
  );
}
