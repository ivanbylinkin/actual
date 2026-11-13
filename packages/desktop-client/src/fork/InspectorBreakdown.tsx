import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { useEnvelopeSheetValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import { AvailablePill } from '#fork/AvailablePill';
import { InspectorAmountRow } from '#fork/InspectorAmountRow';
import { InspectorSection } from '#fork/InspectorSection';
import { useLocale } from '#hooks/useLocale';
import { envelopeBudget } from '#spreadsheet/bindings';

type InspectorBreakdownProps = {
  category: CategoryEntity;
  month: string;
};

/**
 * How the available balance comes about: what was carried over from last
 * month, plus what was assigned, plus this month's activity.
 */
export function InspectorBreakdown({
  category,
  month,
}: InspectorBreakdownProps) {
  const locale = useLocale();
  const assigned =
    useEnvelopeSheetValue(envelopeBudget.catBudgeted(category.id)) ?? 0;
  const activity =
    useEnvelopeSheetValue(envelopeBudget.catSumAmount(category.id)) ?? 0;
  const available =
    useEnvelopeSheetValue(envelopeBudget.catBalance(category.id)) ?? 0;
  // The budget sheet defines available as carried over + assigned + activity,
  // so the carried-over part is whatever the other two don't account for
  const carriedOver = available - assigned - activity;

  const monthName = monthUtils.format(month, 'MMMM', locale);
  const prevMonthName = monthUtils.format(
    monthUtils.prevMonth(month),
    'MMMM',
    locale,
  );

  return (
    <InspectorSection title={<Trans>Available balance</Trans>}>
      <InspectorAmountRow
        label={<Trans>Carried over from {{ prevMonthName }}</Trans>}
        amount={carriedOver}
      />
      <InspectorAmountRow
        label={<Trans>Assigned in {{ monthName }}</Trans>}
        amount={assigned}
      />
      <InspectorAmountRow label={<Trans>Activity</Trans>} amount={activity} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 4,
          paddingTop: 10,
          borderTop: `1px solid ${theme.tableBorder}`,
        }}
      >
        <Text style={{ fontWeight: 600 }}>
          <Trans>Available</Trans>
        </Text>
        <AvailablePill
          category={category}
          isDisabled
          balance={envelopeBudget.catBalance(category.id)}
          carryover={envelopeBudget.catCarryover(category.id)}
          goal={envelopeBudget.catGoal(category.id)}
          budgeted={envelopeBudget.catBudgeted(category.id)}
          longGoal={envelopeBudget.catLongGoal(category.id)}
        />
      </View>
    </InspectorSection>
  );
}
