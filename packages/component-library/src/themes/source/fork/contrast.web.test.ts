import { colors } from '../colors';
import { palette } from '../palette';
import { themeNames } from '../types';

import { contrastRatio, resolveTokenHex } from './contrast';

// Text on a filled surface this fork adds. Each pair must meet WCAG AA for
// body text in every built-in theme.
const textOnSurfacePairs = [
  ['availableFundedText', 'availableFundedBackground'],
  ['availableUnderfundedText', 'availableUnderfundedBackground'],
  ['availableOverspentText', 'availableOverspentBackground'],
  ['availableZeroText', 'availableZeroBackground'],
] as const;

describe('contrastRatio', () => {
  it('measures black on white as 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('measures a colour against itself as 1:1', () => {
    expect(contrastRatio('#3355aa', '#3355aa')).toBe(1);
  });
});

describe('fork tokens', () => {
  const cases = themeNames.flatMap(themeName =>
    textOnSurfacePairs.map(
      ([text, surface]) => [themeName, text, surface] as const,
    ),
  );

  it.each(cases)(
    '%s: %s on %s is at least 4.5:1',
    (themeName, text, surface) => {
      const textHex = resolveTokenHex(text, themeName, colors, palette);
      const surfaceHex = resolveTokenHex(surface, themeName, colors, palette);

      expect(textHex).not.toBeNull();
      expect(surfaceHex).not.toBeNull();
      expect(
        contrastRatio(textHex ?? '', surfaceHex ?? ''),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );
});
