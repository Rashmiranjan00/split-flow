/**
 * SplitFlow "Warm Minimalist Finance" design tokens.
 *
 * Source: Stitch project 16404945722807422720 `designMd`
 * (Inter font, teal primary #006C4F with accent #00C896, warm coral #FF6B6B,
 *  background #FCF9F8, 16px cards, 12px buttons).
 *
 * The `ThemeColors` interface lists only keys that are actually read by the
 * codebase. Semantic roles:
 *   - `tertiary`  = positive / owed-to-you (teal, alias of primary)
 *   - `error`     = negative / you-owe (coral, alias of danger)
 *   - `primaryFixedDim` = light mint background for avatars and selected pills
 *   - `brandAccent`     = vibrant teal for FAB, chart bars, toggle-on states
 *   - `brandDark`       = dark teal text on light-mint backgrounds
 */

export interface ThemeColors {
  background: string;
  surface: string;

  surfaceContainer: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  primary: string;
  onPrimary: string;
  primaryFixedDim: string;
  brandAccent: string;
  brandDark: string;

  tertiary: string;
  tertiaryContainer: string;

  error: string;
  danger: string;
  dangerLight: string;

  secondary: string;

  onSurface: string;
  onSurfaceVariant: string;

  divider: string;
  outlineVariant: string;
}

/** SplitFlow Clear / Warm Minimalist Finance */
export const ClearLight: ThemeColors = {
  background: '#FCF9F8',
  surface: '#FCF9F8',

  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F6F3F2',
  surfaceContainer: '#F0EDED',
  surfaceContainerHigh: '#EAE7E7',
  surfaceContainerHighest: '#E5E2E1',

  primary: '#006C4F',
  onPrimary: '#FFFFFF',
  primaryFixedDim: '#60FCC6',
  brandAccent: '#00C896',
  brandDark: '#004D38',

  tertiary: '#006C4F',
  tertiaryContainer: '#FFDAD8',

  error: '#FF6B6B',
  danger: '#FF6B6B',
  dangerLight: '#FFDAD6',

  secondary: '#AE2F34',

  onSurface: '#1C1B1B',
  onSurfaceVariant: '#6C7A72',

  divider: '#F0F0F0',
  outlineVariant: '#F0F0F0',
};
