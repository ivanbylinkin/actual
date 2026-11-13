import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { View } from '@actual-app/components/view';

import {
  CategoryInspectorProvider,
  useCategoryInspector,
} from '#fork/CategoryInspectorContext';
import { CategoryInspectorPanel } from '#fork/CategoryInspectorPanel';
import { InspectorPanel } from '#fork/InspectorPanel';
import { MonthInspectorBody } from '#fork/MonthInspectorBody';
import { useCategory } from '#hooks/useCategory';
import { useSyncedPref } from '#hooks/useSyncedPref';

type CategoryInspectorLayoutProps = {
  /** The month to describe until the table reports the months it shows */
  month: string;
  onBudgetAction: (month: string, action: string, args?: unknown) => void;
  children: ReactNode;
};

/**
 * Wraps the desktop budget table and puts the inspector beside it. On wide
 * windows it is always there, showing the month until a category is
 * selected; on narrower ones it floats over the table while a category is
 * selected. Envelope budgets only; a tracking budget is rendered as it was.
 */
export function CategoryInspectorLayout({
  month,
  onBudgetAction,
  children,
}: CategoryInspectorLayoutProps) {
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');

  if (budgetType !== 'envelope') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <CategoryInspectorProvider fallbackMonth={month}>
      <BudgetWithInspector onBudgetAction={onBudgetAction}>
        {children}
      </BudgetWithInspector>
    </CategoryInspectorProvider>
  );
}

function BudgetWithInspector({
  onBudgetAction,
  children,
}: Omit<CategoryInspectorLayoutProps, 'month'>) {
  const { t } = useTranslation();
  const { selectedCategoryId, clearCategory, month } = useCategoryInspector();
  const { data: category } = useCategory(selectedCategoryId);
  const { isWideWidth } = useResponsive();

  return (
    <View style={{ flex: 1, flexDirection: 'row', minWidth: 0 }}>
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
      {category ? (
        <CategoryInspectorPanel
          category={category}
          month={month}
          onBudgetAction={onBudgetAction}
          onClose={clearCategory}
          // Below the wide breakpoint the table has no width to give up
          isOverlay={!isWideWidth}
        />
      ) : (
        isWideWidth && (
          <InspectorPanel title={t('Month summary')} testId="month-inspector">
            <MonthInspectorBody month={month} onBudgetAction={onBudgetAction} />
          </InspectorPanel>
        )
      )}
    </View>
  );
}
