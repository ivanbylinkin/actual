import { theme } from '@actual-app/components/theme';
import type { TFunction } from 'i18next';

export type ReadyToAssignState = 'positive' | 'negative' | 'zero';

/** Money waiting for a job, more assigned than there is, or neither. */
export function getReadyToAssignState(
  amount: number | null | undefined,
): ReadyToAssignState {
  if (!amount) {
    return 'zero';
  }
  return amount < 0 ? 'negative' : 'positive';
}

type BannerColors = { backgroundColor: string; color: string };

const bannerColors: Record<ReadyToAssignState, BannerColors> = {
  positive: {
    backgroundColor: theme.readyToAssignPositiveBackground,
    color: theme.readyToAssignPositiveText,
  },
  negative: {
    backgroundColor: theme.readyToAssignNegativeBackground,
    color: theme.readyToAssignNegativeText,
  },
  zero: {
    backgroundColor: theme.readyToAssignZeroBackground,
    color: theme.readyToAssignZeroText,
  },
};

export function getReadyToAssignColors(state: ReadyToAssignState) {
  return bannerColors[state];
}

/**
 * The line under the amount. It says in words what the colour says, so the
 * state never rests on colour alone.
 */
export function getReadyToAssignStatus(
  state: ReadyToAssignState,
  t: TFunction,
) {
  switch (state) {
    case 'negative':
      return t('You assigned more than you have');
    case 'zero':
      return t('All money is assigned');
    default:
      return t('Assign it to your categories');
  }
}
