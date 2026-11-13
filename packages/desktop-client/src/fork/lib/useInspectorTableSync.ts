import { useEffect } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { useCategoryInspector } from '#fork/CategoryInspectorContext';
import { getVisibleMonths } from '#fork/lib/inspectorMonth';

type InspectorTableSyncOptions = {
  startMonth: string;
  numMonths: number;
  monthBounds: { start: string; end: string };
};

/**
 * Connects the desktop budget table to the inspector. Called by the table,
 * it tells the inspector which months are on screen and returns what to do
 * when an Assigned cell starts editing: the inspector follows that category
 * and month, as YNAB's does. That also makes it reachable from the
 * keyboard, since Enter and Tab move the editor from row to row.
 *
 * The inspector only jumps to a category on its own where it is always on
 * screen (wide windows), or when it already shows one; elsewhere it floats
 * over the table and would cover the cell being edited.
 */
export function useInspectorTableSync({
  startMonth,
  numMonths,
  monthBounds,
}: InspectorTableSyncOptions) {
  const {
    isAvailable,
    selectedCategoryId,
    selectCategory,
    setMonth,
    setVisibleMonths,
  } = useCategoryInspector();
  const { isWideWidth } = useResponsive();

  const visibleMonthsKey = getVisibleMonths(
    startMonth,
    numMonths,
    monthBounds,
  ).join(',');

  useEffect(() => {
    setVisibleMonths(visibleMonthsKey ? visibleMonthsKey.split(',') : []);
  }, [visibleMonthsKey, setVisibleMonths]);

  const onEditCell = (id: CategoryEntity['id'] | null, month: string) => {
    if (!isAvailable || !id) {
      return;
    }
    setMonth(month);
    if (isWideWidth || selectedCategoryId != null) {
      selectCategory(id);
    }
  };

  return { onEditCell };
}
