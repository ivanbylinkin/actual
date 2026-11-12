import { useId } from 'react';
import type { ReactNode } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type InspectorSectionProps = {
  title: ReactNode;
  children: ReactNode;
};

/** A titled block of the category inspector, divided from the one above. */
export function InspectorSection({ title, children }: InspectorSectionProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      style={{
        padding: '14px 16px 16px',
        borderTop: `1px solid ${theme.tableBorder}`,
      }}
    >
      <Text
        id={titleId}
        style={{
          display: 'block',
          marginBottom: 8,
          fontSize: 13,
          fontWeight: 600,
          color: theme.pageTextLight,
        }}
      >
        {title}
      </Text>
      <View style={{ gap: 6 }}>{children}</View>
    </section>
  );
}
