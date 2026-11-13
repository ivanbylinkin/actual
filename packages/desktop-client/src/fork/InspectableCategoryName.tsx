import { useTranslation } from 'react-i18next';

import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme } from '@actual-app/components/theme';
import type { CategoryEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { useCategoryInspector } from '#fork/CategoryInspectorContext';

type InspectableCategoryNameProps = {
  category: Pick<CategoryEntity, 'id' | 'name'>;
  canInspect: boolean;
};

/**
 * The category name in the desktop budget sidebar. Where the category can
 * be inspected it can also take keyboard focus, and Enter or Space opens
 * the inspector. Clicks are left to the row, which already opens it, and
 * the name handles no pointer events, so dragging the row is unaffected.
 */
export function InspectableCategoryName({
  category,
  canInspect,
}: InspectableCategoryNameProps) {
  const { t } = useTranslation();
  const { isAvailable, selectedCategoryId, toggleCategory, clearCategory } =
    useCategoryInspector();
  const name = (
    <TextOneLine data-testid="category-name">{category.name}</TextOneLine>
  );

  if (!isAvailable || !canInspect) {
    return name;
  }

  const isInspected = selectedCategoryId === category.id;

  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={isInspected}
      aria-label={t('Inspect {{categoryName}}', {
        categoryName: category.name,
      })}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          // The row's own Enter handler is for renaming
          event.stopPropagation();
          toggleCategory(category.id);
        } else if (event.key === 'Escape' && isInspected) {
          event.stopPropagation();
          clearCategory();
        }
      }}
      className={css({
        display: 'flex',
        minWidth: 0,
        borderRadius: 3,
        outline: 'none',
        '&:focus-visible': {
          boxShadow: `0 0 0 2px ${theme.buttonPrimaryBackground}`,
        },
      })}
    >
      {name}
    </span>
  );
}
