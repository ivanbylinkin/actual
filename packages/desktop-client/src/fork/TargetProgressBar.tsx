import type { CSSProperties } from 'react';
import { ProgressBar } from 'react-aria-components';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { useCategoryTarget } from '#fork/lib/targetProgress';

type TargetProgressBarProps = {
  category: Pick<CategoryEntity, 'id' | 'is_income' | 'name' | 'goal_def'>;
  height?: number;
  style?: CSSProperties;
};

/**
 * A thin bar showing how much of a category's target is funded: amber while
 * it fills, green once the target is met. Draws nothing for a category
 * without a target.
 */
export function TargetProgressBar({
  category,
  height = 3,
  style,
}: TargetProgressBarProps) {
  const { t } = useTranslation();
  const target = useCategoryTarget(category);

  if (!target || target.goal <= 0) {
    return null;
  }

  return (
    <ProgressBar
      value={target.progress}
      aria-label={t('Target progress for {{categoryName}}', {
        categoryName: category.name,
      })}
      data-target-funded={target.isFunded}
      style={{ display: 'block', pointerEvents: 'none', ...style }}
    >
      <View
        style={{
          height,
          borderRadius: height,
          backgroundColor: theme.tableBorder,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${target.progress}%`,
            borderRadius: height,
            backgroundColor: target.isFunded
              ? theme.templateNumberFunded
              : theme.templateNumberUnderFunded,
          }}
        />
      </View>
    </ProgressBar>
  );
}
