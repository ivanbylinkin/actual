import * as monthUtils from '@actual-app/core/shared/months';

import { InspectorAutoAssign } from '#fork/InspectorAutoAssign';
import { InspectorMonthSummary } from '#fork/InspectorMonthSummary';
import { SheetNameProvider } from '#hooks/useSheetName';

type MonthInspectorBodyProps = {
  month: string;
  onBudgetAction: (month: string, action: string, args?: unknown) => void;
};

/**
 * What the desktop inspector shows while no category is selected, as
 * YNAB's does: the month's totals and Auto-Assign.
 */
export function MonthInspectorBody({
  month,
  onBudgetAction,
}: MonthInspectorBodyProps) {
  return (
    <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
      <InspectorMonthSummary month={month} />
      <InspectorAutoAssign month={month} onBudgetAction={onBudgetAction} />
    </SheetNameProvider>
  );
}
