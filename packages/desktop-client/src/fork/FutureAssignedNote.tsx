import type { CSSProperties } from 'react';
import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

type FutureAssignedNoteProps = {
  /** What later months take off Ready to Assign, as a positive amount */
  amount: number;
  style?: CSSProperties;
};

/**
 * "Assigned in future months −$X", under a Ready to Assign amount, so the
 * number explains why it is lower than this month alone would give.
 */
export function FutureAssignedNote({ amount, style }: FutureAssignedNoteProps) {
  const format = useFormat();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        columnGap: 4,
        fontSize: 12,
        ...style,
      }}
    >
      <Text>
        <Trans>Assigned in future months</Trans>
      </Text>
      <PrivacyFilter>
        <FinancialText style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
          {format(-amount, 'financial')}
        </FinancialText>
      </PrivacyFilter>
    </View>
  );
}
