import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { InspectorSection } from '#fork/InspectorSection';
import { getAvailablePillColors } from '#fork/lib/availableState';
import { useCategoryTarget } from '#fork/lib/targetProgress';
import { TargetProgressBar } from '#fork/TargetProgressBar';
import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useFormat } from '#hooks/useFormat';
import { collapseModals, pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

type InspectorTargetProps = {
  category: CategoryEntity;
  month: string;
  isTouch?: boolean;
};

/**
 * The category's target: what it asks for, how far it is funded and a way to
 * change it. Targets are Actual's goal templates.
 */
export function InspectorTarget({
  category,
  month,
  isTouch = false,
}: InspectorTargetProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const dispatch = useDispatch();
  const canEditTarget = useFeatureFlag('goalTemplatesUIEnabled');
  const target = useCategoryTarget(category);

  const onEditTarget = () => {
    // On mobile the editor replaces the inspector sheet rather than stacking
    dispatch(collapseModals({ rootModalName: 'category-inspector' }));
    dispatch(
      pushModal({
        modal: {
          name: 'category-automations-edit',
          options: { categoryId: category.id, month },
        },
      }),
    );
  };

  const editButton = canEditTarget && (
    <Button
      onPress={onEditTarget}
      style={{
        alignSelf: 'flex-start',
        marginTop: 4,
        ...(isTouch && { minHeight: 44, padding: '0 16px' }),
      }}
    >
      {target ? <Trans>Edit target</Trans> : <Trans>Add a target</Trans>}
    </Button>
  );

  if (!target) {
    return (
      <InspectorSection title={<Trans>Target</Trans>}>
        <Text style={{ color: theme.pageTextLight }}>
          <Trans>This category has no target.</Trans>
        </Text>
        {editButton}
      </InspectorSection>
    );
  }

  const goal = format(target.goal, 'financial');
  const have = format(target.have, 'financial');
  const shortfall = format(target.shortfall, 'financial');

  return (
    <InspectorSection title={<Trans>Target</Trans>}>
      <PrivacyFilter>
        <Text>
          {target.isLongGoal
            ? t('Save up {{goal}}', { goal })
            : t('Assign {{goal}} this month', { goal })}
        </Text>
      </PrivacyFilter>
      <TargetProgressBar category={category} height={8} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <PrivacyFilter>
          <FinancialText style={{ color: theme.pageTextLight }}>
            {t('{{have}} of {{goal}}', { have, goal })}
          </FinancialText>
        </PrivacyFilter>
        <PrivacyFilter>
          <Text
            style={{
              ...getAvailablePillColors(
                target.isFunded ? 'funded' : 'underfunded',
              ),
              flexShrink: 0,
              padding: '1px 8px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {target.isFunded
              ? t('Funded')
              : t('{{shortfall}} to go', { shortfall })}
          </Text>
        </PrivacyFilter>
      </View>
      {editButton}
    </InspectorSection>
  );
}
