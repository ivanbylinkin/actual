import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgCheveronRight } from '@actual-app/components/icons/v1';
import { Text } from '@actual-app/components/text';
import { View } from '@actual-app/components/view';

import { useEnvelopeSheetValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import {
  getReadyToAssignColors,
  getReadyToAssignState,
} from '#fork/lib/readyToAssign';
import { useFormat } from '#hooks/useFormat';
import { envelopeBudget } from '#spreadsheet/bindings';

type MobileReadyToAssignBannerProps = {
  /** Opens the budget summary sheet, where the money can be assigned */
  onPress: () => void;
};

/**
 * The amount still to be assigned, across the top of the mobile budget. The
 * sign carries the state alongside the colour. Must sit inside the month's
 * `SheetNameProvider`.
 */
export function MobileReadyToAssignBanner({
  onPress,
}: MobileReadyToAssignBannerProps) {
  const format = useFormat();
  const amount = useEnvelopeSheetValue(envelopeBudget.toBudget) ?? 0;
  const state = getReadyToAssignState(amount);

  return (
    <View style={{ flexShrink: 0, padding: '8px 5px 0' }}>
      <Button
        variant="bare"
        data-ready-to-assign-state={state}
        onPress={onPress}
        style={{
          ...getReadyToAssignColors(state),
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          minHeight: 52,
          padding: '8px 10px 8px 16px',
          borderRadius: 10,
          textAlign: 'left',
        }}
      >
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 15,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <Trans>Ready to Assign</Trans>
        </Text>
        <PrivacyFilter>
          <FinancialText style={{ fontSize: 22, fontWeight: 700 }}>
            {format(amount, 'financial')}
          </FinancialText>
        </PrivacyFilter>
        <SvgCheveronRight width={16} height={16} style={{ flexShrink: 0 }} />
      </Button>
    </View>
  );
}
