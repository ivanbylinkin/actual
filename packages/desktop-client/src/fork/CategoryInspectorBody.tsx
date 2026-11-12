import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { InspectorBreakdown } from '#fork/InspectorBreakdown';
import { InspectorQuickAssign } from '#fork/InspectorQuickAssign';
import { InspectorTarget } from '#fork/InspectorTarget';
import { SheetNameProvider } from '#hooks/useSheetName';

type CategoryInspectorBodyProps = {
  category: CategoryEntity;
  month: string;
  onBudgetAction: (month: string, action: string, args?: unknown) => void;
  /** Taller rows and buttons for touch, used by the mobile sheet */
  isTouch?: boolean;
};

/**
 * What the inspector shows for one category in one month: where its
 * available balance comes from, its target and the quick-assign actions.
 * Shared by the desktop panel and the mobile sheet.
 */
export function CategoryInspectorBody({
  category,
  month,
  onBudgetAction,
  isTouch = false,
}: CategoryInspectorBodyProps) {
  return (
    <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
      <InspectorBreakdown category={category} month={month} />
      <InspectorTarget category={category} month={month} isTouch={isTouch} />
      <InspectorQuickAssign
        category={category}
        month={month}
        onBudgetAction={onBudgetAction}
        isTouch={isTouch}
      />
    </SheetNameProvider>
  );
}
