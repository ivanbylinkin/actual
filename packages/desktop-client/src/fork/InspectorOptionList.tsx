import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

export type InspectorOption = {
  key: string;
  label: string;
  /**
   * What will be assigned, shown beside the label: null while it loads,
   * undefined when Actual works it out and it isn't known beforehand
   */
  amount?: number | null;
  isDisabled?: boolean;
  onPress: () => void;
};

type InspectorOptionListProps = {
  options: InspectorOption[];
  /** Data attribute naming each option, for tests */
  dataAttribute: 'data-quick-assign' | 'data-auto-assign';
  isTouch?: boolean;
};

/**
 * Full-width rows of one-tap budget actions, each with the amount it will
 * assign. Sits at the bottom of an `InspectorSection`, edge to edge.
 */
export function InspectorOptionList({
  options,
  dataAttribute,
  isTouch = false,
}: InspectorOptionListProps) {
  const format = useFormat();

  return (
    <View
      style={{
        margin: '0 -16px',
        borderTop: `1px solid ${theme.tableBorder}`,
      }}
    >
      {options.map(option => (
        <Button
          key={option.key}
          variant="bare"
          {...{ [dataAttribute]: option.key }}
          isDisabled={option.isDisabled || option.amount === null}
          onPress={option.onPress}
          style={{
            justifyContent: 'space-between',
            gap: 12,
            minHeight: isTouch ? 44 : 34,
            padding: '0 16px',
            borderRadius: 0,
            borderBottom: `1px solid ${theme.tableBorder}`,
          }}
        >
          <Text style={{ textAlign: 'left' }}>{option.label}</Text>
          {option.amount != null && (
            <PrivacyFilter>
              <FinancialText style={{ whiteSpace: 'nowrap' }}>
                {format(option.amount, 'financial')}
              </FinancialText>
            </PrivacyFilter>
          )}
        </Button>
      ))}
    </View>
  );
}
