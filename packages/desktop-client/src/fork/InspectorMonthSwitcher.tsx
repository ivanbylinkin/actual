import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgCheveronLeft,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useCategoryInspector } from '#fork/CategoryInspectorContext';
import { getAdjacentVisibleMonth } from '#fork/lib/inspectorMonth';
import { useLocale } from '#hooks/useLocale';

/**
 * Which month the desktop inspector describes, with arrows to step through
 * the other months on screen. Without them, quick assign would always act
 * on the leftmost month whichever one the user was looking at.
 */
export function InspectorMonthSwitcher() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { month, setMonth, visibleMonths } = useCategoryInspector();

  const previous = getAdjacentVisibleMonth(month, visibleMonths, -1);
  const next = getAdjacentVisibleMonth(month, visibleMonths, 1);
  const hasArrows = visibleMonths.length > 1;

  const arrowStyle = { padding: 6, color: theme.pageTextLight };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        flexShrink: 0,
        padding: '0 10px 8px 16px',
        marginTop: -6,
      }}
    >
      <Text
        aria-live="polite"
        style={{ fontSize: 13, color: theme.pageTextLight }}
      >
        {monthUtils.format(month, 'MMMM yyyy', locale)}
      </Text>
      {hasArrows && (
        <View style={{ flexDirection: 'row' }}>
          <Button
            variant="bare"
            aria-label={t('Previous month on screen')}
            isDisabled={previous == null}
            onPress={() => previous && setMonth(previous)}
            style={arrowStyle}
          >
            <SvgCheveronLeft width={12} height={12} />
          </Button>
          <Button
            variant="bare"
            aria-label={t('Next month on screen')}
            isDisabled={next == null}
            onPress={() => next && setMonth(next)}
            style={arrowStyle}
          >
            <SvgCheveronRight width={12} height={12} />
          </Button>
        </View>
      )}
    </View>
  );
}
