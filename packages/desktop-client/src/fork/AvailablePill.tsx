import { useTranslation } from 'react-i18next';

import { SvgArrowThinRight } from '@actual-app/components/icons/v1';
import { css } from '@emotion/css';

import { CellValueText } from '#components/spreadsheet/CellValue';
import {
  getAvailablePillColors,
  getAvailableStateLabel,
  useAvailableState,
} from '#fork/lib/availableState';
import type { AvailableBindings } from '#fork/lib/availableState';
import { useSheetName } from '#hooks/useSheetName';

type AvailablePillProps = AvailableBindings & {
  /** Without a menu behind it the pill is not clickable */
  isDisabled?: boolean;
};

/**
 * A category's available balance as a filled pill: green when there is money
 * to spend, amber while its target is underfunded, red when overspent and
 * grey when empty. An arrow marks overspending that rolls over.
 */
export function AvailablePill({ isDisabled, ...bindings }: AvailablePillProps) {
  const { t } = useTranslation();
  const { fullSheetName } = useSheetName(bindings.balance);
  const { state, balanceValue, hasCarryover } = useAvailableState(bindings);

  return (
    <span
      data-available-state={state}
      title={getAvailableStateLabel(state, t)}
      className={css({
        ...getAvailablePillColors(state),
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        minWidth: 0,
        maxWidth: '100%',
        padding: '2px 9px',
        borderRadius: 999,
        fontWeight: 500,
        lineHeight: '18px',
        overflow: 'hidden',
        transition: 'box-shadow .15s',
        ...(!isDisabled && {
          cursor: 'pointer',
          ':hover': { boxShadow: 'inset 0 0 0 1px currentColor' },
        }),
      })}
    >
      <CellValueText
        type="financial"
        name={fullSheetName}
        value={balanceValue}
        style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      />
      {hasCarryover && (
        <SvgArrowThinRight
          width={7}
          height={7}
          role="img"
          aria-label={t('Overspending rolls over')}
          style={{ flexShrink: 0 }}
        />
      )}
    </span>
  );
}
