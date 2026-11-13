import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDelete } from '@actual-app/components/icons/v0';
import { styles } from '@actual-app/components/styles';
import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { InspectorMonthSwitcher } from '#fork/InspectorMonthSwitcher';

const INSPECTOR_WIDTH = 320;

type InspectorPanelProps = {
  title: string;
  /** Without it the panel has no close button */
  onClose?: () => void;
  /** Float over the budget instead of taking width from it */
  isOverlay?: boolean;
  testId: string;
  children: ReactNode;
};

/**
 * The frame of the desktop inspector: a panel to the right of the budget
 * table with a title, the month it describes and a scrolling body.
 */
export function InspectorPanel({
  title,
  onClose,
  isOverlay = false,
  testId,
  children,
}: InspectorPanelProps) {
  const { t } = useTranslation();

  return (
    <View
      role="complementary"
      aria-label={t('Inspector: {{title}}', { title })}
      data-testid={testId}
      onKeyDown={event => {
        if (event.key === 'Escape' && onClose) {
          onClose();
        }
      }}
      style={{
        width: INSPECTOR_WIDTH,
        flexShrink: 0,
        margin: '5px 0 8px 8px',
        backgroundColor: theme.tableBackground,
        color: theme.tableText,
        border: `1px solid ${theme.tableBorder}`,
        borderRadius: 6,
        overflow: 'hidden',
        ...(isOverlay && {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          ...styles.shadowLarge,
        }),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexShrink: 0,
          minHeight: 30,
          padding: '12px 10px 12px 16px',
        }}
      >
        <TextOneLine style={{ fontSize: 16, fontWeight: 600 }}>
          {title}
        </TextOneLine>
        {onClose && (
          <Button
            variant="bare"
            aria-label={t('Close inspector')}
            onPress={onClose}
            style={{ flexShrink: 0, padding: 7 }}
          >
            <SvgDelete width={10} height={10} />
          </Button>
        )}
      </View>
      <InspectorMonthSwitcher />
      <View style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {children}
      </View>
    </View>
  );
}
