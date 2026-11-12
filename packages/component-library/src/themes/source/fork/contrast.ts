import type { ThemeName, TokenDefinition, TokenValue } from '../types';

type Palette = Record<string, string>;
type Colors = Record<string, TokenDefinition>;

/**
 * Follows a token through `ref`s down to the palette hex it resolves to, or
 * null when it ends in a raw CSS value that can't be measured.
 */
export function resolveTokenHex(
  name: string,
  theme: ThemeName,
  colors: Colors,
  palette: Palette,
): string | null {
  const definition = colors[name];
  if (!definition) {
    throw new Error(`unknown token "${name}"`);
  }
  const value: TokenValue =
    'all' in definition ? definition.all : definition[theme];
  if (typeof value === 'string') {
    return palette[value] ?? null;
  }
  if ('ref' in value) {
    return resolveTokenHex(value.ref, theme, colors, palette);
  }
  return /^#[0-9a-f]{6}$/i.test(value.raw) ? value.raw : null;
}

function channelToLinear(channel: number) {
  const scaled = channel / 255;
  return scaled <= 0.04045
    ? scaled / 12.92
    : Math.pow((scaled + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string) {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  return (
    0.2126 * channelToLinear(red) +
    0.7152 * channelToLinear(green) +
    0.0722 * channelToLinear(blue)
  );
}

/** WCAG 2.1 contrast ratio between two `#rrggbb` colours. */
export function contrastRatio(first: string, second: string) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}
