import type { CSSProperties, MouseEventHandler } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';

import { TotalsList } from '#components/budget/envelope/budgetsummary/TotalsList';
import {
  useEnvelopeSheetName,
  useEnvelopeSheetValue,
} from '#components/budget/envelope/EnvelopeBudgetComponents';
import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import {
  getReadyToAssignColors,
  getReadyToAssignState,
  getReadyToAssignStatus,
} from '#fork/lib/readyToAssign';
import { useFormat } from '#hooks/useFormat';
import { envelopeBudget } from '#spreadsheet/bindings';

type ReadyToAssignBannerProps = {
  prevMonthName: string;
  style?: CSSProperties;
  /** Accepted so this drops in where `ToBudgetAmount` was; not used */
  amountStyle?: CSSProperties;
  onClick?: () => void;
  onContextMenu?: MouseEventHandler;
  isTotalsListTooltipDisabled?: boolean;
  /** One line instead of two, for the collapsed month summary */
  isCompact?: boolean;
};

/**
 * The amount still to be assigned, as a filled banner: green when there is
 * money waiting, red when more is assigned than there is, grey at zero.
 * Takes the same props as upstream's `ToBudgetAmount`.
 */
export function ReadyToAssignBanner({
  prevMonthName,
  style,
  onClick,
  onContextMenu,
  isTotalsListTooltipDisabled = false,
  isCompact = false,
}: ReadyToAssignBannerProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { fullSheetName } = useEnvelopeSheetName(envelopeBudget.toBudget);
  const amount = useEnvelopeSheetValue(envelopeBudget.toBudget) ?? 0;
  const state = getReadyToAssignState(amount);

  const content = (
    <>
      <PrivacyFilter>
        <FinancialText
          data-cellname={fullSheetName}
          style={{ fontSize: isCompact ? 17 : 26, fontWeight: 700 }}
        >
          {format(amount, 'financial')}
        </FinancialText>
      </PrivacyFilter>
      <View style={{ alignItems: isCompact ? 'flex-end' : 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: 600 }}>
          <Trans>Ready to Assign</Trans>
        </Text>
        {!isCompact && (
          <Text style={{ fontSize: 12 }}>
            {getReadyToAssignStatus(state, t)}
          </Text>
        )}
      </View>
    </>
  );

  const bannerStyle: CSSProperties = {
    ...getReadyToAssignColors(state),
    flexDirection: isCompact ? 'row-reverse' : 'column',
    alignItems: 'center',
    justifyContent: isCompact ? 'space-between' : 'center',
    gap: isCompact ? 10 : 2,
    padding: isCompact ? '6px 12px' : '10px 16px',
    borderRadius: 8,
    lineHeight: 1.3,
  };

  return (
    <View
      data-ready-to-assign-state={state}
      style={{ alignSelf: 'stretch', padding: '0 13px', ...style }}
    >
      <Tooltip
        content={
          <TotalsList prevMonthName={prevMonthName} style={{ padding: 7 }} />
        }
        placement="bottom"
        offset={3}
        triggerProps={{ isDisabled: isTotalsListTooltipDisabled }}
      >
        {onClick ? (
          <Button
            variant="bare"
            onPress={onClick}
            onContextMenu={onContextMenu}
            style={{ ...bannerStyle, display: 'flex', width: '100%' }}
          >
            {content}
          </Button>
        ) : (
          <View style={bannerStyle}>{content}</View>
        )}
      </Tooltip>
    </View>
  );
}
