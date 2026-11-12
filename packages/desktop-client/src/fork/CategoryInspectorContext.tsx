import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import type { CategoryEntity } from '@actual-app/core/types/models';

type CategoryInspectorContextValue = {
  selectedCategoryId: CategoryEntity['id'] | null;
  /** Selects the category, or deselects it when it is already selected */
  toggleCategory: (id: CategoryEntity['id']) => void;
  clearCategory: () => void;
};

const noSelection: CategoryInspectorContextValue = {
  selectedCategoryId: null,
  toggleCategory: () => {
    // Nothing to select without an inspector
  },
  clearCategory: () => {
    // Nothing to clear without an inspector
  },
};

const CategoryInspectorContext =
  createContext<CategoryInspectorContextValue>(noSelection);

type CategoryInspectorProviderProps = {
  children: ReactNode;
};

/** Holds which category the desktop inspector panel is showing. */
export function CategoryInspectorProvider({
  children,
}: CategoryInspectorProviderProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    CategoryEntity['id'] | null
  >(null);

  return (
    <CategoryInspectorContext.Provider
      value={{
        selectedCategoryId,
        toggleCategory: id =>
          setSelectedCategoryId(current => (current === id ? null : id)),
        clearCategory: () => setSelectedCategoryId(null),
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
