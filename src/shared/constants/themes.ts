/**
 * SplitFlow Luxe Design Tokens
 * Source: Stitch project 8279022266749790484
 * Design Systems: "SplitFlow Luxe" (dark) & "SplitFlow Luxe Light" (light)
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

  // Glassmorphism helpers
  glassFill: string;
  glassBorder: string;
}

/** SplitFlow Luxe — Dark Mode */
export const LuxeDark: ThemeColors = {
  background: '#131313',
  surface: '#131313',
  surfaceContainer: '#201f1f',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  surfaceVariant: '#353534',
  surfaceBright: '#3a3939',
  surfaceDim: '#131313',
  surfaceTint: '#c0c1ff',

  primary: '#c0c1ff',
  primaryContainer: '#8083ff',
  primaryFixedDim: '#c0c1ff',
  onPrimary: '#1000a9',
  onPrimaryContainer: '#0d0096',
  onPrimaryFixed: '#07006c',

  secondary: '#c0c1ff',
  secondaryContainer: '#42447b',

  tertiary: '#ffb783',
  tertiaryContainer: '#d97721',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',

  onBackground: '#e5e2e1',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#c7c4d7',
  onSecondaryContainer: '#b2b3f2',

  outline: '#908fa0',
  outlineVariant: '#464554',

  inverseSurface: '#e5e2e1',
  inverseOnSurface: '#313030',
  inversePrimary: '#494bd6',

  // Glassmorphism: surfaceVariant at 60% opacity, outlineVariant at 40%
  glassFill: 'rgba(53, 53, 52, 0.6)',
  glassBorder: 'rgba(70, 69, 84, 0.4)',
};

/** SplitFlow Luxe Light */
export const LuxeLight: ThemeColors = {
  background: '#f7f9fb',
  surface: '#f7f9fb',
  surfaceContainer: '#eceef0',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainerHigh: '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',
  surfaceVariant: '#e0e3e5',
  surfaceBright: '#f7f9fb',
  surfaceDim: '#d8dadc',
  surfaceTint: '#494bd6',

  primary: '#4648d4',
  primaryContainer: '#6063ee',
  primaryFixedDim: '#c0c1ff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#fffbff',
  onPrimaryFixed: '#07006c',

  secondary: '#505f76',
  secondaryContainer: '#d0e1fb',

  tertiary: '#904900',
  tertiaryContainer: '#b55d00',

  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',

  onBackground: '#191c1e',
  onSurface: '#191c1e',
  onSurfaceVariant: '#464554',
  onSecondaryContainer: '#54647a',

  outline: '#767586',
  outlineVariant: '#c7c4d7',

  inverseSurface: '#2d3133',
  inverseOnSurface: '#eff1f3',
  inversePrimary: '#c0c1ff',

  // Glassmorphism: surface at 80% opacity with outline-variant whisper
  glassFill: 'rgba(247, 249, 251, 0.8)',
  glassBorder: 'rgba(199, 196, 215, 0.15)',
};
