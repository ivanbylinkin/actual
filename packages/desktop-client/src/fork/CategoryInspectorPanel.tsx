import type { CategoryEntity } from '@actual-app/core/types/models';

import { CategoryInspectorBody } from '#fork/CategoryInspectorBody';
import { InspectorPanel } from '#fork/InspectorPanel';

type CategoryInspectorPanelProps = {
  category: CategoryEntity;
  month: string;
  onBudgetAction: (month: string, action: string, args?: unknown) => void;
  onClose: () => void;
  /** Float over the budget instead of taking width from it */
  isOverlay?: boolean;
};

/** The desktop inspector for one category. */
export function CategoryInspectorPanel({
  category,
  month,
  onBudgetAction,
  onClose,
  isOverlay = false,
}: CategoryInspectorPanelProps) {
  return (
    <InspectorPanel
      title={category.name}
      onClose={onClose}
      isOverlay={isOverlay}
      testId="category-inspector"
    >
      <CategoryInspectorBody
        category={category}
        month={month}
        onBudgetAction={onBudgetAction}
      />
    </InspectorPanel>
  );
}
