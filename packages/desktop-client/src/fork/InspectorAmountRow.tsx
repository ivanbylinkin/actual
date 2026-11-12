import type { ReactNode } from 'react';

import { Text } from '@actual-app/components/text';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

type InspectorAmountRowProps = {
  label: ReactNode;
  amount: number;
  isEmphasized?: boolean;
};

/** A label with a right-aligned amount, as in a statement. */
export function InspectorAmountRow({
  label,
  amount,
  isEmphasized = false,
}: InspectorAmountRowProps) {
  const format = useFormat();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        fontWeight: isEmphasized ? 600 : 400,
      }}
    >
      <Text style={{ minWidth: 0 }}>{label}</Text>
      <PrivacyFilter>
        <FinancialText style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          {format(amount, 'financial')}
        </FinancialText>
      </PrivacyFilter>
    </View>
  );
}
