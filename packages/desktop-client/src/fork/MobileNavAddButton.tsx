import type { ComponentProps, CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import { SvgAdd } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

const BUTTON_SIZE = 52;

type MobileNavAddButtonProps = {
  /** The slot the button is centred in, sized like the tabs beside it */
  style?: CSSProperties;
  onClick: ComponentProps<typeof NavLink>['onClick'];
};

/**
 * The add-transaction button in the middle of the mobile tab bar: a filled
 * circle in the brand colour, so it reads as the one action among the tabs.
 */
export function MobileNavAddButton({
  style,
  onClick,
}: MobileNavAddButtonProps) {
  const { t } = useTranslation();

  return (
    <NavLink
      to="/transactions/new"
      aria-label={t('Add transaction')}
      onClick={onClick}
      style={{
        ...styles.noTapHighlight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
        padding: 0,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: '50%',
          backgroundColor: theme.buttonPrimaryBackground,
          color: theme.buttonPrimaryText,
        }}
      >
        <SvgAdd width={22} height={22} />
      </span>
    </NavLink>
  );
}
