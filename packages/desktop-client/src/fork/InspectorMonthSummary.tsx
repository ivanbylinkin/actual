import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useEnvelopeSheetValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { InspectorAmountRow } from '#fork/InspectorAmountRow';
import { InspectorSection } from '#fork/InspectorSection';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { envelopeBudget } from '#spreadsheet/bindings';

type InspectorMonthSummaryProps = {
  month: string;
};

/**
 * The month across all categories, laid out like a category's breakdown:
 * carried over + assigned + activity = available.
 */
export function InspectorMonthSummary({ month }: InspectorMonthSummaryProps) {
  const format = useFormat();
  const locale = useLocale();
  // Assigned is stored negated (it is added to Ready to Assign)
  const assigned = -(useEnvelopeSheetValue(envelopeBudget.totalBudgeted) ?? 0);
  const activity = useEnvelopeSheetValue(envelopeBudget.totalSpent) ?? 0;
  const available = useEnvelopeSheetValue(envelopeBudget.totalBalance) ?? 0;
  const carriedOver = available - assigned - activity;

  const monthName = monthUtils.format(month, 'MMMM', locale);
  const prevMonthName = monthUtils.format(
    monthUtils.prevMonth(month),
    'MMMM',
    locale,
  );

  return (
    <InspectorSection title={<Trans>Available in {{ monthName }}</Trans>}>
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
          alignItems: 'baseline',
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
        <PrivacyFilter>
          <FinancialText
            style={{
              fontWeight: 600,
              color: available < 0 ? theme.errorText : undefined,
            }}
          >
            {format(available, 'financial')}
          </FinancialText>
        </PrivacyFilter>
      </View>
    </InspectorSection>
  );
}
