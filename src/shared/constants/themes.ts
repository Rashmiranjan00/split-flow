/**
 * SplitFlow "Warm Minimalist Finance" Design Tokens.
 *
 * Source: Stitch project 16404945722807422720, `designMd` spec
 * (Warm Minimalist Finance — Inter font, teal primary #006C4F + accent #00C896,
 *  warm coral #FF6B6B, background #FCF9F8, 16px cards, 12px buttons).
 *
 * The `ThemeColors` interface keeps every Luxe key so that the ~15 files that
 * already read `theme.colors.primaryContainer`, `tertiary`, `error`, etc. keep
 * compiling without downstream edits. Values are remapped semantically:
 *   - `tertiary`   → teal (positive balance) — was Luxe orange/peach
 *   - `error`      → warm coral (you-owe)    — was Luxe Material red
 *   - `primary`    → dark teal (CTAs)
 *   - `primaryContainer` → vibrant teal (FAB, bar chart, toggles)
 *   - `primaryFixedDim`  → light mint (avatar bg, selected pill bg)
 *   - `onPrimaryFixed`   → WHITE (fixes the Home FAB icon-on-teal bug)
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceContainer: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  surfaceBright: string;
  surfaceDim: string;
  surfaceTint: string;

  primary: string;
  primaryContainer: string;
  primaryFixedDim: string;
  onPrimary: string;
  onPrimaryContainer: string;
  onPrimaryFixed: string;

  secondary: string;
  secondaryContainer: string;

  tertiary: string;
  tertiaryContainer: string;

  error: string;
  errorContainer: string;
  onError: string;

  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  onSecondaryContainer: string;

  outline: string;
  outlineVariant: string;

  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // Legacy glassmorphism keys — kept for API compat only. No glass effect.
  glassFill: string;
  glassBorder: string;

  // Additive keys introduced for "Warm Minimalist Finance" call-sites.
  brandAccent: string;   // #00C896 vibrant teal — FAB, bar-chart, toggle-on
  brandDark: string;     // #004D38 initials / text-on-light-mint
  danger: string;        // #FF6B6B warm coral — alias of `error`
  dangerLight: string;   // #FFDAD6 tint — alias of `errorContainer`
  divider: string;       // #F0F0F0 row divider
  rowPressed: string;    // #F6F3F2 row press-state
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
  surfaceVariant: '#E5E2E1',
  surfaceBright: '#FCF9F8',
  surfaceDim: '#DCD9D9',
  surfaceTint: '#006C4F',

  primary: '#006C4F',
  primaryContainer: '#00C896',
  primaryFixedDim: '#60FCC6',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#004D38',
  onPrimaryFixed: '#FFFFFF',

  secondary: '#AE2F34',
  secondaryContainer: '#FF6B6B',

  tertiary: '#006C4F',
  tertiaryContainer: '#FFDAD8',

  error: '#FF6B6B',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',

  onBackground: '#1C1B1B',
  onSurface: '#1C1B1B',
  onSurfaceVariant: '#6C7A72',
  onSecondaryContainer: '#6D0010',

  outline: '#6C7A72',
  outlineVariant: '#F0F0F0',

  inverseSurface: '#313030',
  inverseOnSurface: '#F3F0EF',
  inversePrimary: '#3ADFAB',

  glassFill: 'transparent',
  glassBorder: '#F0F0F0',

  brandAccent: '#00C896',
  brandDark: '#004D38',
  danger: '#FF6B6B',
  dangerLight: '#FFDAD6',
  divider: '#F0F0F0',
  rowPressed: '#F6F3F2',
};

/**
 * Legacy exports. The dark-first Luxe palette has been retired for this revamp.
 * Both names now alias `ClearLight` so existing imports compile unchanged.
 */
export const LuxeDark: ThemeColors = ClearLight;
export const LuxeLight: ThemeColors = ClearLight;
