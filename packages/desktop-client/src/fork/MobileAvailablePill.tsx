import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgArrowThickRight } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { View } from '@actual-app/components/view';
import type { CategoryEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';
import { AutoTextSize } from 'auto-text-size';

import {
  getColumnWidth,
  PILL_STYLE,
} from '#components/mobile/budget/BudgetTable';
import { PrivacyFilter } from '#components/PrivacyFilter';
import {
  getAvailablePillColors,
  getAvailableStateLabel,
  useAvailableState,
} from '#fork/lib/availableState';
import { useFormat } from '#hooks/useFormat';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { envelopeBudget, trackingBudget } from '#spreadsheet/bindings';

type MobileAvailablePillProps = {
  category: CategoryEntity;
  show3Columns?: boolean;
  onPress?: () => void;
  'aria-label': string;
};

/**
 * The mobile budget list's available balance: the same filled pill as on
 * desktop, sized to its column and tappable.
 */
export function MobileAvailablePill({
  category,
  show3Columns,
  onPress,
  'aria-label': ariaLabel,
}: MobileAvailablePillProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const bindings = budgetType === 'tracking' ? trackingBudget : envelopeBudget;
  const columnWidth = getColumnWidth({ show3Columns });

  const { state, balanceValue, hasCarryover } = useAvailableState(category, {
    balance: bindings.catBalance(category.id),
    carryover: bindings.catCarryover(category.id),
    goal: bindings.catGoal(category.id),
    budgeted: bindings.catBudgeted(category.id),
    longGoal: bindings.catLongGoal(category.id),
  });
  const pillColors = getAvailablePillColors(state);

  return (
    <View style={{ position: 'relative', maxWidth: columnWidth }}>
      <Button
        variant="bare"
        data-available-state={state}
        style={{
          ...PILL_STYLE,
          ...pillColors,
          maxWidth: columnWidth,
          paddingLeft: 9,
          paddingRight: 9,
        }}
        onPress={onPress}
        aria-label={t('{{label}}, {{status}}', {
          label: ariaLabel,
          status: getAvailableStateLabel(state, t),
        })}
      >
        <PrivacyFilter>
          <AutoTextSize
            key={balanceValue}
            as={Text}
            minFontSizePx={6}
            maxFontSizePx={12}
            mode="oneline"
            className={css({
              ...styles.tnum,
              maxWidth: columnWidth,
              textAlign: 'right',
              fontSize: 12,
              fontWeight: 500,
            })}
          >
            {format(balanceValue, 'financial')}
          </AutoTextSize>
        </PrivacyFilter>
      </Button>
      {hasCarryover && (
        <View
          role="img"
          aria-label={t('Overspending rolls over')}
          style={{
            position: 'absolute',
            right: -3,
            // The button is taller than the visible pill (see PILL_STYLE)
            top: 5,
            borderRadius: '50%',
            backgroundColor: pillColors.color,
          }}
        >
          <SvgArrowThickRight
            width={11}
            height={11}
            style={{ color: pillColors.backgroundColor }}
          />
        </View>
      )}
    </View>
  );
}
