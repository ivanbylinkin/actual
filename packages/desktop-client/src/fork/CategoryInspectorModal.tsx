import { useTranslation } from 'react-i18next';

import { MobileSheet } from '#components/mobile/MobileSheet';
import { MobileSheetRow } from '#components/mobile/MobileSheetRow';
import { CategoryInspectorBody } from '#fork/CategoryInspectorBody';
import { useCategory } from '#hooks/useCategory';
import type { Modal as ModalType } from '#modals/modalsSlice';

type CategoryInspectorModalProps = Extract<
  ModalType,
  { name: 'category-inspector' }
>['options'];

/**
 * The mobile inspector: the same content as the desktop panel in a bottom
 * sheet, plus a way through to the category's settings.
 */
export function CategoryInspectorModal({
  categoryId,
  month,
  onBudgetAction,
  onOpenCategoryMenu,
}: CategoryInspectorModalProps) {
  const { t } = useTranslation();
  const { data: category } = useCategory(categoryId);

  if (!category) {
    return null;
  }

  return (
    <MobileSheet name="category-inspector" title={category.name}>
      <CategoryInspectorBody
        category={category}
        month={month}
        onBudgetAction={onBudgetAction}
        isTouch
      />
      <MobileSheetRow
        label={t('Category settings')}
        onPress={onOpenCategoryMenu}
      />
    </MobileSheet>
  );
}
