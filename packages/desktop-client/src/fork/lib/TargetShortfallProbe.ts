import { useEffect, useRef } from 'react';

import type { CategoryEntity } from '@actual-app/core/types/models';

import { useCategoryTarget } from '#fork/lib/targetProgress';
import { getAssignableShortfall } from '#fork/lib/underfunded';

type TargetShortfallProbeProps = {
  category: CategoryEntity;
  onChange: (
    categoryId: CategoryEntity['id'],
    shortfall: number | null,
  ) => void;
};

/**
 * Reports how much one category's target still needs in the month of the
 * surrounding sheet. Renders nothing; the month inspector mounts one per
 * category to add up "Underfunded", since hooks can't run in a loop.
 */
export function TargetShortfallProbe({
  category,
  onChange,
}: TargetShortfallProbeProps) {
  const shortfall = getAssignableShortfall(useCategoryTarget(category));

  // Report through a ref so a new callback from the parent doesn't re-run
  // the effects: each run sets the parent's state, which would render it
  // again and hand down yet another callback
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    onChangeRef.current(category.id, shortfall);
  }, [category.id, shortfall]);

  // Forget the category once it is no longer counted
  useEffect(() => () => onChangeRef.current(category.id, null), [category.id]);

  return null;
}
