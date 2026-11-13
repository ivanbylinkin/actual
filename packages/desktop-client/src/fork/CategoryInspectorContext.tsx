import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { getInspectedMonth } from '#fork/lib/inspectorMonth';

type CategoryInspectorContextValue = {
  /** Whether an inspector is on this page at all */
  isAvailable: boolean;
  selectedCategoryId: CategoryEntity['id'] | null;
  /** Selects the category, or deselects it when it is already selected */
  toggleCategory: (id: CategoryEntity['id']) => void;
  selectCategory: (id: CategoryEntity['id']) => void;
  clearCategory: () => void;
  /** The month the inspector describes, always one that is on screen */
  month: string;
  setMonth: (month: string) => void;
  /** The months the budget table shows, oldest first */
  visibleMonths: string[];
  setVisibleMonths: (months: string[]) => void;
};

function doNothing() {
  // Nothing to do without an inspector
}

const noInspector: CategoryInspectorContextValue = {
  isAvailable: false,
  selectedCategoryId: null,
  toggleCategory: doNothing,
  selectCategory: doNothing,
  clearCategory: doNothing,
  month: monthUtils.currentMonth(),
  setMonth: doNothing,
  visibleMonths: [],
  setVisibleMonths: doNothing,
};

const CategoryInspectorContext =
  createContext<CategoryInspectorContextValue>(noInspector);

type CategoryInspectorProviderProps = {
  /** The month to describe until the table reports which months it shows */
  fallbackMonth: string;
  children: ReactNode;
};

/**
 * Holds what the desktop inspector shows: which category, if any, and
 * which of the months on screen.
 */
export function CategoryInspectorProvider({
  fallbackMonth,
  children,
}: CategoryInspectorProviderProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    CategoryEntity['id'] | null
  >(null);
  const [pickedMonth, setPickedMonth] = useState<string | null>(null);
  const [visibleMonths, setVisibleMonthsState] = useState<string[]>([]);

  return (
    <CategoryInspectorContext.Provider
      value={{
        isAvailable: true,
        selectedCategoryId,
        toggleCategory: id =>
          setSelectedCategoryId(current => (current === id ? null : id)),
        selectCategory: setSelectedCategoryId,
        clearCategory: () => setSelectedCategoryId(null),
        month: getInspectedMonth(
          pickedMonth,
          visibleMonths,
          monthUtils.currentMonth(),
          fallbackMonth,
        ),
        setMonth: setPickedMonth,
        visibleMonths,
        // Keep the same array while the months are the same, so reporting
        // them on every render doesn't cause another one
        setVisibleMonths: months =>
          setVisibleMonthsState(current =>
            current.join() === months.join() ? current : months,
          ),
      }}
    >
      {children}
    </CategoryInspectorContext.Provider>
  );
}

/**
 * The inspector's selection. Outside a provider nothing is selected and
 * selecting does nothing, so rows work unchanged where there is no inspector.
 */
export function useCategoryInspector() {
  return useContext(CategoryInspectorContext);
}
