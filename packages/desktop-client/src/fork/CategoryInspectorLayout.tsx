import type { ReactNode } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { View } from '@actual-app/components/view';

import {
  CategoryInspectorProvider,
  useCategoryInspector,
} from '#fork/CategoryInspectorContext';
import { CategoryInspectorPanel } from '#fork/CategoryInspectorPanel';
import { useCategory } from '#hooks/useCategory';
import { useSyncedPref } from '#hooks/useSyncedPref';

type CategoryInspectorLayoutProps = {
  /** The month the inspector describes: the first one on screen */
  month: string;
  onBudgetAction: (month: string, action: string, args?: unknown) => void;
  children: ReactNode;
};

/**
 * Wraps the desktop budget table and puts the category inspector beside it
 * while a category is selected. Envelope budgets only; a tracking budget is
 * rendered as it was.
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
    <CategoryInspectorProvider>
      <BudgetWithInspector month={month} onBudgetAction={onBudgetAction}>
        {children}
      </BudgetWithInspector>
    </CategoryInspectorProvider>
  );
}

function BudgetWithInspector({
  month,
  onBudgetAction,
  children,
}: CategoryInspectorLayoutProps) {
  const { selectedCategoryId, clearCategory } = useCategoryInspector();
  const { data: category } = useCategory(selectedCategoryId);
  const { isWideWidth } = useResponsive();

  return (
    <View style={{ flex: 1, flexDirection: 'row', minWidth: 0 }}>
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
      {category && (
        <CategoryInspectorPanel
          category={category}
          month={month}
          onBudgetAction={onBudgetAction}
          onClose={clearCategory}
          // Below the wide breakpoint the table has no width to give up
          isOverlay={!isWideWidth}
        />
      )}
    </View>
  );
}
