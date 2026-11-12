import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDelete } from '@actual-app/components/icons/v0';
import { styles } from '@actual-app/components/styles';
import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { CategoryInspectorBody } from '#fork/CategoryInspectorBody';

const INSPECTOR_WIDTH = 320;

type CategoryInspectorPanelProps = {
  category: CategoryEntity;
  month: string;
  onBudgetAction: (month: string, action: string, args?: unknown) => void;
  onClose: () => void;
  /** Float over the budget instead of taking width from it */
  isOverlay?: boolean;
};

/** The desktop inspector: a panel to the right of the budget table. */
export function CategoryInspectorPanel({
  category,
  month,
  onBudgetAction,
  onClose,
  isOverlay = false,
}: CategoryInspectorPanelProps) {
  const { t } = useTranslation();

  return (
    <View
      role="complementary"
      aria-label={t('Category inspector')}
      data-testid="category-inspector"
      onKeyDown={event => {
        if (event.key === 'Escape') {
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
          padding: '12px 10px 12px 16px',
        }}
      >
        <TextOneLine style={{ fontSize: 16, fontWeight: 600 }}>
          {category.name}
        </TextOneLine>
        <Button
          variant="bare"
          aria-label={t('Close inspector')}
          onPress={onClose}
          style={{ flexShrink: 0, padding: 7 }}
        >
          <SvgDelete width={10} height={10} />
        </Button>
      </View>
      <View style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <CategoryInspectorBody
          category={category}
          month={month}
          onBudgetAction={onBudgetAction}
        />
      </View>
    </View>
  );
}
