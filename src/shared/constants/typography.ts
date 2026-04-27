/**
 * Typography scale for the SplitFlow "Warm Minimalist Finance" design system.
 *
 * Font family: Inter (loaded via @expo-google-fonts/inter in src/app/_layout.tsx).
 * Size ramp matches the Stitch spec (balance-display 48, section-header 13,
 * body 15, label 12).
 */
export const Typography = {
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  sizes: {
    displayLg: 48,
    displayMd: 40,
    displaySm: 32,
    headlineLg: 28,
    headlineMd: 24,
    headlineSm: 20,
    titleLg: 20,
    titleMd: 17,
    titleSm: 15,
    bodyLg: 16,
    bodyMd: 15,
    bodySm: 13,
    labelLg: 13,
    labelMd: 12,
    labelSm: 11,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,
};
